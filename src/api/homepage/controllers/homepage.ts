import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::homepage.homepage', () => ({
  async find(ctx) {
    ctx.query = {
      status: 'published',
      populate: { hero: { populate: {
        announcementLink: true, primaryCta: true, backgroundImage: true,
        backgroundImageMobile: true, backgroundVideo: true,
        trustedClients: { populate: { logo: true } },
      } }, portfolioProofPoints: { populate: { backgroundLeft: true, backgroundRight: true, metrics: true } },
      capitalEfficiency: { populate: { backgroundImage: true, benefits: { populate: { icon: true, artwork: true } } } },
      caseStudy: { populate: { items: { populate: { image: true, logo: true, link: true } } } },
      capitarDifference: { populate: { cta: true, cardBackground: true, items: { populate: { image: true } } } } },
    };
    return super.find(ctx);
  },
}));
