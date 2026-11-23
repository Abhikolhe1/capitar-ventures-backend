// One-off: give the Homepage team its own copy of the About Us team.
// The homepage used to display the About Us lineup; it now reads Homepage > Team > Members,
// so editors can hide people there (Show on homepage) without changing About Us.
//
// Default is a dry run. Pass --apply to write. Stop the CMS first (SQLite) and back up
// the database as described in DEPLOYMENT.md.
//   node scripts/sync-homepage-team.cjs            # preview
//   node scripts/sync-homepage-team.cjs --apply    # write and publish
//
// Order follows About Us. Existing homepage-only members are kept at the end with
// showOnHomepage=false, so nothing is deleted and the visible lineup matches today's site.
const { compileStrapi, createStrapi } = require('@strapi/strapi');

const apply = process.argv.includes('--apply');
const homepageUID = 'api::homepage.homepage';
const key = (name) => String(name || '').trim().toLowerCase();

async function main() {
  // Never let a bootstrap seed run as a side effect of this script.
  process.env.CAPITAR_SEED = 'false';
  process.env.CAPITAR_SEED_VENTURE_DEBT = 'false';
  process.env.CAPITAR_SEED_PORTFOLIO = 'false';
  process.env.CAPITAR_SEED_ABOUT_US = 'false';
  process.env.CAPITAR_SEED_BLOG = 'false';
  const app = createStrapi(await compileStrapi());
  try {
    await app.load();
    const about = await app.documents('api::about-us.about-us').findFirst({
      status: 'published',
      populate: { people: { populate: { team: { populate: { image: true } } } } },
    });
    const source = about?.people?.team || [];
    if (!source.length) throw new Error('Published About Us has no team members to copy.');

    const homepage = await app.documents(homepageUID).findFirst({
      status: 'published',
      populate: { team: { populate: { members: { populate: { portrait: true } } } } },
    });
    if (!homepage) throw new Error('No published Homepage found.');
    if (!homepage.team) throw new Error('Homepage has no Team section; add it in the CMS first.');

    const existing = homepage.team.members || [];
    const byName = new Map(existing.map((member) => [key(member.name), member]));
    const copied = source.map((member) => {
      const current = byName.get(key(member.name));
      return {
        name: member.name,
        role: member.role || current?.role || '',
        description: member.biography ?? current?.description ?? null,
        portrait: member.image?.id ?? current?.portrait?.id ?? null,
        portraitPositionY: current?.portraitPositionY ?? 50,
        linkedinUrl: member.linkedinUrl || current?.linkedinUrl || null,
        showOnHomepage: true,
      };
    });
    const copiedNames = new Set(source.map((member) => key(member.name)));
    const kept = existing
      .filter((member) => !copiedNames.has(key(member.name)))
      .map((member) => ({
        name: member.name,
        role: member.role,
        description: member.description ?? null,
        portrait: member.portrait?.id ?? null,
        portraitPositionY: member.portraitPositionY ?? 50,
        linkedinUrl: member.linkedinUrl || null,
        showOnHomepage: false,
      }));
    const members = [...copied, ...kept];

    console.log(`Homepage team now: ${existing.map((m) => m.name).join(', ') || '(none)'}`);
    console.log('Homepage team after sync:');
    members.forEach((m, i) =>
      console.log(`  ${i + 1}. ${m.name} — ${m.showOnHomepage ? 'shown' : 'hidden'}${m.portrait ? '' : ' (no photo)'}`)
    );
    if (!apply) {
      console.log('\nDry run only. Re-run with --apply to write and publish.');
      return;
    }
    const { id, documentId, members: _old, ...teamDetails } = homepage.team;
    await app.documents(homepageUID).update({
      documentId: homepage.documentId,
      status: 'published',
      data: { team: { ...teamDetails, members } },
    });
    const check = await app.documents(homepageUID).findFirst({
      status: 'published',
      populate: { team: { populate: { members: true } } },
    });
    console.log(`\nPublished. Homepage team members: ${check.team.members.length}`);
  } finally {
    // Allow Strapi's bootstrap background queries to settle before closing SQLite.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // A failed load leaves services missing; don't let shutdown hide the real error.
    await app.destroy().catch(() => undefined);
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
