const assert = require('node:assert/strict');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const app = createStrapi(await compileStrapi());
  await app.load();
  const uid = 'api::homepage.homepage';
  const populate = { hero: { populate: { trustedClients: { populate: { logo: true } } } }, portfolioProofPoints: { populate: { metrics: true, backgroundLeft: true, backgroundRight: true } } };
  let original;
  let documentId;
  try {
    const home = await app.documents(uid).findFirst({ status: 'published', populate });
    documentId = home.documentId;
    assert.equal(home.hero.trustedClients.length, 5);
    assert.equal(home.portfolioProofPoints.sectionLabel, 'PORTFOLIO & PROOF POINTS');
    assert.equal(home.portfolioProofPoints.metrics.length, 4);
    assert.ok(home.portfolioProofPoints.backgroundLeft.url.startsWith('/uploads/'));
    const proof = home.portfolioProofPoints;
    original = { enabled: proof.enabled, sectionLabel: proof.sectionLabel, heading: proof.heading, mutedText: proof.mutedText, backgroundLeft: proof.backgroundLeft.id, backgroundRight: proof.backgroundRight.id, metrics: proof.metrics.map(({ value, prefix, valueSuffix, suffix, label }) => ({ value, prefix, valueSuffix, suffix, label })) };
    await app.documents(uid).update({ documentId, status: 'published', data: { portfolioProofPoints: { ...original, heading: 'CMS verification statement', enabled: false } } });
    const updated = await app.documents(uid).findFirst({ status: 'published', populate });
    assert.equal(updated.portfolioProofPoints.heading, 'CMS verification statement');
    assert.equal(updated.portfolioProofPoints.enabled, false);
    assert.equal(updated.hero.heading, home.hero.heading);
    console.log('Phase 2 published CMS update/visibility/media/order and Hero preservation checks passed.');
  } finally {
    if (original && documentId) await app.documents(uid).update({ documentId, status: 'published', data: { portfolioProofPoints: original } });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
