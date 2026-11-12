import { factories } from '@strapi/strapi';

const populate = {
  logo: true,
  heroImage: true,
  metrics: true,
  sections: true,
  quote: true,
  cta: true,
} as const;

// Only published case studies reach public clients; query parameters cannot widen this.
export default factories.createCoreController('api::case-study.case-study', ({ strapi }) => ({
  async find(ctx) {
    const data = await strapi.documents('api::case-study.case-study').findMany({
      status: 'published',
      fields: ['slug', 'companyName'],
      sort: 'companyName:asc',
    });
    ctx.body = { data };
  },
  async findBySlug(ctx) {
    const slug = String(ctx.params.slug || '');
    if (!/^[a-z0-9-_.~]+$/i.test(slug)) return ctx.notFound();
    const data = await strapi.documents('api::case-study.case-study').findFirst({
      status: 'published',
      filters: { slug },
      populate,
    });
    if (!data) return ctx.notFound();
    ctx.body = { data };
  },
}));
