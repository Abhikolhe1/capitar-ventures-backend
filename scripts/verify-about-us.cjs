const assert = require('node:assert/strict');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  // Publish/write checks always use a separate database, preserving editorial content.
  process.env.DATABASE_CLIENT = 'sqlite';
  process.env.DATABASE_FILENAME = '.tmp/about-verification-' + process.pid + '.db';
  process.env.PORT = '3048';
  process.env.HOST = '127.0.0.1';
  process.env.CAPITAR_SEED = 'false';
  process.env.CAPITAR_SEED_VENTURE_DEBT = 'false';
  process.env.CAPITAR_SEED_PORTFOLIO = 'false';
  process.env.CAPITAR_SEED_ABOUT_US = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    app.config.set('admin.autoOpen', false);
    await app.start();
    const uid = 'api::about-us.about-us';
    const read = async (suffix = '') => {
      const response = await fetch('http://127.0.0.1:3048/api/about-us' + suffix);
      assert.equal(response.status, 200);
      return (await response.json()).data;
    };
    const original = await read();
    assert.equal(original.journey.milestones.length, 4);
    assert.equal(original.belief.items.length, 4);
    assert.equal(original.people.team.length, 9);
    assert.equal(original.artworks.length, 19);
    assert.ok(original.hero.cta.href);
    assert.ok(original.quote.statement);
    for (const media of [original.mission.image, ...original.artworks.map(item => item.image)]) {
      const response = await fetch('http://127.0.0.1:3048' + media.url);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^image\//);
    }
    const count = await app.db.query(uid).count();
    await require('../dist/src/seed-about-us').seedAboutUs(app);
    assert.equal(await app.db.query(uid).count(), count, 'Seed preserves existing content');
    await app.documents(uid).update({documentId:original.documentId,status:'draft',data:{
      hero: {label:original.hero.label,heading:'CMS About headline',emphasis:original.hero.emphasis,description:original.hero.description,cta:{label:'Contact us',href:'/portfolio',enabled:true}},
      people: {label:'Our team',heading:'CMS team',description:'Team description',biography:'Shared biography',team:[{name:'CMS Partner',role:'Partner',portrait:'rahul',biography:'Individual biography',image:original.mission.image.id,dark:false}]},
    }});
    assert.equal((await read('?status=draft&populate=*')).hero.heading, original.hero.heading, 'Public clients cannot read drafts');
    await app.documents(uid).publish({documentId:original.documentId});
    const published = await read();
    assert.equal(published.hero.heading, 'CMS About headline');
    assert.equal(published.people.team.length, 1);
    assert.equal(published.people.team[0].biography, 'Individual biography');
    assert.ok(published.people.team[0].image.url);
    assert.equal(published.quote.statement, original.quote.statement);
    for (const method of ['POST','PUT','DELETE']) {
      const response = await fetch('http://127.0.0.1:3048/api/about-us',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({data:{title:'Unauthorized'}})});
      assert.ok(response.status >= 400, 'Public writes must be denied');
    }
    await app.documents(uid).update({documentId:original.documentId,status:'draft',data:{people:{team:[]}}});
    await app.documents(uid).publish({documentId:original.documentId});
    assert.deepEqual((await read()).people.team, []);
    console.log('PASS: About Us sections, all 20 source assets, seed idempotence, draft privacy, publishing, custom portraits/biographies, empty lists and read-only API.');
  } finally {
    for (const file of await app.db.query('plugin::upload.file').findMany()) await app.plugin('upload').service('upload').remove(file);
    await app.destroy();
  }
}
main().catch(error => {console.error(error);process.exitCode=1;});
