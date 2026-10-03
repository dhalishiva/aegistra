create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free','team','business','enterprise')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.ai_systems (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  provider text,
  purpose text not null,
  owner_name text,
  owner_email text,
  lifecycle text not null default 'production' check (lifecycle in ('pilot','production','paused','retired')),
  data_sensitivity text not null default 'none' check (data_sensitivity in ('none','internal','personal','sensitive')),
  autonomy text not null default 'assistive' check (autonomy in ('assistive','recommendation','decision','autonomous')),
  impact text not null default 'low' check (impact in ('low','moderate','high')),
  human_review boolean not null default false,
  public_interaction boolean not null default false,
  generates_content boolean not null default false,
  priority_score integer not null default 0 check (priority_score between 0 and 100),
  priority_level text not null default 'low' check (priority_level in ('low','medium','high')),
  review_due date,
  last_reviewed date,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_system_id uuid references public.ai_systems(id) on delete set null,
  title text not null,
  owner text,
  due_date date,
  status text not null default 'open' check (status in ('open','in_progress','blocked','done')),
  completed_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_system_id uuid references public.ai_systems(id) on delete cascade,
  title text not null,
  evidence_type text not null default 'link' check (evidence_type in ('link','file','note','decision')),
  url text,
  notes text,
  valid_until date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists ai_systems_workspace_idx on public.ai_systems(workspace_id);
create index if not exists ai_systems_priority_idx on public.ai_systems(workspace_id, priority_score desc);
create index if not exists action_items_workspace_idx on public.action_items(workspace_id, status);
create index if not exists evidence_workspace_idx on public.evidence_items(workspace_id);

create or replace function private.is_workspace_member(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = wid and wm.user_id = (select auth.uid())
  );
$$;

create or replace function private.is_workspace_admin(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = wid
      and wm.user_id = (select auth.uid())
      and wm.role in ('owner','admin')
  );
$$;

revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.is_workspace_admin(uuid) from public, anon;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.is_workspace_admin(uuid) to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.ai_systems to authenticated;
grant select, insert, update, delete on public.action_items to authenticated;
grant select, insert, update, delete on public.evidence_items to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.ai_systems enable row level security;
alter table public.action_items enable row level security;
alter table public.evidence_items enable row level security;

create policy "profiles self select" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles self insert" on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles self update" on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "workspaces member select" on public.workspaces for select to authenticated using (private.is_workspace_member(id) or created_by = (select auth.uid()));
create policy "workspaces create" on public.workspaces for insert to authenticated with check (created_by = (select auth.uid()));
create policy "workspaces admin update" on public.workspaces for update to authenticated using (private.is_workspace_admin(id)) with check (private.is_workspace_admin(id));

create policy "members same workspace select" on public.workspace_members for select to authenticated using (private.is_workspace_member(workspace_id) or user_id = (select auth.uid()));
create policy "members owner bootstrap or admin insert" on public.workspace_members for insert to authenticated with check (
  private.is_workspace_admin(workspace_id)
  or (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (select 1 from public.workspaces w where w.id = workspace_id and w.created_by = (select auth.uid()))
  )
);
create policy "members admin update" on public.workspace_members for update to authenticated using (private.is_workspace_admin(workspace_id)) with check (private.is_workspace_admin(workspace_id));
create policy "members admin delete" on public.workspace_members for delete to authenticated using (private.is_workspace_admin(workspace_id));

create policy "systems workspace select" on public.ai_systems for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "systems workspace insert" on public.ai_systems for insert to authenticated with check (private.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy "systems workspace update" on public.ai_systems for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy "systems workspace delete" on public.ai_systems for delete to authenticated using (private.is_workspace_admin(workspace_id));

create policy "actions workspace select" on public.action_items for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "actions workspace insert" on public.action_items for insert to authenticated with check (private.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy "actions workspace update" on public.action_items for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy "actions workspace delete" on public.action_items for delete to authenticated using (private.is_workspace_member(workspace_id));

create policy "evidence workspace select" on public.evidence_items for select to authenticated using (private.is_workspace_member(workspace_id));
create policy "evidence workspace insert" on public.evidence_items for insert to authenticated with check (private.is_workspace_member(workspace_id) and created_by = (select auth.uid()));
create policy "evidence workspace update" on public.evidence_items for update to authenticated using (private.is_workspace_member(workspace_id)) with check (private.is_workspace_member(workspace_id));
create policy "evidence workspace delete" on public.evidence_items for delete to authenticated using (private.is_workspace_member(workspace_id));
