import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::homepage.homepage', () => ({
  async find(ctx) {
    ctx.query = {
      status: 'published',
      populate: { hero: { populate: {
        announcementLink: true, primaryCta: true, backgroundImage: true,
        backgroundImageMobile: true, backgroundVideo: true,
        trustedClients: { populate: { logo: true } },
      } }, portfolioProofPoints: { populate: { backgroundLeft: true, backgroundRight: true, metrics: true } } },
    };
    return super.find(ctx);
  },
}));
