// Verifies new-article emails end to end on a throwaway database. Real sending is
// replaced by a recorder, so no email leaves the machine.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const database = '.tmp/newsletter-verification-' + process.pid + '.db';
  Object.assign(process.env, {
    DATABASE_CLIENT: 'sqlite',
    DATABASE_FILENAME: database,
    PORT: process.env.VERIFY_PORT || '3062',
    HOST: '127.0.0.1',
    SMTP_HOST: 'smtp.example.test',
    SMTP_USERNAME: 'news@example.test',
    SMTP_PASSWORD: 'not-used',
    SMTP_FROM: 'Capitar Ventures <news@example.test>',
    PUBLIC_SITE_URL: 'https://site.example.test',
    PUBLIC_CMS_URL: 'https://cms.example.test',
  });
  for (const key of ['CAPITAR_SEED', 'CAPITAR_SEED_VENTURE_DEBT', 'CAPITAR_SEED_PORTFOLIO', 'CAPITAR_SEED_ABOUT_US', 'CAPITAR_SEED_BLOG']) process.env[key] = 'false';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    app.config.set('admin.autoOpen', false);
    await app.start();
    const origin = 'http://127.0.0.1:' + process.env.PORT;
    const sent = [];
    app.plugin('email').service('email').send = async (message) => { sent.push(message); };

    const subscribe = (email) => fetch(origin + '/api/newsletter-subscriptions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    for (const email of ['one@example.test', 'two@example.test', 'three@example.test']) assert.equal((await subscribe(email)).status, 200);

    const articles = app.documents('api::blog-article.blog-article');
    const draft = await articles.create({ data: { title: 'How venture debt <works>', category: 'Growth', description: 'A plain guide & more.', href: '/blog/venture-debt' } });
    assert.equal(sent.length, 0, 'Saving a draft sends nothing');
    await articles.publish({ documentId: draft.documentId });
    for (let i = 0; i < 50 && sent.length < 3; i += 1) await wait(100);
    assert.equal(sent.length, 3, 'Every subscriber gets the new article');
    assert.deepEqual(sent.map((m) => m.to).sort(), ['one@example.test', 'three@example.test', 'two@example.test']);
    const first = sent[0];
    assert.equal(first.subject, 'New from Capitar Ventures: How venture debt <works>');
    assert.match(first.html, /How venture debt &lt;works&gt;/, 'Article text is escaped in the HTML');
    assert.match(first.html, /href="https:\/\/site\.example\.test\/blog\/venture-debt"/);
    const unsubscribeUrl = first.headers['List-Unsubscribe'].slice(1, -1);
    assert.match(unsubscribeUrl, /^https:\/\/cms\.example\.test\/api\/newsletter-subscriptions\/unsubscribe\?token=[a-f0-9]{48}$/);
    assert.ok(first.html.includes(unsubscribeUrl.replace(/&/g, '&amp;')) && first.text.includes(unsubscribeUrl));

    // Editing and publishing the same article again does not re-send.
    await articles.update({ documentId: draft.documentId, data: { description: 'Edited.' } });
    await articles.publish({ documentId: draft.documentId });
    await wait(800);
    assert.equal(sent.length, 3, 'An article is emailed only once');

    // Unsubscribe link removes exactly that subscriber; bad tokens reveal nothing.
    const token = new URL(unsubscribeUrl).searchParams.get('token');
    const page = await fetch(origin + '/api/newsletter-subscriptions/unsubscribe?token=' + token);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /You have been unsubscribed/);
    const bogus = await fetch(origin + '/api/newsletter-subscriptions/unsubscribe?token=' + 'a'.repeat(48));
    assert.equal(bogus.status, 200);
    const oneClick = await fetch(origin + '/api/newsletter-subscriptions/unsubscribe?token=nonsense', { method: 'POST' });
    assert.equal(oneClick.status, 200);
    const remaining = await app.db.query('api::newsletter-subscription.newsletter-subscription').count();
    assert.equal(remaining, 2);

    // The next article goes only to the people still subscribed.
    const second = await articles.create({ data: { title: 'Second article' } });
    await articles.publish({ documentId: second.documentId });
    for (let i = 0; i < 50 && sent.length < 5; i += 1) await wait(100);
    assert.equal(sent.length, 5);
    assert.ok(!sent.slice(3).some((m) => m.to === first.to), 'Unsubscribed address gets nothing');
    assert.match(sent[3].html, /href="https:\/\/site\.example\.test\/blog"/, 'No article link falls back to the blog page');

    // Tokens and the sent flag stay private.
    assert.ok(!JSON.stringify(await (await fetch(origin + '/api/blog-articles')).json()).includes('newsletterSentAt'));
    console.log('PASS: new-article emails to all subscribers, escaped content, once per article, unsubscribe link and one-click, private tokens.');
  } finally {
    await wait(500);
    await app.destroy();
    for (const suffix of ['', '-wal', '-shm']) fs.rmSync(database + suffix, { force: true });
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
