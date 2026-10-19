// Replace the local sample's distorted image exports while retaining CMS media relations.
const fs = require('node:fs/promises');
const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');

async function main() {
  const app = createStrapi(await compileStrapi());
  await app.load();
  try {
    const names = ['qubehealth', 'pidge', 'craev', 'mpokket'];
    for (const name of names) {
      const source = path.resolve('../capitar-ventures-frontend/public/assets/capitar', `${name}.png`);
      const bytes = await fs.readFile(source);
      const width = bytes.readUInt32BE(16);
      const height = bytes.readUInt32BE(20);
      const files = await app.db.query('plugin::upload.file').findMany({ where: { name: `${name}.png`, provider: 'local' } });
      for (const file of files) {
        if (!file.url.startsWith('/uploads/')) throw new Error('Expected local sample media');
        const hash = file.hash.endsWith('_crop2x') ? file.hash : `${file.hash}_crop2x`;
        const url = `/uploads/${hash}.png`;
        await fs.writeFile(path.join(app.dirs.static.public, 'uploads', `${hash}.png`), bytes);
        await app.db.query('plugin::upload.file').update({
          where: { id: file.id },
          data: { url, hash, width, height, size: bytes.length / 1000, formats: null },
        });
        console.log(`${name}: ${width}x${height}, media ${file.id}`);
      }
    }
  } finally {
    // Allow Strapi's queued lifecycle work to settle before closing its connection.
    await new Promise(resolve => setTimeout(resolve, 1000));
    await app.destroy();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
