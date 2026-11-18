import fs from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

export async function seedBlog(strapi: Core.Strapi) {
  if (process.env.CAPITAR_SEED_BLOG !== 'true') return;
  const uid = 'api::blog.blog' as const;
  const articleUid = 'api::blog-article.blog-article' as const;
  const pageExists = await strapi.documents(uid).findFirst({ status: 'draft' }) ||
    await strapi.documents(uid).findFirst({ status: 'published' });
  const articlesExist = await strapi.documents(articleUid).count({ status: 'draft' }) > 0 ||
    await strapi.documents(articleUid).count({ status: 'published' }) > 0;
  if (pageExists && articlesExist) return;
  const frontend = path.resolve(process.env.CAPITAR_FRONTEND_PATH || '../capitar-ventures-frontend');
  const content = JSON.parse(await fs.readFile(path.join(frontend, 'src/content/blog.json'), 'utf8'));
  const upload = async (url: string, alternativeText = '') => {
    const filepath = path.resolve(frontend, 'public', `.${url}`);
    const allowed = path.resolve(frontend, 'public/assets/blog') + path.sep;
    if (!url.startsWith('/assets/blog/') || !filepath.startsWith(allowed)) throw new Error('Unexpected blog seed asset');
    const name = `blog-${path.basename(filepath)}`;
    const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
    if (existing) return existing.id;
    const { size } = await fs.stat(filepath);
    const mimetype = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[path.extname(filepath).toLowerCase()];
    if (!mimetype) throw new Error('Unsupported blog image');
    const files = await strapi.plugin('upload').service('upload').upload({
      data: { fileInfo: { name, alternativeText } },
      files: { filepath, originalFilename: name, mimetype, size },
    });
    return files[0].id;
  };
  // Articles are their own collection so the public API can return one page at a time.
  if (!articlesExist) {
    for (const item of content.latest.articles) {
      const card = { ...content.latest.articleCopy, ...item };
      delete card.id;
      if (!card.date) card.date = null;
      card.image = await upload(item.image);
      await strapi.documents(articleUid).create({ status: 'published', data: card });
    }
    strapi.log.info(`Seeded ${content.latest.articles.length} Blog Articles.`);
  }
  if (pageExists) return;
  delete content.latest.articles;
  delete content.latest.articleCopy;
  content.hero.image = await upload(content.hero.image);
  content.featured.image = await upload(content.featured.image, content.featured.imageAlt);
  content.newsletter.artwork = await upload(content.newsletter.artwork);
  content.newsletter.enabled = true;
  content.categories = content.categories.map((label: string) => ({ label }));
  await strapi.documents(uid).create({ status: 'published', data: { title: 'News & Insights', ...content } });
  strapi.log.info('Seeded Blog with original Figma assets, preserving existing editorial content.');
}
