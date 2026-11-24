# Capitar Ventures CMS

Strapi backend for the Capitar homepage. Local admin: http://localhost:3035/admin .

## Run
Install with npm ci. Create a local .env from .env.example if needed,and configure its required secrets/database values. Use npm run develop for development,npm run build for the production/admin build,and npm start for production mode. PORT defaults to3035; environment values override it.

## Homepage content
The shared team lineup is edited under Content Manager > About Us > People > Team.
Both the homepage carousel and About Us cards use these names, roles, biographies,
portrait images and `linkedinUrl` values. Use a full HTTPS LinkedIn profile URL;
empty or invalid URLs show the icon without creating a link. Homepage > Team
still controls the homepage section heading, description and enabled state.
Its member list is retained as a fallback when About Us content is unavailable.

Content Manager > Single Types > Homepage contains Hero,Portfolio & Proof Points,Capital Efficiency,The Capitar Difference and Case Study. Edit their text,ordered items and media;Save and Publish. Global contains header branding,navigation and CTA. Enable links only when their destinations exist.

GET /api/homepage returns all five sections with nested components,images,logos and links populated. GET /api/global returns header content. Frontend configuration VITE_CMS_URL must point to this backend. No separate per-section requests are required.

Optional initial seeding uses CAPITAR_SEED=true and the adjacent frontend's src/content/homepage.json/public/assets/capitar; it fills missing content only and preserves existing documents. Leave seeding disabled for routine CMS edits. Existing SQLite files,uploaded media and environment secrets must be retained.

## Privacy Policy and registration details

Content Manager > Privacy Policy controls the page title, illustration and ordered
sections. Each section has a heading and a rich-text block editor for paragraphs
and bullet lists. Save and Publish to update `/privacy-policy` on the website.
`GET /api/privacy-policy` exposes published content only; public write routes are disabled.

Global > Footer contains `registrationLabel` and `registrationDetails` (one line per
registration). The initial three lines are copied verbatim from Figma, including
`INR/AIF2/22-23/1134`. They are editorial content, not independently verified registrations.
Global > Footer > Legal Links contains the enabled Privacy link to `/privacy-policy`.
Other unpublished legal pages remain hidden on the frontend.

For initial local setup, run `npm run seed:privacy-policy`. It imports the adjacent
frontend's Figma content and illustration only when no privacy document exists,
fills missing registration fields and enables the existing unused Privacy placeholder.
If the published Global has no footer, it initializes that footer while preserving
both the public header values and any separate unpublished header/footer edits.
Existing privacy drafts/content and custom footer values are retained. If a footer
has no Privacy entry, the seed adds it to the Global draft without publishing unrelated
changes. Production bootstrap can explicitly opt in with `CAPITAR_SEED_PRIVACY_POLICY=true`;
routine starts leave this disabled. Retain a database backup before a first seed.

### Admin editor isolation (Strapi 5.52.3)

`src/admin/vite.config.ts` keys the Content Manager editor by content-type UID.
This prevents fields from the previous single type reading the next type's component
layouts during client-side navigation. Saving, publishing and changing document status
within the same type do not remount the editor. The narrow build transform fails if
the upstream target changes; review it when upgrading Strapi.

To check navigation, save and publish, use an isolated local database with a temporary
admin account and run `node scripts/verify-admin-navigation.cjs` with `CMS_TEST_URL`,
`CMS_TEST_EMAIL` and `CMS_TEST_PASSWORD`. This uses Chrome/Playwright from the adjacent
frontend checkout. The test refuses remote hosts because it edits and publishes a QA title.
