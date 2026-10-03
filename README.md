# Aegistra

**Lightweight AI governance for teams that need a living AI register without an enterprise GRC rollout.**

Aegistra helps small and mid-sized organizations document where AI is used, who owns each use case, what needs review, and which evidence supports governance decisions.

> Aegistra organizes governance work. It does **not** provide legal advice, certification, or statutory AI-risk classification.

## What is included

- Public marketing site with product, pricing, security, privacy, and terms pages
- Email/password authentication with Supabase Auth
- Workspace onboarding and multi-tenant membership model
- AI system/use-case register
- Transparent governance-priority scoring
- Review dates and ownership tracking
- Governance action queue
- Private evidence uploads with signed download links
- Evidence-readiness view
- Database-backed workspace activity/audit timeline
- Workspace invitations with owner/admin/member/viewer roles
- Separate platform-admin page (`/admin`)
- Supabase Row Level Security (RLS)
- Dynamic Open Graph social preview, sitemap, and robots metadata
- Vercel Web Analytics integration
- Product, architecture, security, GTM, market-analysis, and sprint documentation

## Tech stack

- **Frontend / server:** Next.js 15 App Router + React 19 + TypeScript
- **UI:** Tailwind CSS + Lucide icons
- **Database / Auth:** Supabase Postgres + Supabase Auth + RLS
- **Hosting:** Vercel
- **Analytics:** Vercel Web Analytics

## Repository structure

```text
src/
  app/                  Next.js routes
    app/                Authenticated customer app
    admin/              Platform-admin area
    auth/callback/      Supabase PKCE callback
  components/           Shared UI
  lib/                  Supabase clients, actions, scoring
supabase/
  migrations/           Database schema and RLS
docs/
  PRD.md
  ARCHITECTURE.md
  SECURITY.md
  GTM.md
  MARKET_ANALYSIS.md
  SPRINTS.md
  DECISIONS.md
```

## Environment variables

Copy `.env.example` to `.env.local`.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
ADMIN_EMAILS=you@example.com
```

`SUPABASE_SECRET_KEY` is only required for the platform-admin dashboard. Never expose it through a `NEXT_PUBLIC_` variable.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Database

Create a Supabase project and apply:

```text
supabase/migrations/001_init.sql
supabase/migrations/002_performance_indexes.sql
```

The migrations create the workspace, member, AI-system, action, evidence, and profile tables and enable tenant-isolating RLS policies.

### Supabase Auth URLs

For local development, add:

```text
http://localhost:3000/auth/callback
```

to the allowed redirect URLs in Supabase Auth.

For production, add:

```text
https://YOUR_DOMAIN/auth/callback
```

and set the Supabase Site URL to the production domain.

## Production deployment on Vercel

1. Import this GitHub repository into Vercel.
2. Add the environment variables above for Production and Preview.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
4. Deploy.
5. Add the final production callback URL to Supabase Auth.
6. Verify signup, email confirmation, onboarding, system creation, action tracking, and workspace isolation.

Vercel Analytics is already mounted in `src/app/layout.tsx` via `@vercel/analytics/react`.

## Plans in the MVP

| Plan | Product hypothesis |
|---|---|
| Free | 3 AI systems |
| Team | $49/mo, up to 50 systems |
| Business | $149/mo, larger assurance workflows |

Billing is intentionally not wired in Sprint 1. The plan model is present so payment integration can be added after willingness-to-pay validation.

## Security model

- Tenant access is enforced in Postgres with RLS, not frontend filtering.
- Authorization helper functions live in a non-exposed `private` schema.
- The client uses only the Supabase publishable key.
- Platform-admin operations use a server-only Supabase secret key.
- The MVP stores governance metadata rather than production prompts/model traffic.
- Evidence files are stored in a private Supabase Storage bucket with workspace-scoped RLS and expiring signed URLs.
- Audit events are written automatically by Postgres triggers for key governance changes.
- Viewer access is read-only at the database policy layer; member/admin/owner permissions are enforced with RLS.

See [`docs/SECURITY.md`](docs/SECURITY.md) and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Product documentation

- [PRD](docs/PRD.md)
- [Market analysis](docs/MARKET_ANALYSIS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Go-to-market](docs/GTM.md)
- [Sprint plan](docs/SPRINTS.md)
- [Architecture decisions](docs/DECISIONS.md)

## Current MVP status

Sprint 1 includes the marketing site, authentication, tenant model, AI register, scoring, dashboard, actions, evidence view, SEO/social metadata, Vercel Analytics, and admin surface.

Sprint 2 now includes edit/detail screens, append-only review history, private evidence uploads, a database-backed activity log, team invitations/roles, and CSV import/export. The remaining Sprint 2 item is reminder email workflows before moving into billing and assurance-pack generation.

## License

Copyright © 2026. All rights reserved unless a separate license is added by the repository owner.
