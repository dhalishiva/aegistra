create table if not exists public.system_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_system_id uuid not null references public.ai_systems(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  outcome text not null default 'approved'
    check (outcome in ('approved','changes_required','paused')),
  notes text,
  reviewed_at timestamptz not null default now(),
  next_review_due date,
  created_at timestamptz not null default now()
);

create index if not exists system_reviews_ai_system_idx
  on public.system_reviews(ai_system_id, reviewed_at desc);

create index if not exists system_reviews_workspace_idx
  on public.system_reviews(workspace_id, reviewed_at desc);

grant select, insert on public.system_reviews to authenticated;

alter table public.system_reviews enable row level security;

create policy "reviews workspace select"
  on public.system_reviews
  for select
  to authenticated
  using (private.is_workspace_member(workspace_id));

create policy "reviews workspace insert"
  on public.system_reviews
  for insert
  to authenticated
  with check (
    private.is_workspace_member(workspace_id)
    and reviewer_id = (select auth.uid())
  );
