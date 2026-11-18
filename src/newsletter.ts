import crypto from 'node:crypto';
import type { Core } from '@strapi/strapi';

const ARTICLE = 'api::blog-article.blog-article' as const;
const SUBSCRIBER = 'api::newsletter-subscription.newsletter-subscription' as const;
const BATCH = 200;
// Small, steady sending pace so ordinary mailboxes (Gmail, Outlook, Zoho…) don't throttle.
const PARALLEL = 2;

export const newUnsubscribeToken = () => crypto.randomBytes(24).toString('hex');
export const isUnsubscribeToken = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{48}$/.test(value);

const trimSlash = (value: string) => value.replace(/\/+$/, '');
const siteUrl = () => trimSlash(process.env.PUBLIC_SITE_URL || 'http://localhost:3039');
const cmsUrl = () => trimSlash(process.env.PUBLIC_CMS_URL || `http://localhost:${process.env.PORT || 1337}`);
const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Absolute, safe link for the email: the article's own link, otherwise the blog listing.
function articleLink(href: unknown) {
  if (typeof href === 'string' && href.trim()) {
    const value = href.trim();
    if (value.startsWith('/') && !value.startsWith('//')) return siteUrl() + value;
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch { /* fall through */ }
  }
  return `${siteUrl()}/blog`;
}

type Article = { title?: string | null; description?: string | null; category?: string | null; href?: string | null; image?: { url?: string } | null };

export function articleEmail(article: Article, unsubscribeUrl: string) {
  const link = articleLink(article.href);
  const imageUrl = article.image?.url ? (article.image.url.startsWith('/') ? cmsUrl() + article.image.url : article.image.url) : '';
  const plainTitle = article.title || 'New article';
  const title = escape(plainTitle);
  const description = article.description ? escape(article.description) : '';
  const category = article.category ? escape(article.category.toUpperCase()) : 'NEWS &amp; INSIGHTS';
  const subject = `New from Capitar Ventures: ${plainTitle}`;
  const text = [
    'New on Capitar Ventures News & Insights',
    '',
    plainTitle,
    article.description || '',
    '',
    `Read it: ${link}`,
    '',
    `You are receiving this because you subscribed on capitar.com. Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n');
  const html = `<!doctype html><html><body style="margin:0;background:#f4f5f8;font-family:Arial,Helvetica,sans-serif;color:#121212">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0b0f2d;padding:24px 32px;color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:.04em">CAPITAR VENTURES</td></tr>
${imageUrl ? `<tr><td><img src="${escape(imageUrl)}" alt="" width="600" style="display:block;width:100%;height:auto"></td></tr>` : ''}
<tr><td style="padding:32px">
<p style="margin:0 0 12px;font-size:12px;font-weight:bold;letter-spacing:.08em;color:#cc2334">${category}</p>
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;font-weight:normal;color:#193969">${title}</h1>
${description ? `<p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#444">${description}</p>` : ''}
<a href="${escape(link)}" style="display:inline-block;background:#cc2334;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:24px;font-size:15px">Read the article</a>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #ececf0;font-size:12px;line-height:1.6;color:#777">
You are receiving this because you subscribed to Capitar Ventures News &amp; Insights.<br>
<a href="${escape(unsubscribeUrl)}" style="color:#777">Unsubscribe</a>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}

// Emails every subscriber about a newly published article, once per article.
export async function notifySubscribers(strapi: Core.Strapi, documentId: string) {
  if (!process.env.SMTP_HOST) {
    strapi.log.info('Newsletter: SMTP is not configured in .env; new-article email skipped.');
    return;
  }
  const article = await strapi.documents(ARTICLE).findOne({ documentId, status: 'published', populate: { image: true } });
  if (!article) return;
  // Claim the article first (draft and published rows), so a repeated or concurrent
  // publish can never email subscribers twice.
  const claimed = await strapi.db.query(ARTICLE).updateMany({
    where: { documentId, newsletterSentAt: null },
    data: { newsletterSentAt: new Date() },
  });
  if (!claimed.count) return;

  const email = strapi.plugin('email').service('email');
  let sent = 0;
  let failed = 0;
  for (let offset = 0; ; offset += BATCH) {
    const subscribers = await strapi.db.query(SUBSCRIBER).findMany({
      select: ['id', 'email', 'unsubscribeToken'],
      orderBy: { id: 'asc' },
      offset,
      limit: BATCH,
    });
    if (!subscribers.length) break;
    for (let index = 0; index < subscribers.length; index += PARALLEL) {
      await Promise.all(subscribers.slice(index, index + PARALLEL).map(async (subscriber) => {
        try {
          let token = subscriber.unsubscribeToken;
          if (!isUnsubscribeToken(token)) {
            token = newUnsubscribeToken();
            await strapi.db.query(SUBSCRIBER).update({ where: { id: subscriber.id }, data: { unsubscribeToken: token } });
          }
          const unsubscribeUrl = `${cmsUrl()}/api/newsletter-subscriptions/unsubscribe?token=${token}`;
          const message = articleEmail(article, unsubscribeUrl);
          await email.send({
            to: subscriber.email,
            ...message,
            // Lets Gmail/Outlook show their own one-click "Unsubscribe" button.
            headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
          });
          sent += 1;
        } catch (error) {
          failed += 1;
          strapi.log.warn(`Newsletter: could not email subscriber #${subscriber.id}: ${(error as Error).message}`);
        }
      }));
    }
  }
  strapi.log.info(`Newsletter for "${article.title}": ${sent} sent, ${failed} failed.`);
}

// Runs after a Blog Article is published. Sending happens in the background so the
// editor's Publish click is not held up by email delivery.
export function registerNewsletterOnPublish(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    const result = await next();
    if (context.uid === ARTICLE && context.action === 'publish') {
      const documentId = (context.params as { documentId?: string }).documentId;
      if (documentId) {
        setImmediate(() => {
          notifySubscribers(strapi, documentId).catch((error) =>
            strapi.log.error(`Newsletter sending failed: ${(error as Error).message}`));
        });
      }
    }
    return result;
  });
}
