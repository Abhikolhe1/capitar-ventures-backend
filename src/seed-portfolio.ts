import fs from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

export async function seedPortfolio(strapi: Core.Strapi) {
  if (process.env.CAPITAR_SEED_PORTFOLIO !== 'true') return;
  const uid = 'api::portfolio.portfolio' as const;
  if (await strapi.documents(uid).findFirst({ status: 'draft' }) ||
      await strapi.documents(uid).findFirst({ status: 'published' })) return;
  const frontend = path.resolve(process.env.CAPITAR_FRONTEND_PATH || '../capitar-ventures-frontend');
  const content = JSON.parse(await fs.readFile(path.join(frontend, 'src/content/portfolio.json'), 'utf8'));
  const convert = async (value: unknown): Promise<unknown> => {
    if (Array.isArray(value)) return Promise.all(value.map(convert));
    if (!value || typeof value !== 'object') return value;
    const item = value as Record<string, unknown>;
    if (typeof item.url === 'string') {
      const filepath = path.resolve(frontend, 'public', `.${item.url}`);
      const allowed = path.resolve(frontend, 'public/assets') + path.sep;
      if (!item.url.startsWith('/assets/') || !filepath.startsWith(allowed)) throw new Error('Unexpected Portfolio seed asset');
      const name = `portfolio-${path.basename(filepath)}`;
      const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
      if (existing) return existing.id;
      const { size } = await fs.stat(filepath);
      const extension = path.extname(filepath).toLowerCase();
      const mimetype = { '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' }[extension];
      if (!mimetype) throw new Error('Unsupported Portfolio seed image');
      const uploaded = await strapi.plugin('upload').service('upload').upload({
        data: { fileInfo: { name, alternativeText: item.alternativeText || '' } },
        files: { filepath, originalFilename: name, mimetype, size },
      });
      return uploaded[0].id;
    }
    // JSON components from the frontend never contain Strapi database IDs.
    return Object.fromEntries(await Promise.all(Object.entries(item).map(async ([key, child]) => [key, await convert(child)])));
  };
  await strapi.documents(uid).create({ status: 'published', data: await convert(content) as never });
  strapi.log.info('Seeded Portfolio page without replacing existing editorial content.');
}
