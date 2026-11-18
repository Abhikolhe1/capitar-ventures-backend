// Public and read-only: one page of published articles at a time.
export default {
  routes: [
    {
      method: 'GET',
      path: '/blog-articles',
      handler: 'api::blog-article.blog-article.find',
      config: { auth: false },
    },
  ],
};
