import { factories } from '@strapi/strapi';

// Public clients can only read the published document and these explicit relations.
export default factories.createCoreController('api::portfolio.portfolio', () => ({
  async find(ctx) {
    ctx.query = {
      status: 'published',
      populate: {
        hero: { populate: { backgroundImage: true, cta: true } },
        featuredStories: { populate: { items: { populate: { image: true, logo: true, link: true } } } },
        companiesSection: true,
        companies: { populate: { logo: true, founder: true } },
        conversation: { populate: { backgroundImage: true, cta: true } },
      },
    };
    return super.find(ctx);
  },
}));
