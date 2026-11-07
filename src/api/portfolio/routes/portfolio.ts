import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::portfolio.portfolio', {
  only: ['find'],
  config: { find: { auth: false } },
});
