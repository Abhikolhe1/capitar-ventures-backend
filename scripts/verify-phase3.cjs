const assert = require('node:assert/strict');
const { compileStrapi, createStrapi } = require('@strapi/strapi');
async function main() {
  const app = createStrapi(await compileStrapi());
  await app.load();
  const uid = 'api::homepage.homepage';
  const populate = {
    hero: { populate: { trustedClients: { populate: { logo: true } } } },
    portfolioProofPoints: { populate: { metrics: true } },
    capitalEfficiency: { populate: { backgroundImage: true, benefits: { populate: { icon: true, artwork: true } } } },
  };
  let original, documentId;
  try {
    const home = await app.documents(uid).findFirst({status:'published',populate});
    documentId = home.documentId;
    const capital = home.capitalEfficiency;
    assert.equal(capital.sectionLabel, 'CAPITAL EFFICIENCY');
    assert.equal(capital.benefits.length,4);
    assert.equal(home.hero.trustedClients.length,5);
    assert.equal(home.portfolioProofPoints.metrics.length,4);
    original = {enabled:capital.enabled,sectionLabel:capital.sectionLabel,heading:capital.heading,description:capital.description,backgroundImage:capital.backgroundImage.id,
      benefits:capital.benefits.map(({title,description,layout,artworkWidth,icon,artwork})=>({title,description,layout,artworkWidth,icon:icon?.id,artwork:artwork?.id}))};
    for (const b of capital.benefits) {
      assert.ok(b.icon.url.startsWith('/uploads/'));
      assert.ok(b.artwork.url.startsWith('/uploads/'));
      assert.ok(b.artwork.alternativeText);
    }
    const heroBefore = JSON.stringify(home.hero, (key,value)=>key==='id'?undefined:value);
    const proofBefore = JSON.stringify(home.portfolioProofPoints, (key,value)=>key==='id'?undefined:value);
    await app.documents(uid).update({documentId,status:'published',data:{capitalEfficiency:JSON.parse(JSON.stringify({...original,enabled:false,heading:'CMS publication verification',benefits:[...original.benefits].reverse()}))}});
    const edited = await app.documents(uid).findFirst({status:'published',populate});
    assert.equal(edited.capitalEfficiency.enabled,false);
    assert.equal(edited.capitalEfficiency.heading,'CMS publication verification');
    assert.equal(edited.capitalEfficiency.benefits[0].title,original.benefits.at(-1).title);
    assert.equal(JSON.stringify(edited.hero,(key,value)=>key==='id'?undefined:value),heroBefore);
    assert.equal(JSON.stringify(edited.portfolioProofPoints,(key,value)=>key==='id'?undefined:value),proofBefore);
    console.log('Phase 3 CMS checks passed: publication, edit, disable, reorder, all media/alt text, preserved Hero and Portfolio.');
  } finally {
    try {
      if (original && documentId) await app.documents(uid).update({documentId,status:'published',data:{capitalEfficiency:JSON.parse(JSON.stringify(original))}});
    } finally {
      await new Promise(resolve=>setTimeout(resolve,1000));
      await app.destroy();
    }
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
