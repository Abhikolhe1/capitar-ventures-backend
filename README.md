# Capitar Ventures CMS

Strapi backend for the Capitar homepage. Local admin: http://localhost:3035/admin .

## Run
Install with npm ci. Create a local .env from .env.example if needed,and configure its required secrets/database values. Use npm run develop for development,npm run build for the production/admin build,and npm start for production mode. PORT defaults to3035; environment values override it.

## Homepage content
Content Manager > Single Types > Homepage contains Hero,Portfolio & Proof Points,Capital Efficiency,The Capitar Difference and Case Study. Edit their text,ordered items and media;Save and Publish. Global contains header branding,navigation and CTA. Enable links only when their destinations exist.

GET /api/homepage returns all five sections with nested components,images,logos and links populated. GET /api/global returns header content. Frontend configuration VITE_CMS_URL must point to this backend. No separate per-section requests are required.

Optional initial seeding uses CAPITAR_SEED=true and the adjacent frontend's src/content/homepage.json/public/assets/capitar; it fills missing content only and preserves existing documents. Leave seeding disabled for routine CMS edits. Existing SQLite files,uploaded media and environment secrets must be retained.
