import { factories } from '@strapi/strapi';

const MAX_PAGE_SIZE = 30;
// Every order ends with the id so equal dates/titles still page deterministically.
const SORTS = {
  latest: [{ date: 'desc' }, { id: 'desc' }],
  oldest: [{ date: 'asc' }, { id: 'asc' }],
  title: [{ title: 'asc' }, { id: 'asc' }],
} as const;

const integer = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// GET /api/blog-articles?page=1&pageSize=9&category=Growth&sort=latest
// The database applies the filter, order, limit and offset; only one page is returned.
// Drafts can never be requested, and no other query options are accepted.
export default factories.createCoreController('api::blog-article.blog-article', ({ strapi }) => ({
  async find(ctx) {
    const query = ctx.query as Record<string, unknown>;
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, integer(query.pageSize, 9)));
    const page = Math.max(1, integer(query.page, 1));
    const sort = SORTS[String(query.sort) as keyof typeof SORTS] ?? SORTS.latest;
    const category = typeof query.category === 'string' ? query.category.trim().slice(0, 100) : '';
    const filters = category ? { category: { $eq: category } } : {};
    const documents = strapi.documents('api::blog-article.blog-article');
    const [data, total] = await Promise.all([
      documents.findMany({
        status: 'published',
        filters,
        sort: sort as never,
        start: (page - 1) * pageSize,
        limit: pageSize,
        fields: ['title', 'category', 'description', 'date', 'imageAlt', 'href'],
        populate: { image: { fields: ['url', 'alternativeText', 'width', 'height'] } },
      }),
      documents.count({ status: 'published', filters }),
    ]);
    ctx.body = {
      data,
      meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } },
    };
  },
}));
