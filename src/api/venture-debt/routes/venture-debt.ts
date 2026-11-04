import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::venture-debt.venture-debt', { only: ['find'], config: { find: { auth: false } } });
