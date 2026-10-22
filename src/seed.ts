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
    const filepath = url.startsWith('/assets/images/')
      ? path.join(frontend, 'public/assets/images', name)
      : url.startsWith('/assets/icons/footer/')
      ? path.join(frontend, 'public/assets/icons/footer', name)
      : path.join(assetDirectory, name);
    const { size } = await fs.stat(filepath);
    const mimetypes: Record<string, string> = { '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4' };
    const uploaded = await strapi.plugin('upload').service('upload').upload({
      data: { fileInfo: { name, alternativeText } },
      files: { filepath, originalFilename: name, mimetype: mimetypes[path.extname(name)], size },
    });
    return uploaded[0].id;
  };
  const globalUID = 'api::global.global' as const;
  const homepageUID = 'api::homepage.homepage' as const;
  const { footer: footerContent, ...globalContent } = content.global;
  if (!await strapi.documents(globalUID).findFirst()) {
    await strapi.documents(globalUID).create({ status: 'published', data: {
      ...globalContent, brandLogo: await upload(content.global.brandLogo.url, 'Capitar Ventures'),
    } });
  }
  if (footerContent) {
    const global = await strapi.documents(globalUID).findFirst({ populate: ['footer'] });
    if (global && !global.footer) {
      const { brandLogo, backgroundImage, backgroundVideo, aiLinks, ...details } = footerContent;
      const shortcuts = [];
      for (const shortcut of aiLinks || []) {
        const { icon, ...linkDetails } = shortcut;
        shortcuts.push({ ...linkDetails, ...(icon?.url ? { icon: await upload(icon.url, shortcut.label) } : {}) });
      }
      await strapi.documents(globalUID).update({ documentId: global.documentId, status: 'published', data: { footer: {
        ...details, aiLinks: shortcuts,
        ...(brandLogo?.url ? { brandLogo: await upload(brandLogo.url, 'Capitar Ventures') } : {}),
        ...(backgroundImage?.url ? { backgroundImage: await upload(backgroundImage.url, '') } : {}),
        ...(backgroundVideo?.url ? { backgroundVideo: await upload(backgroundVideo.url, '') } : {}),
      } } });
    }
  }
  const homepage = await strapi.documents(homepageUID).findFirst({ populate: ['portfolioProofPoints', 'capitalEfficiency', 'capitarDifference', 'caseStudy'] });
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
  const difference = content.capitarDifference;
  let capitarDifference;
  if (difference && !homepage?.capitarDifference) {
    const items = [];
    for (const item of difference.items) {
      items.push({ ...item, image: item.image ? await upload(item.image.url, item.image.alternativeText || '') : undefined });
    }
    capitarDifference = { ...difference, items,
      cardBackground: difference.cardBackground ? await upload(difference.cardBackground.url, '') : undefined,
    };
  }
  const cases = content.caseStudy;
  let caseStudy;
  if (cases && !homepage?.caseStudy) {
    const items = [];
    for (const item of cases.items) {
      items.push({ ...item,
        image: item.image ? await upload(item.image.url, item.image.alternativeText || '') : undefined,
        logo: item.logo ? await upload(item.logo.url, item.logo.alternativeText || item.name) : undefined,
      });
    }
    caseStudy = { ...cases, items };
  }
  if (!homepage) {
    const hero = content.hero;
    const trustedClients = [];
    for (const client of hero.trustedClients) {
      trustedClients.push({ ...client, logo: await upload(client.logo.url, client.name) });
    }
    await strapi.documents(homepageUID).create({ status: 'published', data: { portfolioProofPoints, capitalEfficiency, capitarDifference, caseStudy, hero: {
      ...hero,
      backgroundImage: await upload(hero.backgroundImage.url, ''),
      backgroundVideo: await upload(hero.backgroundVideo.url, ''),
      trustedClients,
    } } });
  } else if (portfolioProofPoints || capitalEfficiency || capitarDifference || caseStudy) {
    await strapi.documents(homepageUID).update({ documentId: homepage.documentId, status: 'published', data: {
      ...(caseStudy ? { caseStudy } : {}),
      ...(portfolioProofPoints ? { portfolioProofPoints } : {}),
      ...(capitalEfficiency ? { capitalEfficiency } : {}),
      ...(capitarDifference ? { capitarDifference } : {}),
    } });
  }
  // Add only a missing Team section; preserve all existing editor-authored content.
  if (content.team) {
    const seededHomepage = await strapi.documents(homepageUID).findFirst({ populate: ['team'] });
    if (seededHomepage && !seededHomepage.team) {
      const { members, ...teamDetails } = content.team;
      const teamMembers = [];
      for (const member of members || []) {
        const { portrait, ...details } = member;
        teamMembers.push({ ...details, ...(portrait?.url ? { portrait: await upload(portrait.url, member.name) } : {}) });
      }
      await strapi.documents(homepageUID).update({ documentId: seededHomepage.documentId, status: 'published', data: { team: { ...teamDetails, members: teamMembers } } });
    }
  }
  // Insights and News have separate editable content; only fill a missing section.
  if (content.insightsNews) {
    const seededHomepage = await strapi.documents(homepageUID).findFirst({ populate: ['insightsNews'] });
    if (seededHomepage && !seededHomepage.insightsNews) {
      const prepareTab = async (tab: typeof content.insightsNews.insights) => {
        const items = [];
        for (const item of tab.items || []) {
          const { image, ...details } = item;
          items.push({ ...details, ...(image?.url ? { image: await upload(image.url, image.alternativeText || item.title) } : {}) });
        }
        return { ...tab, items };
      };
      await strapi.documents(homepageUID).update({ documentId: seededHomepage.documentId, status: 'published', data: {
        insightsNews: { enabled: content.insightsNews.enabled,
          insights: await prepareTab(content.insightsNews.insights),
          news: await prepareTab(content.insightsNews.news),
        },
      } });
    }
  }
  if (content.testimonials) {
    const seededHomepage = await strapi.documents(homepageUID).findFirst({ populate: ['testimonials'] });
    if (seededHomepage && !seededHomepage.testimonials) {
      const { items, ...section } = content.testimonials;
      const testimonials = [];
      for (const item of items || []) {
        const { portrait, companyLogo, ...details } = item;
        testimonials.push({ ...details,
          ...(portrait?.url ? { portrait: await upload(portrait.url, item.name) } : {}),
          ...(companyLogo?.url ? { companyLogo: await upload(companyLogo.url, item.company || '') } : {}),
        });
      }
      await strapi.documents(homepageUID).update({ documentId: seededHomepage.documentId, status: 'published', data: { testimonials: { ...section, items: testimonials } } });
    }
  }
  strapi.log.info('Capitar seed checked: published Global and Homepage are ready.');
}
