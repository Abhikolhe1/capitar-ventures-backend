# About Us CMS

Open Content Manager > Single Types > About Us in the local Strapi admin at http://localhost:3035/admin. Edit and publish the hero, mission, journey milestones, belief items, people/team, quotation, and keyed artwork media. The frontend at http://localhost:3039/about-us fetches published content and refreshes on window focus. A failed request preserves the last valid content, or the local Figma fallback on first load.

Team member Image is optional. Upload a separate portrait there for a standard cover crop; leave it empty to use the original source portrait selected by the Portrait key. Individual Biography overrides the shared People biography. Lists support editor-defined order and intentional empty arrays.

Keep Artworks keys unchanged when replacing images. The Mission map has its own media field; the other nineteen original source assets are stored in Artworks, including two provenance source fills. The complete source inventory and usage are in ../capitar-ventures-frontend/public/assets/about/figma-assets.json and ../capitar-ventures-frontend/docs/ABOUT_US_FIGMA_IMPLEMENTATION.md.

- `npm run seed:about-us`: local-only, opt-in seed; preserves any existing draft or published About Us. Uploads source media and publishes the first entry.
- `npm run test:about-us`: isolated SQLite verification of all sections/media, publish behavior, private drafts, seed idempotence, custom portraits/biographies, empty lists, and rejected public mutations. It does not edit the local editorial database.
- `npx tsc --noEmit` and `npm run build`: backend type/admin checks.

`GET /api/about-us` is public, read-only, explicitly populated, and always published. Query parameters cannot expose drafts. Admin writes remain protected by Strapi. Bootstrap seeding requires `CAPITAR_SEED_ABOUT_US=true`; existing documents are never replaced. No secrets, CMS database, uploaded files, or generated test databases should be committed.
