# Job desk

A private TanStack Start dashboard for the job-tracker data source in Notion. Notion remains the only source of truth.

## Setup

1. Create an internal integration at [Notion integrations](https://www.notion.so/my-integrations), with **Read content** and **Update content** capabilities.
2. In your job database, open `•••` → **Add connections**, and add the integration.
3. In database settings, open **Manage data sources** and copy the data-source ID.
4. Copy `.env.example` to `.env.local`, then set every value: the Notion token/data-source ID plus `APP_USERNAME`, `APP_PASSWORD`, and a random `APP_SESSION_SECRET` of at least 32 characters.
5. Use Node.js 22.12 or newer, install dependencies, and run the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

The dashboard requires your personal username and password before it requests any Notion data. A successful sign-in creates a signed, HTTP-only, same-site session cookie that lasts 14 days. Sign out clears it immediately.

Credentials are kept in `.env.local` on your computer. Never commit this file.

## Deploy to Cloudflare Workers

1. Use Node.js 22.12 or newer and sign in to Cloudflare: `npx wrangler login`.
2. Set each secret in Cloudflare (repeat for all five):

```bash
npx wrangler secret put NOTION_TOKEN
npx wrangler secret put NOTION_APPLICATIONS_DATA_SOURCE_ID
npx wrangler secret put NOTION_PROFILE_PAGE_ID
npx wrangler secret put NOTION_SKILLS_DATA_SOURCE_ID
npx wrangler secret put NOTION_EXPERIENCE_PAGE_ID
npx wrangler secret put APP_USERNAME
npx wrangler secret put APP_PASSWORD
npx wrangler secret put APP_SESSION_SECRET
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put ANTHROPIC_MODEL

```

3. Deploy with `npm run deploy`.

Cloudflare stores these as encrypted Worker secrets; do not put them in `wrangler.jsonc` or commit them to the repository.

## Notion properties

The app uses the exact French property names supplied: `Titre`, `Commentaires`, `Compte a rebours relance`, `Date candidature`, `Date entretien`, `Entretien RH ?`, `Entretien tech ?`, `Motif`, `Nbr de relance`, `Statut`, `URL`, and `📲 Entretiens`.

The formula, follow-up button, relation, and last-modified fields are read-only in the dashboard; the app writes only editable offer fields and archives a deleted offer in Notion's trash.

A minimal TanStack Start app with one route and plain CSS.

```bash
npm install
npm run dev
```

Edit `src/routes/index.tsx` to get started. Add route files under
`src/routes`; TanStack Router updates `src/routeTree.gen.ts` for you.

Build the production app with:

```bash
npm run build
```
