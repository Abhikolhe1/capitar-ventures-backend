import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::blog.blog', {
  only: ['find'],
  config: { find: { auth: false } },
});
