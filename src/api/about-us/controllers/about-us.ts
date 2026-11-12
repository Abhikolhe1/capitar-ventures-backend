import { factories } from '@strapi/strapi';

// Only published content and explicitly populated relations reach public clients.
export default factories.createCoreController('api::about-us.about-us', () => ({
  async find(ctx) {
    ctx.query = {
      status: 'published',
      populate: {
        hero: { populate: { cta: true } },
        mission: { populate: { image: true } },
        journey: { populate: { milestones: true } },
        belief: { populate: { items: true } },
        people: { populate: { team: { populate: { image: true } } } },
        quote: true,
        artworks: { populate: { image: true } },
      },
    };
    return super.find(ctx);
  },
}));
