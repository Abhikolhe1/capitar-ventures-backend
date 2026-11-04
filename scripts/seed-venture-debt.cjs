const { compileStrapi, createStrapi } = require('@strapi/strapi');

// Uses the configured local CMS database. The bootstrap skips existing documents.
async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Run this seed against the local CMS only.');
  process.env.CAPITAR_SEED_VENTURE_DEBT = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    const entry = await app.documents('api::venture-debt.venture-debt').findFirst({ status: 'published', populate: { hero: true, before: { populate: ['items'] }, process: { populate: ['items'] }, practice: { populate: ['items'] }, faq: { populate: ['items'] } } });
    if (!entry) throw new Error('Venture Debt has an existing draft; publish it in the CMS.');
    console.log(`Venture Debt ready: ${entry.documentId}; signals=${entry.before.items.length}, steps=${entry.process.items.length}, outcomes=${entry.practice.items.length}, FAQs=${entry.faq.items.length}`);
  } finally { await new Promise(resolve => setTimeout(resolve, 1000)); await app.destroy(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
