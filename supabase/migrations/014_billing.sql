-- Razorpay subscription billing. All writes happen server-side with the service role.

alter table public.workspaces
  add column if not exists billing_subscription_id text,
  add column if not exists billing_status text,
  add column if not exists billing_period_end timestamptz;

-- Razorpay plan ids are created once per tier/currency/amount and reused.
create table if not exists public.billing_plans (
  key text primary key,
  razorpay_plan_id text not null,
  currency text not null,
  amount integer not null,
  created_at timestamptz not null default now()
);

-- Webhook de-duplication.
create table if not exists public.billing_events (
  event_id text primary key,
  event text not null,
  received_at timestamptz not null default now()
);

alter table public.billing_plans enable row level security;
alter table public.billing_events enable row level security;
revoke all on public.billing_plans from anon, authenticated;
revoke all on public.billing_events from anon, authenticated;

-- Make sure the new workspace columns stay read-only for clients (column grants from migration 013 still apply).
revoke insert, update on public.workspaces from anon, authenticated;
grant insert (id, name, created_by, created_at) on public.workspaces to authenticated;
grant update (name) on public.workspaces to authenticated;
