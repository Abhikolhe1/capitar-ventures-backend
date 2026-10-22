import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::homepage.homepage', () => ({
  async find(ctx) {
    ctx.query = {
      status: 'published',
      populate: { hero: { populate: {
        // announcementLink: true, // Announcement banner temporarily disabled.
        primaryCta: true, backgroundImage: true,
        backgroundImageMobile: true, backgroundVideo: true, backgroundVideoMobile: true,
        trustedClients: { populate: { logo: true } },
      } }, portfolioProofPoints: { populate: { backgroundLeft: true, backgroundRight: true, metrics: true } },
      capitalEfficiency: { populate: { backgroundImage: true, benefits: { populate: { icon: true, artwork: true } } } },
      caseStudy: { populate: { items: { populate: { image: true, logo: true, link: true } } } },
      capitarDifference: { populate: { cta: true, cardBackground: true, items: { populate: { image: true } } } },
      team: { populate: { members: { populate: { portrait: true } } } },
      insightsNews: { populate: {
        insights: { populate: { cta: true, items: { populate: { image: true } } } },
        news: { populate: { cta: true, items: { populate: { image: true } } } },
      } },
      testimonials: { populate: { items: { populate: { portrait: true, companyLogo: true } } } } },
    };
    const result = await super.find(ctx);
    // Keep the saved CMS content so the announcement can be restored later.
    if (result.data?.hero) {
      delete result.data.hero.announcementText;
      delete result.data.hero.announcementLink;
    }
    return result;
  },
}));
