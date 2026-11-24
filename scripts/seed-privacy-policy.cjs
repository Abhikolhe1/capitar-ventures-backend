const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('This seed command is for the local CMS only.');
  for (const key of ['CAPITAR_SEED', 'CAPITAR_SEED_VENTURE_DEBT', 'CAPITAR_SEED_PORTFOLIO', 'CAPITAR_SEED_ABOUT_US', 'CAPITAR_SEED_BLOG']) process.env[key] = 'false';
  process.env.CAPITAR_SEED_PRIVACY_POLICY = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    const entry = await app.documents('api::privacy-policy.privacy-policy').findFirst({ status: 'published', populate: ['sections', 'illustration'] });
    if (!entry) throw new Error('An existing privacy draft was preserved. Publish it in the CMS.');
    const { seedPrivacyPolicy } = require('../dist/src/seed-privacy-policy');
    await seedPrivacyPolicy(app);
    const repeated = await app.documents('api::privacy-policy.privacy-policy').findFirst({ status: 'published', populate: ['sections', 'illustration'] });
    if (repeated.documentId !== entry.documentId || repeated.updatedAt !== entry.updatedAt || repeated.illustration.id !== entry.illustration.id)
      throw new Error('Privacy seed must preserve existing content on reruns.');
    console.log(`Privacy Policy ready: ${entry.sections.length} sections; illustration=${!!entry.illustration}`);
    console.log('Verified: repeated seed preserves the existing published policy and image.');
  } finally {
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
