// Preview: node scripts/update-figma-copy.cjs
// Apply locally: append --apply. Production also requires --allow-production.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const apply = process.argv.includes('--apply');
  const productionAllowed = process.argv.includes('--allow-production');
  process.env.CAPITAR_SEED = 'false';
  const reference = JSON.parse(await fs.readFile(path.resolve('../capitar-ventures-frontend/src/content/homepage.json'), 'utf8'));
  console.log('Compiling CMS configuration...');
  const app = createStrapi(await compileStrapi());
  console.log('Loading CMS...');
  await app.load();
  try {
    assert.ok(process.env.NODE_ENV !== 'production' || !apply || productionAllowed,
      'Production writes require both --apply and --allow-production.');
    assert.equal(app.config.get('database.connection.client'), 'sqlite', 'Expected the configured SQLite database.');
    const plans = new Map();
    function plan(uid, component, values) {
      if (!component) return;
      for (const key of Object.keys(values)) {
        assert.ok(['string', 'text'].includes(app.components[uid].attributes[key]?.type), `Not a text field: ${uid}.${key}`);
        assert.equal(typeof values[key], 'string');
      }
      const before = Object.fromEntries(Object.keys(values).map(key => [key, component[key]]));
      if (JSON.stringify(before) === JSON.stringify(values)) return;
      plans.set(`${uid}:${component.id}`, { uid, id: component.id, before, data: values });
    }
    // Update component text in both statuses without publishing unrelated drafts.
    for (const status of ['draft', 'published']) {
      const home = await app.documents('api::homepage.homepage').findFirst({
        status, populate: { hero: true, testimonials: { populate: { items: true } } },
      });
      const global = await app.documents('api::global.global').findFirst({
        status, populate: { footer: { populate: { aiLinks: true } } },
      });
      assert.ok(home?.hero, `Missing ${status} homepage hero`);
      plan('homepage.hero', home.hero, Object.fromEntries([
        'heading', 'emphasisText', 'mobileHeading', 'mobileEmphasisText',
        'trustedClientsTitle', 'mobileTrustedClientsTitle',
      ].map(key => [key, reference.hero[key]])));
      for (const item of home.testimonials?.items || []) {
        if (item.name === 'Jahan Melad') plan('homepage.testimonial', item, { company: 'mPocket' });
      }
      if (global?.footer) {
        plan('shared.footer', global.footer, {
          address: reference.global.footer.address,
          copyright: reference.global.footer.copyright,
        });
        for (const item of global.footer.aiLinks || []) {
          if (/^chat\s*gpt$/i.test(item.label)) plan('shared.footer-shortcut', item, { label: 'Chat GPT' });
        }
      }
    }
    console.log(`${plans.size} component text updates planned.`);
    for (const entry of plans.values()) console.log(`${entry.uid} #${entry.id}: ${Object.keys(entry.data).join(', ')}`);
    if (!apply || !plans.size) {
      console.log(plans.size ? 'Preview only; no content changed.' : 'CMS copy already matches.');
      return;
    }
    const backup = path.resolve('.tmp', `figma-copy-backup-${Date.now()}.json`);
    await fs.mkdir(path.dirname(backup), { recursive: true });
    await fs.writeFile(backup, JSON.stringify([...plans.values()], null, 2));
    console.log(`Text backup: ${backup}`);
    await app.db.transaction(async () => {
      for (const entry of plans.values()) {
        const query = app.db.query(entry.uid);
        const before = await query.findOne({ where: { id: entry.id } });
        assert.ok(before, `Missing component ${entry.uid} #${entry.id}`);
        // Strapi may attach lifecycle timestamps to its in-memory entity.
        // Compare schema fields rather than these runtime metadata properties.
        const fields = new Set(['id', ...Object.keys(app.components[entry.uid].attributes)]);
        const content = value => Object.fromEntries(Object.entries(value).filter(([key]) => fields.has(key)));
        const snapshot = structuredClone(content(before));
        await query.update({ where: { id: entry.id }, data: entry.data });
        const after = await query.findOne({ where: { id: entry.id } });
        assert.deepEqual(content(after), { ...snapshot, ...entry.data }, `Unexpected non-text change: ${entry.uid} #${entry.id}`);
      }
    });
    console.log('Verified all requested text updates; other component fields and publication states preserved.');
  } finally {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
