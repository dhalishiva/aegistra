# Architecture

## Stack
Next.js App Router + TypeScript, Tailwind CSS, Supabase Auth/Postgres/RLS, Vercel Hosting and Vercel Analytics.

## Logical architecture
Browser → Next.js → Supabase Auth/Postgres.

The platform-admin route uses a server-only Supabase secret key and an email allow-list.

## Tenancy
Every customer-owned record carries a workspace_id. RLS policies enforce membership at the database layer using helper functions in a private schema.

## Route map
- / marketing
- /login, /signup
- /onboarding
- /app
- /app/systems
- /app/systems/new
- /app/actions
- /app/evidence
- /app/settings
- /admin

## Future additions
Supabase Storage for evidence files, scheduled reminders, billing, team invitations, audit logs, assurance-pack generation, and optional Workspace/Microsoft discovery connectors.
