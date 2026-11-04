import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::venture-debt.venture-debt', () => ({
  async find(ctx) {
    ctx.query = { status: 'published', populate: {
      timeline: true, hero: { populate: { primaryCta: true, secondaryCta: true, backgroundImage: true, glassImage: true, glowImage: true } },
      before: { populate: { image: true, glowImage: true, items: { populate: { image: true } } } },
      process: { populate: { decoration: true, items: true } },
      practice: { populate: { cta: true, image: true, outcomeSprite: true, items: { populate: { icon: true } } } },
      faq: { populate: { items: true } },
    } };
    return super.find(ctx);
  },
}));
