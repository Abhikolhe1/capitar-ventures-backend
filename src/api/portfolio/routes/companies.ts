// Public, read-only, paginated list of published portfolio companies.
export default {
  routes: [
    {
      method: 'GET',
      path: '/portfolio/companies',
      handler: 'api::portfolio.portfolio.companies',
      config: { auth: false },
    },
  ],
};
