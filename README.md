# MarTech Discovery Platform

Static-first bilingual MarTech discovery platform with Cloudflare Pages Functions, D1-backed admin APIs, member accounts, vendor profiles, and SEO assets.

## Build

Requires Node.js and Wrangler 4.

```sh
node build.mjs
```

This generates the production site in `dist/`. Cloudflare Pages Functions are kept in `functions/` and use the D1 binding declared in `wrangler.jsonc`.

## Run locally

The public site is a Next.js app (React + TypeScript, App Router) in `app/`, `components/` and `lib/`, deployed to Cloudflare Workers with the OpenNext adapter. The API routes in `app/api/` run the existing handlers in `functions/api/` against the same D1 database. The admin console is still the old static page, served from `public/admin/`.

```sh
npm install
npm run db:migrate:local   # create the local D1 database
npm run seed:test          # local super admin: username "test", password "test"
npm run dev                # Next.js on http://localhost:3000
```

`npm run dev` first runs `scripts/export-catalog.mjs`, which builds `data/catalog.json` (the vendor catalog, still assembled by `build.mjs` from `vendors.txt` and friends) and copies static files into `public/`. Both are generated, so they are not committed.

Other commands: `npm run typecheck`, `npm run preview` (production build in the Workers runtime), `npm run deploy`, and `npm run legacy:dev` (the old static site on http://localhost:8788, sharing the same local database).

## Vendor profile content

Profile pages read `vendor-profiles.json`. Add an entry under `vendors` keyed by the vendor slug (the last part of `/providers/<slug>/`). Every field is optional and a section only appears when it has content. Copy the shape of `samples.sample`, which renders at `/en/providers/sample-featured/` and `/en/providers/sample-free/`.

Sponsored vendors get the Featured (paid) layout; set `"featured": true` or `false` to override. Free profiles are capped at 2 categories, a 200-character description, 3 benefits, 5 features, 2 use cases, 1 screenshot and 5 integrations; Featured profiles allow 6 categories, 500 characters, 10 benefits, 20 features, 10 use cases, 10 screenshots, 3 videos, pricing plans, customer proof, 5 case studies, 10 FAQs and a promotion. Text fields accept a plain string or `{ "en": "…", "th": "…" }`.

## Deploy

```sh
npm run deploy
```

This deploys a Cloudflare Worker (not Pages). The old Pages deploy was `node build.mjs && wrangler pages deploy dist`.

## Project layout

- `build.mjs` — generates localized pages, directory routes, sitemap, and AI discovery files.
- `functions/` — Cloudflare Pages Functions and API routes.
- `migrations/` — D1 schema migrations.
- `lang/` — locale dictionaries.
- `assets/` — platform artwork, fonts, and vendor logo assets.
- `data-ontology.json`, `vendor-categories.json`, `tool-descriptions.json` — platform catalog metadata.

## System architecture

See [SYSTEM-ARCHITECTURE.md](SYSTEM-ARCHITECTURE.md) for the page tree, request flows, D1 schema, role boundaries, sitemap generation, and which Backoffice modules currently persist data versus remain prototypes.

## Local data and secrets

Do not commit `.dev.vars`, `.env` files, Wrangler state, production database exports, or credentials. Local secret values belong in Wrangler's secret store or ignored local environment files.
