import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::global.global', () => ({
  async find(ctx) {
    ctx.query = { status: 'published', populate: { brandLogo: true, navigation: true, headerCta: true,
      footer: { populate: { brandLogo: true, backgroundImage: true, backgroundVideo: true, navigation: true,
        socialLinks: true, legalLinks: true, cta: true, aiLinks: { populate: { icon: true } },
      } },
    } };
    return super.find(ctx);
  },
}));
