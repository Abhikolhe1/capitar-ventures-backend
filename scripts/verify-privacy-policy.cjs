const assert = require('node:assert/strict');
const base = process.env.CAPITAR_CMS_URL || 'http://127.0.0.1:3035';
async function main() {
  const response = await fetch(base+'/api/privacy-policy');
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.ok(data.publishedAt);
  assert.ok(data.title && data.sections.length && data.illustration.url);
  assert.ok(data.sections.every(section => section.heading && Array.isArray(section.blocks)));
  const draftQuery = await (await fetch(base+'/api/privacy-policy?status=draft&populate=*')).json();
  assert.equal(draftQuery.data.id, data.id, 'Public queries must return only the published document');
  const image = await fetch(new URL(data.illustration.url, base));
  assert.equal(image.status, 200);
  assert.ok((await image.arrayBuffer()).byteLength > 0);
  const global = await (await fetch(base+'/api/global')).json();
  assert.ok(global.data.navigation.length);
  const footer = global.data.footer;
  assert.ok(footer.registrationLabel && footer.registrationDetails);
  assert.equal(footer.legalLinks.find(link=>/^privacy$/i.test(link.label)).href, '/privacy-policy');
  for (const media of [footer.brandLogo, footer.backgroundImage, ...footer.aiLinks.map(link=>link.icon)].filter(Boolean)) {
    const asset = await fetch(new URL(media.url, base));
    assert.equal(asset.status, 200);
    assert.ok((await asset.arrayBuffer()).byteLength > 0);
  }
  console.log(`Published privacy API verified: ${data.sections.length} sections, populated illustration, draft query protected.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
