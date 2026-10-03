create table if not exists public.workspace_reminder_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  enabled boolean not null default false,
  days_before integer not null default 7 check (days_before between 1 and 60),
  include_overdue boolean not null default true,
  overdue_repeat_days integer not null default 7 check (overdue_repeat_days between 1 and 30),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ai_system_id uuid not null references public.ai_systems(id) on delete cascade,
  recipient_email text not null,
  reminder_kind text not null check (reminder_kind in ('upcoming','due_today','overdue')),
  due_date date not null,
  dedupe_key text not null,
  status text not null check (status in ('sent','failed','skipped')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists reminder_deliveries_workspace_created_idx
  on public.review_reminder_deliveries(workspace_id, created_at desc);

create index if not exists reminder_deliveries_dedupe_status_idx
  on public.review_reminder_deliveries(dedupe_key, status);

alter table public.workspace_reminder_settings enable row level security;
alter table public.review_reminder_deliveries enable row level security;

grant select on public.workspace_reminder_settings to authenticated;
grant insert, update on public.workspace_reminder_settings to authenticated;
grant select on public.review_reminder_deliveries to authenticated;

create policy "reminder settings workspace select"
  on public.workspace_reminder_settings
  for select
  to authenticated
  using (private.is_workspace_member(workspace_id));

create policy "reminder settings admin insert"
  on public.workspace_reminder_settings
  for insert
  to authenticated
  with check (
    private.is_workspace_admin(workspace_id)
    and updated_by = (select auth.uid())
  );

create policy "reminder settings admin update"
  on public.workspace_reminder_settings
  for update
  to authenticated
  using (private.is_workspace_admin(workspace_id))
  with check (
    private.is_workspace_admin(workspace_id)
    and updated_by = (select auth.uid())
  );

create policy "reminder deliveries workspace select"
  on public.review_reminder_deliveries
  for select
  to authenticated
  using (private.is_workspace_member(workspace_id));

create or replace function private.log_reminder_settings_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor_email text;
begin
  select email into actor_email
  from auth.users
  where id = new.updated_by;

  insert into public.activity_events (
    workspace_id,
    actor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    entity_name,
    metadata
  )
  values (
    new.workspace_id,
    new.updated_by,
    actor_email,
    'reminders.settings_updated',
    'workspace',
    new.workspace_id,
    'Review reminder settings',
    jsonb_build_object(
      'enabled', new.enabled,
      'days_before', new.days_before,
      'include_overdue', new.include_overdue,
      'overdue_repeat_days', new.overdue_repeat_days
    )
  );

  return new;
end;
$$;

drop trigger if exists reminder_settings_activity_insert on public.workspace_reminder_settings;
create trigger reminder_settings_activity_insert
after insert on public.workspace_reminder_settings
for each row execute function private.log_reminder_settings_activity();

drop trigger if exists reminder_settings_activity_update on public.workspace_reminder_settings;
create trigger reminder_settings_activity_update
after update on public.workspace_reminder_settings
for each row execute function private.log_reminder_settings_activity();

revoke all on function private.log_reminder_settings_activity()
  from public, anon, authenticated;
