import fs from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

// Explicit opt-in. Existing documents and uploaded media are never overwritten.
export async function seedCapitar(strapi: Core.Strapi) {
  if (process.env.CAPITAR_SEED !== 'true') return;
  const frontend = path.resolve(process.cwd(), '../capitar-ventures-frontend');
  const contentPath = process.env.CAPITAR_SEED_CONTENT || path.join(frontend, 'src/content/homepage.json');
  const assetDirectory = process.env.CAPITAR_SEED_ASSET_DIR || path.join(frontend, 'public/assets/capitar');
  const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
  const upload = async (url: string, alternativeText: string) => {
    const name = path.basename(url);
    const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
    if (existing) return existing.id;
    const filepath = path.join(assetDirectory, name);
    const { size } = await fs.stat(filepath);
    const mimetypes: Record<string, string> = { '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.mp4': 'video/mp4' };
    const uploaded = await strapi.plugin('upload').service('upload').upload({
      data: { fileInfo: { name, alternativeText } },
      files: { filepath, originalFilename: name, mimetype: mimetypes[path.extname(name)], size },
    });
    return uploaded[0].id;
  };
  const globalUID = 'api::global.global' as const;
  const homepageUID = 'api::homepage.homepage' as const;
  if (!await strapi.documents(globalUID).findFirst()) {
    await strapi.documents(globalUID).create({ status: 'published', data: {
      ...content.global, brandLogo: await upload(content.global.brandLogo.url, 'Capitar Ventures'),
    } });
  }
  const homepage = await strapi.documents(homepageUID).findFirst({ populate: ['portfolioProofPoints', 'capitalEfficiency'] });
  const proof = content.portfolioProofPoints;
  const portfolioProofPoints = proof && !homepage?.portfolioProofPoints ? {
    ...proof,
    backgroundLeft: await upload(proof.backgroundLeft.url, ''),
    backgroundRight: await upload(proof.backgroundRight.url, ''),
  } : undefined;
  const capital = content.capitalEfficiency;
  let capitalEfficiency;
  if (capital && !homepage?.capitalEfficiency) {
    const benefits = [];
    for (const benefit of capital.benefits) {
      benefits.push({ ...benefit,
        icon: benefit.icon ? await upload(benefit.icon.url, '') : undefined,
        artwork: benefit.artwork ? await upload(benefit.artwork.url, benefit.artwork.alternativeText || '') : undefined,
      });
    }
    capitalEfficiency = { ...capital, benefits,
      backgroundImage: capital.backgroundImage ? await upload(capital.backgroundImage.url, '') : undefined,
    };
  }
  if (!homepage) {
    const hero = content.hero;
    const trustedClients = [];
    for (const client of hero.trustedClients) {
      trustedClients.push({ ...client, logo: await upload(client.logo.url, client.name) });
    }
    await strapi.documents(homepageUID).create({ status: 'published', data: { portfolioProofPoints, capitalEfficiency, hero: {
      ...hero,
      backgroundImage: await upload(hero.backgroundImage.url, ''),
      backgroundVideo: await upload(hero.backgroundVideo.url, ''),
      trustedClients,
    } } });
  } else if (portfolioProofPoints || capitalEfficiency) {
    await strapi.documents(homepageUID).update({ documentId: homepage.documentId, status: 'published', data: {
      ...(portfolioProofPoints ? { portfolioProofPoints } : {}),
      ...(capitalEfficiency ? { capitalEfficiency } : {}),
    } });
  }
  strapi.log.info('Capitar seed checked: published Global and Homepage are ready.');
}
