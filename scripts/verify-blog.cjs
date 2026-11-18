const assert = require('node:assert/strict');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  process.env.DATABASE_CLIENT = 'sqlite';
  process.env.DATABASE_FILENAME = '.tmp/blog-verification-' + process.pid + '.db';
  process.env.PORT = process.env.VERIFY_PORT || '3049';
  process.env.HOST = '127.0.0.1';
  for (const key of ['CAPITAR_SEED', 'CAPITAR_SEED_VENTURE_DEBT', 'CAPITAR_SEED_PORTFOLIO', 'CAPITAR_SEED_ABOUT_US']) process.env[key] = 'false';
  process.env.CAPITAR_SEED_BLOG = 'true';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    app.config.set('admin.autoOpen', false);
    await app.start();
    const origin = 'http://127.0.0.1:' + process.env.PORT;
    const uid = 'api::blog.blog';
    const read = async (query = '') => {
      const response = await fetch(origin + '/api/blog' + query);
      assert.equal(response.status, 200);
      return (await response.json()).data;
    };
    const original = await read();
    assert.equal(original.latest.articles, undefined, 'Articles are paged separately');
    const articlesUid = 'api::blog-article.blog-article';
    const articles = async (query = '') => {
      const response = await fetch(origin + '/api/blog-articles' + query);
      assert.equal(response.status, 200);
      return response.json();
    };
    const all = await articles('?pageSize=30');
    assert.equal(all.meta.pagination.total, 9);
    // Only the requested page is returned, computed by the database.
    const firstPage = await articles('?page=1&pageSize=4');
    assert.equal(firstPage.data.length, 4);
    assert.deepEqual(firstPage.meta.pagination, { page: 1, pageSize: 4, pageCount: 3, total: 9 });
    const last = await articles('?page=3&pageSize=4');
    assert.equal(last.data.length, 1);
    assert.equal(new Set([...firstPage.data, ...(await articles('?page=2&pageSize=4')).data, ...last.data].map(a => a.documentId)).size, 9, 'Pages must not overlap');
    assert.equal((await articles('?page=9&pageSize=4')).data.length, 0);
    assert.equal((await articles('?pageSize=999')).meta.pagination.pageSize, 30, 'Page size is capped');
    assert.equal((await articles('?pageSize=-5')).meta.pagination.pageSize, 1);
    assert.equal(original.categories.length, 6);
    assert.equal(original.hero.title.length, 3);
    assert.equal(original.newsletter.title.length, 2);
    const media = [original.hero.image, original.featured.image, original.newsletter.artwork, ...all.data.map(a => a.image)];
    assert.equal(new Set(media.map(image => image.id)).size, 6);
    for (const image of media) {
      const response = await fetch(origin + image.url);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^image\//);
    }
    const count = await app.db.query(uid).count();
    await require('../dist/src/seed-blog').seedBlog(app);
    assert.equal(await app.db.query(uid).count(), count);
    await app.documents(uid).update({ documentId: original.documentId, status: 'draft', data: {
      hero: { eyebrow: original.hero.eyebrow, title: ['CMS blog headline'], description: original.hero.description, image: original.hero.image.id },
      latest: { eyebrow: 'CMS latest', title: 'CMS articles', pageSize: 3 },
    } });
    const draftArticle = await app.documents(articlesUid).create({ data: { title: 'CMS article title', category: 'Growth', date: '2026-11-18', image: original.featured.image.id, href: '/venture-debt' } });
    assert.equal((await articles('?status=draft&category=Growth')).meta.pagination.total, 0, 'Draft articles must not leak');
    assert.deepEqual((await read('?status=draft&populate=*')).hero.title, original.hero.title, 'Drafts must not leak');
    await app.documents(uid).publish({ documentId: original.documentId });
    await app.documents(articlesUid).publish({ documentId: draftArticle.documentId });
    const published = await read();
    assert.equal(published.hero.title[0], 'CMS blog headline');
    assert.equal(published.latest.pageSize, 3);
    const growth = await articles('?category=Growth&sort=latest');
    assert.equal(growth.meta.pagination.total, 1);
    assert.equal(growth.data[0].title, 'CMS article title');
    assert.ok(growth.data[0].image.url);
    assert.equal((await articles('?sort=latest')).data[0].title, 'CMS article title', 'Dated article sorts first');
    for (const method of ['POST', 'PUT', 'DELETE']) {
      const response = await fetch(origin + '/api/blog-articles', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { title: 'Unauthorized' } }) });
      assert.ok(response.status >= 400);
    }
    for (const method of ['POST', 'PUT', 'DELETE']) {
      const response = await fetch(origin + '/api/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { title: 'Unauthorized' } }) });
      assert.ok(response.status >= 400);
    }
    await app.documents(uid).update({ documentId: original.documentId, status: 'draft', data: { categories: [] } });
    await app.documents(uid).publish({ documentId: original.documentId });
    assert.deepEqual((await read()).categories, []);
    const subscribe = email => fetch(origin + '/api/newsletter-subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, extra: 'ignored' }) });
    assert.equal((await subscribe('bad-email')).status, 400);
    const first = await subscribe(' Reader@Example.com ');
    assert.equal(first.status, 200);
    assert.deepEqual(await first.json(), { data: { accepted: true } });
    assert.equal((await subscribe('reader@example.com')).status, 200);
    const subscriberUid = 'api::newsletter-subscription.newsletter-subscription';
    assert.equal(await app.db.query(subscriberUid).count(), 1, 'Duplicate requests must not create extra subscribers');
    const saved = await app.db.query(subscriberUid).findOne({ where: { email: 'reader@example.com' } });
    assert.ok(saved.consentedAt);
    assert.equal(saved.source, 'blog');
    for (const path of ['/api/newsletter-subscriptions', '/api/newsletter-subscriptions/' + saved.documentId]) {
      const response = await fetch(origin + path);
      assert.ok(response.status >= 400, 'Subscriber list must never be public');
      assert.ok(!(await response.text()).includes('reader@example.com'));
    }
    await subscribe('another@example.com');
    await subscribe('third@example.com');
    assert.equal((await subscribe('limited@example.com')).status, 429);
    console.log('PASS: Blog sections, six source assets, seed preservation, draft privacy, publishing, empty lists, read-only blog API, subscription validation/deduplication/privacy/rate limit.');
  } finally {
    for (const file of await app.db.query('plugin::upload.file').findMany()) await app.plugin('upload').service('upload').remove(file);
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
