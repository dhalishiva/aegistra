# Security Baseline

## MVP controls
- Collect governance metadata rather than production prompts/model traffic.
- Enforce tenant isolation with Postgres Row Level Security.
- Keep evidence files in a private Supabase Storage bucket with workspace-scoped object policies.
- Generate short-lived signed URLs for evidence downloads.
- Write key audit events through database triggers rather than relying only on frontend logging.
- Validate CSV imports server-side, enforce workspace RLS, cap imports at 500 rows / 2 MB, and reapply plan limits before batch insert.
- Keep SUPABASE_SECRET_KEY server-only.
- Gate /admin with an authenticated email allow-list.
- Use a non-exposed private schema for authorization helper functions.
- Do not expose secrets through NEXT_PUBLIC_ variables.
- Use HTTPS in production.

## Before paid launch
- Add CSP and hardened response headers.
- Add mutation audit logging.
- Add stricter role-based write policies.
- Configure stronger password/rate-limit policy and admin MFA.
- Establish backup/restore tests.
- Finalize DPA, subprocessors and privacy documentation.
- Add dependency scanning/SAST.
- Perform an external security review before selling into regulated enterprise accounts.
