import type { Context } from 'koa';

import { isUnsubscribeToken, newUnsubscribeToken } from '../../../newsletter';

const page = (title: string, message: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0f2d;font-family:Arial,Helvetica,sans-serif;color:#fff;text-align:center;padding:24px">
<main><p style="letter-spacing:.08em;font-size:13px;color:#ffffffb3">CAPITAR VENTURES</p><h1 style="font-weight:normal;font-size:30px;margin:12px 0">${title}</h1><p style="color:#ffffffcc;max-width:420px;line-height:1.6">${message}</p>
<p><a href="${(process.env.PUBLIC_SITE_URL || '/').replace(/"/g, '')}" style="color:#fff">Back to Capitar Ventures</a></p></main></body></html>`;

// A small bounded per-process limiter; no IPs or emails are logged. A multi-node
// deployment should also apply its normal shared reverse-proxy rate limit.
const requests = new Map<string, { count: number; expires: number }>();
export default {
  async subscribe(ctx: Context) {
    const now = Date.now();
    for (const [key, value] of requests) if (value.expires <= now) requests.delete(key);
    const key = ctx.ip || 'unknown';
    const limit = requests.get(key) || { count: 0, expires: now + 60000 };
    if (limit.count >= 5 || (!requests.has(key) && requests.size >= 10000)) {
      ctx.set('Retry-After', '60');
      ctx.status = 429;
      ctx.body = { error: { message: 'Please try again later.' } };
      return;
    }
    limit.count += 1;
    requests.set(key, limit);
    const input = (ctx.request as { body?: unknown }).body;
    const email = input && typeof input === 'object' && 'email' in input && typeof input.email === 'string'
      ? input.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.status = 400;
      ctx.body = { error: { message: 'Enter a valid email address.' } };
      return;
    }
    const uid = 'api::newsletter-subscription.newsletter-subscription' as const;
    const existing = await strapi.db.query(uid).findOne({ where: { email } });
    if (!existing) {
      try {
        await strapi.documents(uid).create({ data: { email, consentedAt: new Date().toISOString(), source: 'blog', unsubscribeToken: newUnsubscribeToken() } });
      } catch (error) {
        // Concurrent identical requests can hit the unique constraint. They get
        // the same generic acknowledgement; unrelated failures remain failures.
        if (!await strapi.db.query(uid).findOne({ where: { email } })) throw error;
      }
    }
    ctx.status = 200;
    ctx.body = { data: { accepted: true } };
  },

  // GET: the link in every email. POST: the one-click button Gmail/Outlook show.
  // Unknown or reused tokens get the same answer, so addresses cannot be probed.
  async unsubscribe(ctx: Context) {
    const body = (ctx.request as { body?: unknown }).body;
    const token = ctx.query.token ?? (body && typeof body === 'object' && 'token' in body ? body.token : undefined);
    if (isUnsubscribeToken(token)) {
      await strapi.db.query('api::newsletter-subscription.newsletter-subscription').delete({ where: { unsubscribeToken: token } });
    }
    ctx.status = 200;
    if (ctx.method === 'POST') {
      ctx.body = { data: { unsubscribed: true } };
      return;
    }
    ctx.type = 'html';
    ctx.body = page('You have been unsubscribed', 'You will no longer receive Capitar Ventures News &amp; Insights emails. You can subscribe again at any time on our blog.');
  },
};
