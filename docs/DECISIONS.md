# Architecture Decisions

## ADR-001 — Next.js + Supabase + Vercel
Chosen to minimize infrastructure overhead while keeping server-rendered product pages, auth, Postgres, RLS and straightforward deployment.

## ADR-002 — Database-enforced tenancy
Workspace isolation is enforced with Supabase RLS rather than relying on frontend query filters.

## ADR-003 — No runtime model proxy in MVP
Aegistra records governance metadata. It does not sit in the LLM request path, lowering security, integration and sales friction.

## ADR-004 — Priority score is not legal classification
The score exists only to order internal governance work. Statutory classifications remain the customer’s responsibility.

## ADR-005 — Billing deferred
Plan concepts exist in the data model, but payment processing is deferred until willingness-to-pay is validated.
