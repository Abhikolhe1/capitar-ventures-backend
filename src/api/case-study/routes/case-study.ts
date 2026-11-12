// Public, read-only: list published slugs and read one published case study by slug.
export default {
  routes: [
    {
      method: 'GET',
      path: '/case-studies',
      handler: 'api::case-study.case-study.find',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/case-studies/:slug',
      handler: 'api::case-study.case-study.findBySlug',
      config: { auth: false },
    },
  ],
};
