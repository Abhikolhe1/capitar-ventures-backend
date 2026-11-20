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
