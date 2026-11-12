import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::about-us.about-us', {
  only: ['find'],
  config: { find: { auth: false } },
});
