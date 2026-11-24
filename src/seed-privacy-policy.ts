import fs from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

// Explicit opt-in; existing privacy drafts and published editorial content survive reruns.
export async function seedPrivacyPolicy(strapi: Core.Strapi) {
  if (process.env.CAPITAR_SEED_PRIVACY_POLICY !== 'true') return;
  const uid = 'api::privacy-policy.privacy-policy' as const;
  const frontend = path.resolve(process.env.CAPITAR_FRONTEND_PATH || '../capitar-ventures-frontend');
  const content = JSON.parse(await fs.readFile(path.join(frontend, 'src/content/privacy-policy.json'), 'utf8'));
  if (!await strapi.documents(uid).findFirst({ status: 'draft' }) &&
      !await strapi.documents(uid).findFirst({ status: 'published' })) {
    const filepath = path.join(frontend, 'public/assets/privacy/privacy-illustration.png');
    const name = 'privacy-illustration.png';
    let image = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
    if (!image) {
      const { size } = await fs.stat(filepath);
      [image] = await strapi.plugin('upload').service('upload').upload({
        data: { fileInfo: { name, alternativeText: content.illustrationAlt } },
        files: { filepath, originalFilename: name, mimetype: 'image/png', size },
      });
    }
    const leaf = (text: string) => ({ type: 'text', text });
    const sections = content.sections.map((section: { heading: string; blocks: {kind: string; items: string[]}[] }) => ({
      heading: section.heading,
      blocks: section.blocks.flatMap<Record<string, unknown>>(block => block.kind === 'list'
        ? [{ type: 'list', format: 'unordered', children: block.items.map(text => ({ type: 'list-item', children: [leaf(text)] })) }]
        : block.items.map(text => ({ type: 'paragraph', children: [leaf(text)] }))),
    }));
    await strapi.documents(uid).create({ status: 'published', data: { title: content.title, illustration: image.id, sections } as never });
    strapi.log.info('Seeded Privacy Policy from Figma.');
  }

  // Add only the requested fields/link to existing global content; leave other footer settings intact.
  const defaults = JSON.parse(await fs.readFile(path.join(frontend, 'src/content/homepage.json'), 'utf8')).global.footer;
  const footerAsset = async (value: unknown): Promise<unknown> => {
    if (Array.isArray(value)) return Promise.all(value.map(footerAsset));
    if (!value || typeof value !== 'object') return value;
    const item = value as Record<string, unknown>;
    if (typeof item.url === 'string') {
      const filepath = path.resolve(frontend, 'public', `.${item.url}`);
      if (!item.url.startsWith('/assets/') || !filepath.startsWith(path.resolve(frontend, 'public/assets') + path.sep)) throw new Error('Invalid footer seed asset');
      const name = path.basename(filepath);
      const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
      if (existing) return existing.id;
      const mime = { '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webp': 'image/webp' }[path.extname(filepath)];
      if (!mime) throw new Error('Unsupported footer seed asset');
      const { size } = await fs.stat(filepath);
      const [uploaded] = await strapi.plugin('upload').service('upload').upload({
        data: { fileInfo: { name, alternativeText: item.alternativeText || '' } },
        files: { filepath, originalFilename: name, mimetype: mime, size },
      });
      return uploaded.id;
    }
    return Object.fromEntries(await Promise.all(Object.entries(item).map(async ([key, child]) => [key, await footerAsset(child)])));
  };
  const globalUid = 'api::global.global' as const;
  const populateGlobal = { brandLogo: true, navigation: true, headerCta: true, footer: {
    populate: { brandLogo: true, backgroundImage: true, backgroundVideo: true, navigation: true,
      socialLinks: true, legalLinks: true, cta: true, aiLinks: { populate: { icon: true } } },
  } } as const;
  const publishedGlobal = await strapi.documents(globalUid).findFirst({ status: 'published', populate: populateGlobal });
  if (publishedGlobal && !publishedGlobal.footer) {
    const draft = await strapi.documents(globalUid).findFirst({ status: 'draft', populate: populateGlobal });
    const clean = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(clean);
      if (!value || typeof value !== 'object') return value;
      const item = value as Record<string, unknown>;
      if (typeof item.url === 'string' && item.id) return item.id;
      return Object.fromEntries(Object.entries(item).filter(([key]) => !['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt'].includes(key)).map(([key, child]) => [key, clean(child)]));
    };
    const header = (entry: typeof publishedGlobal) => ({
      brandLogo: entry.brandLogo?.id, navigation: clean(entry.navigation), headerCta: clean(entry.headerCta),
    });
    const initialFooter = await footerAsset(defaults);
    await strapi.db.transaction(async () => {
      // Publish the missing footer with the already-public header, then restore any
      // unpublished header/footer edits. No unrelated draft copy becomes public.
      await strapi.documents(globalUid).update({ documentId: publishedGlobal.documentId, status: 'published',
        data: { ...header(publishedGlobal), footer: initialFooter } as never });
      if (draft) await strapi.documents(globalUid).update({ documentId: draft.documentId, status: 'draft',
        data: { ...header(draft), footer: draft.footer ? clean(draft.footer) : initialFooter } as never });
    });
  }
  for (const status of ['draft', 'published'] as const) {
    const global = await strapi.documents(globalUid).findFirst({ status, populate: { footer: { populate: { legalLinks: true } } } });
    if (!global) continue;
    if (!global.footer) {
      if (status === 'draft') {
        await strapi.documents(globalUid).update({ documentId: global.documentId, status: 'draft', data: { footer: await footerAsset(defaults) } as never });
        strapi.log.info('Initialized the missing Footer in the Global draft; publish Global to display CMS-managed footer content.');
      }
      continue;
    }
    const footer = global.footer;
    const privacy = footer.legalLinks?.find(link => /^privacy(?: policy)?$/i.test(link.label?.trim() || ''));
    const needsLink = !privacy || (!privacy.href && !privacy.enabled);
    const needsDetails = footer.registrationDetails == null;
    const needsLabel = footer.registrationLabel == null;
    if (!needsDetails && !needsLabel && !needsLink) continue;
    const update: Record<string, unknown> = {};
    if (needsDetails) update.registrationDetails = defaults.registrationDetails;
    if (needsLabel) update.registrationLabel = defaults.registrationLabel;
    // Updating these scalar component fields directly avoids publishing unrelated Global drafts.
    if (Object.keys(update).length) {
      await strapi.db.query('shared.footer').update({ where: { id: footer.id }, data: update });
    }
    if (needsLink && privacy) {
      await strapi.db.query('shared.link').update({ where: { id: privacy.id }, data: { href: '/privacy-policy', enabled: true } });
    } else if (needsLink && status === 'draft') {
      await strapi.documents(globalUid).update({ documentId: global.documentId, status: 'draft', data: { footer: {
        id: footer.id, legalLinks: [...(footer.legalLinks || []), { label: 'PRIVACY', href: '/privacy-policy', enabled: true }],
      } } as never });
      strapi.log.info('Added Privacy link to the Global draft; publish Global to display it.');
    }
  }
}
