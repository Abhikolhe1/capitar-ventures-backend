export default {
  routes: [
    {
      method: 'POST', path: '/newsletter-subscriptions',
      handler: 'newsletter-subscription.subscribe',
      config: { auth: false },
    },
    // Unsubscribe link in each newsletter email, and the mail apps' one-click button.
    {
      method: 'GET', path: '/newsletter-subscriptions/unsubscribe',
      handler: 'newsletter-subscription.unsubscribe',
      config: { auth: false },
    },
    {
      method: 'POST', path: '/newsletter-subscriptions/unsubscribe',
      handler: 'newsletter-subscription.unsubscribe',
      config: { auth: false },
    },
  ],
};
