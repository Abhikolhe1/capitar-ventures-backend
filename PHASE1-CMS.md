# Header and Hero content editing

The backend uses the existing Strapi 5 installation, SQLite and native media library. Port1340 is configured in the existing environment.

## Start and seed

```powershell
npm ci
# For a new checkout only; preserve an existing environment:
Copy-Item .env.example .env
# Replace example secrets with unique values before starting a new environment.
$env:CAPITAR_SEED='true'
npm run dev
```

Seeding reads ../capitar-ventures-frontend/src/content/homepage.json and its local assets. Set CAPITAR_SEED_CONTENT and CAPITAR_SEED_ASSET_DIR for different deployment directories. Existing documents are never overwritten. Remove CAPITAR_SEED after the initial seed. No admin account is automatically created.

## Editor workflow

Open http://localhost:1340/admin and use Content Manager. Global controls the brand logo, navigation labels and header CTA. Homepage contains a Hero component with heading/emphasis, announcement, primary CTA, background poster/video, optional mobile poster/description, and trusted logos.

Each link has a label, href, enabled flag and optional indicator. The seed leaves future destinations disabled. Set a real destination and enable it when that page exists. Each client has name, media, width and height; use the provided display dimensions for the exported Figma raster assets. Preserve the deliberate repeated Qubehealth entry unless the design is updated.

Save and **publish** Global and Homepage after editing. Drafts are not public. The frontend refreshes published content on browser focus and page reload. Missing optional content is omitted; an unavailable/invalid API falls back to verified local design content.

## API contract

- GET /api/global: published Global with brandLogo, navigation and headerCta populated.
- GET /api/homepage: published Homepage with all Hero links/media and trusted-client logos populated.
- Responses use Strapi 5's {data, meta} envelope with flattened fields.
- Only find routes are registered with public read access; mutation routes are absent. Admin editing retains normal Strapi authentication and permissions.
- Controllers force published status and explicit population and delegate response sanitization to the core controller.
- No privileged API credentials are needed by the frontend. VITE_CMS_URL is a public origin, not a token.

## Verification

```powershell
npm run build
# Stop the backend server before this integration check.
# It runs only on the matching local seeded sample and restores test changes.
npm run test:phase1
npm run start
```

The integration check exercises published component/media relations and text/media updates, restores the sample, and allows lifecycle subscribers to complete before SQLite shutdown. Browser/API verification and the full design/asset audit are documented in ../capitar-ventures-frontend/PHASE1-REPORT.md. Backend secrets, deployment provider configuration, and persistent production storage remain environment-specific.
