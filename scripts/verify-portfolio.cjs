const assert = require('node:assert/strict');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  // Never use the editor's database for publish/write verification.
  process.env.DATABASE_CLIENT = 'sqlite';
  process.env.DATABASE_FILENAME = `.tmp/portfolio-verification-${process.pid}.db`;
  process.env.PORT = '3049';
  process.env.HOST = '127.0.0.1';
  process.env.CAPITAR_SEED = 'false';
  process.env.CAPITAR_SEED_VENTURE_DEBT = 'false';
  process.env.CAPITAR_SEED_PORTFOLIO = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    app.config.set('admin.autoOpen', false);
    await app.start();
    const uid = 'api::portfolio.portfolio';
    const read = async (suffix = '') => {
      const response = await fetch(`http://127.0.0.1:3049/api/portfolio${suffix}`);
      assert.equal(response.status, 200);
      return (await response.json()).data;
    };
    const original = await read();
    assert.equal(original.companies.length, 12);
    assert.equal(original.featuredStories.items.length, 4);
    assert.ok(original.hero.heading);
    assert.ok(original.companiesSection.heading);
    assert.ok(original.conversation.cta.href);
    for (const media of [original.hero.backgroundImage, original.companies[0].logo, original.featuredStories.items[0].image]) {
      const response = await fetch(`http://127.0.0.1:3049${media.url}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^image\//);
    }
    const count = await app.db.query(uid).count();
    await require('../dist/src/seed-portfolio').seedPortfolio(app);
    assert.equal(await app.db.query(uid).count(), count, 'Seeding preserves existing documents');
    await app.documents(uid).update({ documentId: original.documentId, status: 'draft', data: {
      conversation: { sectionLabel: 'NEXT CONVERSATION', heading: 'Draft-only headline', description: 'Draft description', cta: {label:'Contact',enabled:true,href:'/venture-debt'} },
      companies: [{key:'cms-company',name:'CMS Company',description:'CMS-managed company',sector:'Technology',stage:'Series A',founder:{name:'CMS Founder',role:'CEO'},logo:original.companies[0].logo.id}],
    } });
    assert.equal((await read('?status=draft&populate=*')).conversation.heading, original.conversation.heading, 'Draft query cannot expose unpublished content');
    assert.equal((await read()).companies.length, 12);
    await app.documents(uid).publish({ documentId: original.documentId });
    const published = await read();
    assert.equal(published.conversation.heading, 'Draft-only headline');
    assert.equal(published.companies.length, 1);
    assert.equal(published.companies[0].founder.name, 'CMS Founder');
    assert.ok(published.companies[0].logo.url);
    assert.equal(published.hero.heading, original.hero.heading, 'Other sections survive publishing');
    for (const method of ['POST','PUT','DELETE']) {
      const response = await fetch('http://127.0.0.1:3049/api/portfolio', {method,headers:{'Content-Type':'application/json'},body:JSON.stringify({data:{title:'Unauthorized'}})});
      assert.ok(response.status >= 400, `Public ${method} must not be allowed`);
    }
    await app.documents(uid).update({documentId:original.documentId,status:'draft',data:{companies:[]}});
    await app.documents(uid).publish({documentId:original.documentId});
    assert.deepEqual((await read()).companies, [], 'An intentional empty list stays empty');
    console.log('PASS: Portfolio sections, uploaded assets, company edits/order, seed idempotence, private drafts, publishing, read-only endpoint and empty list.');
  } finally {
    for (const file of await app.db.query('plugin::upload.file').findMany()) await app.plugin('upload').service('upload').remove(file);
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
