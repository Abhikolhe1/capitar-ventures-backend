import { factories } from '@strapi/strapi';

// Expose only published read operations. No public mutation routes.
export default factories.createCoreRouter('api::global.global', {
  only: ['find'], config: { find: { auth: false } },
});
