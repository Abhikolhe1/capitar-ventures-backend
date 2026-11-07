# Portfolio CMS

The **Portfolio** single type controls `/portfolio`. Header and footer remain in
Global. Featured Stories has its own content here; editing it does not change
the homepage's stories.

- Hero: visibility, title, emphasized copy, description, background image and CTA.
- Featured Stories: visibility, badge, heading, description, ordered story cards,
  uploaded images/logos and optional links.
- Companies Section: visibility, headings, filter labels and empty-state copy.
- Companies: add, remove or reorder cards; edit the stable key, company name,
  uploaded logo, description, sector, investment stage, status and founder.
  Filter options and result counts derive from the current list.
- Conversation: visibility, badge, headline, description, optional background and CTA.

Use a distinct stable key for each card. Sector/stage spelling determines filter
grouping. Saving a draft does not change the public page; **Publish** releases it.
An empty published company list intentionally shows the empty state.

`GET /api/portfolio` is public, read-only, fully populated and always published.
Caller-supplied draft/populate queries cannot override that policy. Editing is
through authenticated Strapi Content Manager; public create/update/delete routes
are not registered.

## Local setup

With the frontend repository beside the backend, run `npm run seed:portfolio`.
It uploads the page's existing assets and creates a published document only if
neither a draft nor a published Portfolio exists. Existing work is never replaced.
For another frontend location, set `CAPITAR_FRONTEND_PATH` to its absolute path.
Do not run two CMS processes against the same SQLite database while seeding.
Restart the local CMS to load the new schemas and rebuild the admin UI as needed.

For a deployed setup, deploy/build the backend schemas before configuring content
in its CMS. Initial population can also use an explicitly enabled
`CAPITAR_SEED_PORTFOLIO=true` bootstrap with the frontend sources/assets available;
remove the flag afterward. This task does not deploy or alter the production CMS.

Frontend uses `VITE_CMS_URL` and keeps bundled defaults when the endpoint is
unavailable/unpublished. It refreshes on window focus, validates media/link URLs,
supports disabled sections and does not replace an intentionally empty list.

The initial seed mirrors the approved Figma draft, including repeated placeholder
company/founder details; replace those with approved content in the CMS.

Run `npm run test:portfolio` for an isolated SQLite/API integration test. It does
not modify the editor's CMS database or drafts.
