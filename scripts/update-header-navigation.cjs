const assert = require('node:assert/strict');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  process.env.CAPITAR_SEED = 'false';
  const app = createStrapi(await compileStrapi());
  await app.load();
  try {
    const documents = app.documents('api::global.global');
    const current = await documents.findFirst({ status: 'published', populate: ['navigation'] });
    assert.ok(current, 'Expected an existing global document');
    const navigation = current.navigation.flatMap(({ id, ...item }) => {
      if (item.label !== 'Our Offerings') return [item];
      return [
        { label: 'Venture Debt', enabled: false, showIndicator: false },
        { label: 'Growth Equity', enabled: false, showIndicator: false },
      ];
    });
    await documents.update({ documentId: current.documentId, status: 'published', data: { navigation } });
    const updated = await documents.findFirst({ status: 'published', populate: ['navigation'] });
    assert.deepEqual(updated.navigation.map(item => item.label), navigation.map(item => item.label));
    console.log('Header navigation updated:', updated.navigation.map(item => item.label).join(', '));
  } finally {
    await app.destroy();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
