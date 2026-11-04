const assert = require('node:assert/strict');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  // Keep verification isolated from the editor's database and drafts.
  process.env.DATABASE_CLIENT = 'sqlite';
  process.env.DATABASE_FILENAME = `.tmp/venture-debt-verification-${process.pid}.db`;
  process.env.PORT = '3048';
  process.env.HOST = '127.0.0.1';
  process.env.CAPITAR_SEED = 'false';
  process.env.CAPITAR_SEED_VENTURE_DEBT = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    app.config.set('admin.autoOpen', false);
    await app.start();
    const uid = 'api::venture-debt.venture-debt';
    const read = async () => {
      const response = await fetch('http://127.0.0.1:3048/api/venture-debt');
      assert.equal(response.status, 200);
      return (await response.json()).data;
    };
    const original = await read();
    assert.equal(original.before.items.length, 4);
    assert.equal(original.process.items.length, 4);
    assert.equal(original.practice.items.length, 3);
    assert.equal(original.faq.items.length, 6);
    for (const section of ['hero','before','process','practice','faq']) assert.ok(original[section].sectionLabel);
    const image = await fetch(`http://127.0.0.1:3048${original.hero.backgroundImage.url}`);
    assert.equal(image.status, 200);
    assert.ok((await image.arrayBuffer()).byteLength > 0);
    const count = await app.db.query(uid).count();
    const { seedVentureDebt } = require('../dist/src/seed-venture-debt');
    await seedVentureDebt(app);
    assert.equal(await app.db.query(uid).count(), count, 'Seeding must be idempotent');
    const faq = { ...original.faq, heading: 'Draft FAQ heading', items: original.faq.items.map(({id,...item}) => item) };
    delete faq.id;
    await app.documents(uid).update({ documentId: original.documentId, status: 'draft', data: { faq } });
    assert.equal((await read()).faq.heading, original.faq.heading, 'Draft content must remain private');
    await app.documents(uid).publish({ documentId: original.documentId });
    assert.equal((await read()).faq.heading, 'Draft FAQ heading');
    assert.equal((await read()).before.items.length, 4, 'Publishing preserves other sections');
    const write = await fetch('http://127.0.0.1:3048/api/venture-debt', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({data:{title:'Unauthorized'}}) });
    assert.notEqual(write.status, 200, 'Public endpoint must be read-only');
    console.log('PASS: all sections, uploaded media, idempotent seed, private drafts, publish workflow, read-only API.');
  } finally {
    const media = await app.db.query('plugin::upload.file').findMany();
    for (const file of media) await app.plugin('upload').service('upload').remove(file);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
