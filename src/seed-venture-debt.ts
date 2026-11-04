import fs from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

// Explicit opt-in; never replace either draft or published editorial content.
export async function seedVentureDebt(strapi: Core.Strapi) {
  if (process.env.CAPITAR_SEED_VENTURE_DEBT !== 'true') return;
  const uid = 'api::venture-debt.venture-debt' as const;
  if (await strapi.documents(uid).findFirst({ status: 'draft' }) || await strapi.documents(uid).findFirst({ status: 'published' })) return;
  const frontend = path.resolve(process.cwd(), '../capitar-ventures-frontend');
  const content = JSON.parse(await fs.readFile(process.env.CAPITAR_VENTURE_DEBT_CONTENT || path.join(frontend, 'src/content/venture-debt.json'), 'utf8'));
  const convert = async (value: unknown): Promise<unknown> => {
    if (Array.isArray(value)) return Promise.all(value.map(convert));
    if (!value || typeof value !== 'object') return value;
    const item = value as Record<string, unknown>;
    if (typeof item.url === 'string') {
      if (!item.url.startsWith('/assets/venture-debt/')) throw new Error('Unexpected venture debt seed asset');
      const name = `venture-debt-${path.basename(item.url)}`;
      const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
      if (existing) return existing.id;
      const filepath = path.join(frontend, 'public/assets/venture-debt', path.basename(item.url));
      const { size } = await fs.stat(filepath);
      const uploaded = await strapi.plugin('upload').service('upload').upload({
        data: { fileInfo: { name, alternativeText: item.alternativeText || '' } },
        files: { filepath, originalFilename: name, mimetype: name.endsWith('.svg') ? 'image/svg+xml' : 'image/png', size },
      });
      return uploaded[0].id;
    }
    return Object.fromEntries(await Promise.all(Object.entries(item).map(async ([key, child]) => [key, await convert(child)])));
  };
  const data = await convert(content);
  await strapi.documents(uid).create({ status: 'published', data: data as never });
  strapi.log.info('Seeded Venture Debt page. Existing content is never overwritten.');
}
