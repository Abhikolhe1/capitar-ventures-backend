# Blog CMS and subscription requests

The Blog single type manages the listing page: hero, categories, featured story, latest-article grid and newsletter banner. Six blog component schemas hold editable copy/media; cards support category, title, summary, date, image/alt text and destination URL. Page size is 1–30. Publish the Blog entry to expose changes. The existing Global single type continues to manage shared header/footer content.

`GET /api/blog` returns published content with explicit media population, ignoring client draft/population overrides.

Article cards are a separate **Blog Article** collection (title, category, summary, date, image/alt text, destination URL), so the listing never downloads every article. `GET /api/blog-articles?page=1&pageSize=9&category=Growth&sort=latest` returns one page of published articles plus `meta.pagination` (`page`, `pageSize`, `pageCount`, `total`). The database applies the category filter, order (`latest`, `oldest`, `title`, each tie-broken by id so pages never overlap), limit and offset. Page size is capped at 30; drafts and other query options are ignored. The page size used by the website is `latest.pageSize` on the Blog single type. There are no public create/update/delete routes. The frontend uses the existing `VITE_CMS_URL`, retaining local Figma copy during outages.

`POST /api/newsletter-subscriptions` accepts `{ "email": "reader@example.com" }`. Successful and duplicate requests both return `{ "data": { "accepted": true } }`. Emails are trimmed/lowercased, validated, unique and private; consent time and source are recorded. No public list/detail routes exist. Manage records only through authenticated Strapi administration. The endpoint captures subscription requests and does not send email campaigns. Configure a delivery provider separately when ready.

The endpoint limits each IP to five attempts per minute in a bounded in-process map. A multi-instance production deployment should apply its shared reverse-proxy rate limit too. Responses do not disclose whether an address already exists. Malformed input returns 400 and rate limits return 429.

New Blog Article publications can notify subscribers through the Nodemailer provider. Sending stays disabled while `SMTP_HOST` is unset. Add only Capitar-provided credentials to the server environment when supplied; never commit mailbox credentials or copy a developer's local `.env`. The available configuration keys are listed in `.env.example`. `PUBLIC_SITE_URL` and `PUBLIC_CMS_URL` supply public email links. Notifications include unsubscribe links and are sent once per article. Run `npm run test:newsletter` to verify delivery behavior with a recorder and a throwaway database; it sends no real emails.

## Local setup and verification

1. Run `npm run build`.
2. Run `npm run seed:blog` against the local SQLite CMS. It imports the six actual Figma assets from the adjacent frontend and creates/publishes Blog only if no draft or published entry exists. Existing editorial work is preserved. Set `CAPITAR_FRONTEND_PATH` if the frontend is elsewhere. Do not run this local seed against production.
3. Run `npm run start` (default port 3035), then open `/admin` and the frontend `/blog` route.
4. Edit/publish Blog from Content Manager. Supply real article URLs, dates/categories and the privacy-policy URL as editorial content becomes available. The original design repeats nine Fundamentals sample cards; no bodies or extra articles are fabricated by the seed.

`npm run test:blog` creates a separate verification database. It checks section/media seeding, seed preservation, draft privacy, publishing, empty lists, denied public writes, email validation/deduplication, private subscribers and rate limiting. It removes only uploads referenced by that isolated test database after completion. Existing local editorial records and subscriptions are not changed by this verification.
