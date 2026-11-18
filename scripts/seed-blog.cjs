const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Use this seed against the local CMS only.');
  for (const name of ['CAPITAR_SEED', 'CAPITAR_SEED_VENTURE_DEBT', 'CAPITAR_SEED_PORTFOLIO', 'CAPITAR_SEED_ABOUT_US']) process.env[name] = 'false';
  process.env.CAPITAR_SEED_BLOG = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    const page = await app.documents('api::blog.blog').findFirst({ status: 'published', populate: ['latest'] });
    if (!page) throw new Error('An existing draft was preserved. Publish Blog in the CMS.');
    const articles = await app.documents('api::blog-article.blog-article').count({ status: 'published' });
    console.log(`Blog ready: ${page.documentId}; articles=${articles}`);
  } finally {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
