import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog.blog', () => ({
  async find(ctx) {
    // Public queries cannot request drafts or add unreviewed relations.
    ctx.query = {
      status: 'published',
      populate: {
        hero: { populate: { image: true } },
        categories: true,
        featured: { populate: { image: true } },
        latest: true,
        newsletter: { populate: { artwork: true } },
      },
    };
    return super.find(ctx);
  },
}));
