# Venture Debt content

Open the local Strapi admin at `http://localhost:3035/admin` and choose **Content Manager → Single Types → Venture Debt**.

Edit the page title and these groups:

- **Hero:** label, heading, emphasis, description, both CTA labels/links, background, glass and glow images.
- **Timeline:** labels and their section targets. Display order follows the page; hidden sections are omitted automatically.
- **Before:** introduction, signals heading, up to four signal titles/descriptions, blue glass image and glow.
- **Process:** label, heading, description, background decoration and up to four process steps with labels, headings and descriptions.
- **Practice:** heading, quote, attribution, image, CTA and up to three outcomes. Each outcome can use an individual icon; otherwise the existing three-icon sprite is used.
- **FAQ:** heading, introduction and repeatable question/answer pairs.

Each section has an **enabled** switch. The header and footer continue to use the existing **Global** single type.

Save changes as drafts, then **Publish** to update the website. Refresh the page (or focus the browser tab) to fetch published content. The frontend uses `VITE_CMS_URL` and calls `GET /api/venture-debt`. This public endpoint returns published content with nested media and components, and exposes no public write routes. Editing remains protected by Strapi admin permissions.

The current design includes placeholder FAQ and founder copy. Replace those in the CMS before production publication.

## Local setup

Run from this backend directory:

```powershell
npm run build
npm run seed:venture-debt
npm run start
```

If the backend is already running, restart it after the build so it loads the new content type and route. The seed imports the current frontend fallback JSON and uploads its images. It skips an existing Venture Debt document, including a draft, and does not overwrite editorial content. An alternative seed JSON can be supplied using `CAPITAR_VENTURE_DEBT_CONTENT`. Bootstrap seeding is opt-in with `CAPITAR_SEED_VENTURE_DEBT=true`.

The frontend's bundled fallback remains available when the CMS is unavailable or a section has malformed/missing content. Its source is `../capitar-ventures-frontend/src/content/venture-debt.json`.

## Verification

```powershell
npm run test:venture-debt
```

This uses an isolated SQLite database and port `3048`, verifies every section, uploaded media, repeatable seeding, draft isolation, publishing and read-only public access, and removes the test's uploaded files afterward. It leaves the editor's database unchanged.

Frontend coverage is in `tests/venture-debt-cms.spec.ts` and `tests/venture-debt.spec.ts`.
