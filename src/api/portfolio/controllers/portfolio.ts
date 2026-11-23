import { factories } from '@strapi/strapi';

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;

const int = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
};
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

type Company = { name?: unknown; sector?: unknown; stage?: unknown };

// Public clients can only read the published document and these explicit relations.
export default factories.createCoreController('api::portfolio.portfolio', ({ strapi }) => ({
  async find(ctx) {
    // Companies are served page by page from /api/portfolio/companies.
    ctx.query = {
      status: 'published',
      populate: {
        hero: { populate: { backgroundImage: true, cta: true } },
        featuredStories: { populate: { items: { populate: { image: true, logo: true, link: true } } } },
        companiesSection: true,
        conversation: { populate: { backgroundImage: true, cta: true } },
      },
    };
    return super.find(ctx);
  },

  // GET /api/portfolio/companies?limit=9&skip=0&sector=&stage=
  // Companies are a repeatable component on a single type, so filtering and
  // slicing happen here; the response carries the total and every filter option.
  async companies(ctx) {
    const limit = int(ctx.query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
    const skip = int(ctx.query.skip, 0, 0, Number.MAX_SAFE_INTEGER);
    const sector = text(ctx.query.sector);
    const stage = text(ctx.query.stage);

    const document = await strapi.documents('api::portfolio.portfolio').findFirst({
      status: 'published',
      populate: { companies: { populate: { logo: true, founder: true } } },
    });
    if (!document) return ctx.notFound('Published Portfolio content is unavailable');

    const sanitized = (await strapi.contentAPI.sanitize.output(
      document,
      strapi.getModel('api::portfolio.portfolio'),
      { auth: ctx.state.auth }
    )) as { companies?: Company[] };
    // Same rule as the website: companies without a name are not shown.
    const all = (sanitized.companies ?? []).filter((company) => text(company.name));
    const matches = all.filter(
      (company) =>
        (!sector || text(company.sector) === sector) && (!stage || text(company.stage) === stage)
    );

    ctx.body = {
      data: matches.slice(skip, skip + limit),
      meta: {
        pagination: { total: matches.length, limit, skip },
        sectors: unique(all.map((company) => text(company.sector))),
        stages: unique(all.map((company) => text(company.stage))),
      },
    };
  },
}));
