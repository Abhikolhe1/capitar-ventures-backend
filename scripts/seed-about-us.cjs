const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Use this seed against the local CMS only.');
  process.env.CAPITAR_SEED = 'false';
  process.env.CAPITAR_SEED_VENTURE_DEBT = 'false';
  process.env.CAPITAR_SEED_PORTFOLIO = 'false';
  process.env.CAPITAR_SEED_ABOUT_US = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    const entry = await app.documents('api::about-us.about-us').findFirst({ status: 'published', populate: ['people.team', 'journey.milestones'] });
    if (!entry) throw new Error('An existing About Us draft was preserved. Publish it in the CMS.');
    console.log(`About Us ready: ${entry.documentId}; team=${entry.people.team.length}; milestones=${entry.journey.milestones.length}`);
  } finally {
    // Allow Strapi's bootstrap background queries to settle before closing SQLite.
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
