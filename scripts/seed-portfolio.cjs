const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Use this seed against the local CMS only.');
  process.env.CAPITAR_SEED = 'false';
  process.env.CAPITAR_SEED_VENTURE_DEBT = 'false';
  process.env.CAPITAR_SEED_PORTFOLIO = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    const entry = await app.documents('api::portfolio.portfolio').findFirst({ status: 'published', populate: ['companies'] });
    if (!entry) throw new Error('An existing Portfolio draft was preserved. Publish it in the CMS.');
    console.log(`Portfolio ready: ${entry.documentId}; companies=${entry.companies.length}`);
  } finally {
    // Allow Strapi's bootstrap background queries to settle before closing SQLite.
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
