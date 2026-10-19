import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::global.global', () => ({
  async find(ctx) {
    ctx.query = { status: 'published', populate: { brandLogo: true, navigation: true, headerCta: true } };
    return super.find(ctx);
  },
}));
