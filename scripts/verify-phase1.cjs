const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const app = createStrapi(await compileStrapi());
  await app.load();
  try {
    const uid = 'api::homepage.homepage';
    const populate = { hero: { populate: { backgroundImage: true, backgroundVideo: true, primaryCta: true, announcementLink: true, trustedClients: { populate: { logo: true } } } } };
    const current = await app.documents(uid).findFirst({ status: 'published', populate });
    assert.ok(current?.hero);
    const content = JSON.parse(await fs.readFile(path.resolve('../capitar-ventures-frontend/src/content/homepage.json'), 'utf8'));
    const original = current.hero;
    assert.notEqual(process.env.NODE_ENV, 'production', 'Run only against the local sample database.');
    assert.equal(original.heading, content.hero.heading, 'This check only edits the verified sample homepage.');
    assert.deepEqual(original.trustedClients.map(client => client.name), content.hero.trustedClients.map(client => client.name));
    const clientData = original.trustedClients.map((client, i) => ({ name: client.name, logo: client.logo.id, width: content.hero.trustedClients[i].width, height: content.hero.trustedClients[i].height }));
    const data = { ...original, backgroundImage: original.backgroundImage.id, backgroundVideo: original.backgroundVideo.id, trustedClients: clientData };
    delete data.id;
    const updated = await app.documents(uid).update({ documentId: current.documentId, data: { hero: data }, status: 'published', populate });
    assert.equal(updated.hero.trustedClients.length, 5);
    assert.equal(updated.hero.trustedClients[0].height, 30.786);
    // Exercise the CMS update path and media relation replacement, then restore.
    try {
      await app.documents(uid).update({ documentId: current.documentId, data: { hero: { ...data, announcementText: 'Our Trusted Clients', backgroundImage: original.trustedClients[0].logo.id } }, status: 'published' });
      const changed = await app.documents(uid).findFirst({ status: 'published', populate });
      assert.equal(changed.hero.announcementText, 'Our Trusted Clients');
      assert.equal(changed.hero.backgroundImage.id, original.trustedClients[0].logo.id);
    } finally {
      await app.documents(uid).update({ documentId: current.documentId, data: { hero: data }, status: 'published' });
    }
    console.log('PASS: published data, five client relations, logo dimensions, CMS text/media updates and restoration.');
  } finally {
    // Let Strapi's document lifecycle subscribers finish before closing SQLite.
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
