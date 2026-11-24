import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::privacy-policy.privacy-policy', () => ({
  async find(ctx) {
    ctx.query = { status: 'published', populate: { illustration: true, sections: true } };
    return super.find(ctx);
  },
}));
