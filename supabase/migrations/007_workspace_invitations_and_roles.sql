create or replace function private.is_workspace_owner(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = wid
      and wm.user_id = (select auth.uid())
      and wm.role = 'owner'
  );
$$;

create or replace function private.can_workspace_write(wid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = wid
      and wm.user_id = (select auth.uid())
      and wm.role in ('owner','admin','member')
  );
$$;

revoke all on function private.is_workspace_owner(uuid) from public, anon;
revoke all on function private.can_workspace_write(uuid) from public, anon;
grant execute on function private.is_workspace_owner(uuid) to authenticated;
grant execute on function private.can_workspace_write(uuid) to authenticated;

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin','member','viewer')),
  token_hash text not null unique,
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint workspace_invitations_email_lowercase check (email = lower(email))
);

create index if not exists workspace_invitations_workspace_idx
  on public.workspace_invitations(workspace_id, created_at desc);

create index if not exists workspace_invitations_email_idx
  on public.workspace_invitations(lower(email));

alter table public.workspace_invitations enable row level security;

grant select, insert, update, delete on public.workspace_invitations to authenticated;

create policy "workspace admins view invitations"
  on public.workspace_invitations
  for select
  to authenticated
  using (private.is_workspace_admin(workspace_id));

create policy "workspace admins create invitations"
  on public.workspace_invitations
  for insert
  to authenticated
  with check (
    private.is_workspace_admin(workspace_id)
    and invited_by = (select auth.uid())
  );

create policy "workspace admins update invitations"
  on public.workspace_invitations
  for update
  to authenticated
  using (private.is_workspace_admin(workspace_id))
  with check (private.is_workspace_admin(workspace_id));

create policy "workspace admins delete invitations"
  on public.workspace_invitations
  for delete
  to authenticated
  using (private.is_workspace_admin(workspace_id));

drop policy if exists "members owner bootstrap or admin insert" on public.workspace_members;
create policy "members owner bootstrap insert"
  on public.workspace_members
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1
      from public.workspaces w
      where w.id = workspace_id
        and w.created_by = (select auth.uid())
    )
  );

drop policy if exists "members admin update" on public.workspace_members;
create policy "members controlled update"
  on public.workspace_members
  for update
  to authenticated
  using (
    user_id <> (select auth.uid())
    and (
      (private.is_workspace_owner(workspace_id) and role in ('admin','member','viewer'))
      or
      (private.is_workspace_admin(workspace_id) and not private.is_workspace_owner(workspace_id) and role in ('member','viewer'))
    )
  )
  with check (
    role in ('admin','member','viewer')
    and (
      private.is_workspace_owner(workspace_id)
      or (
        private.is_workspace_admin(workspace_id)
        and not private.is_workspace_owner(workspace_id)
        and role in ('member','viewer')
      )
    )
  );

drop policy if exists "members admin delete" on public.workspace_members;
create policy "members controlled delete"
  on public.workspace_members
  for delete
  to authenticated
  using (
    user_id <> (select auth.uid())
    and (
      (private.is_workspace_owner(workspace_id) and role in ('admin','member','viewer'))
      or
      (private.is_workspace_admin(workspace_id) and not private.is_workspace_owner(workspace_id) and role in ('member','viewer'))
    )
  );

drop policy if exists "systems workspace insert" on public.ai_systems;
create policy "systems workspace insert"
  on public.ai_systems
  for insert
  to authenticated
  with check (
    private.can_workspace_write(workspace_id)
    and created_by = (select auth.uid())
  );

drop policy if exists "systems workspace update" on public.ai_systems;
create policy "systems workspace update"
  on public.ai_systems
  for update
  to authenticated
  using (private.can_workspace_write(workspace_id))
  with check (private.can_workspace_write(workspace_id));

drop policy if exists "actions workspace insert" on public.action_items;
create policy "actions workspace insert"
  on public.action_items
  for insert
  to authenticated
  with check (
    private.can_workspace_write(workspace_id)
    and created_by = (select auth.uid())
  );

drop policy if exists "actions workspace update" on public.action_items;
create policy "actions workspace update"
  on public.action_items
  for update
  to authenticated
  using (private.can_workspace_write(workspace_id))
  with check (private.can_workspace_write(workspace_id));

drop policy if exists "actions workspace delete" on public.action_items;
create policy "actions workspace delete"
  on public.action_items
  for delete
  to authenticated
  using (private.can_workspace_write(workspace_id));

drop policy if exists "evidence workspace insert" on public.evidence_items;
create policy "evidence workspace insert"
  on public.evidence_items
  for insert
  to authenticated
  with check (
    private.can_workspace_write(workspace_id)
    and created_by = (select auth.uid())
  );

drop policy if exists "evidence workspace update" on public.evidence_items;
create policy "evidence workspace update"
  on public.evidence_items
  for update
  to authenticated
  using (private.can_workspace_write(workspace_id))
  with check (private.can_workspace_write(workspace_id));

drop policy if exists "evidence workspace delete" on public.evidence_items;
create policy "evidence workspace delete"
  on public.evidence_items
  for delete
  to authenticated
  using (private.can_workspace_write(workspace_id));

drop policy if exists "reviews workspace insert" on public.system_reviews;
create policy "reviews workspace insert"
  on public.system_reviews
  for insert
  to authenticated
  with check (
    private.can_workspace_write(workspace_id)
    and reviewer_id = (select auth.uid())
  );

drop policy if exists "workspace members upload evidence" on storage.objects;
create policy "workspace members upload evidence"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'evidence'
    and private.can_workspace_write(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "workspace members delete evidence" on storage.objects;
create policy "workspace members delete evidence"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'evidence'
    and private.can_workspace_write(((storage.foldername(name))[1])::uuid)
  );

create or replace function private.log_workspace_invitation_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  event_action text;
  event_actor uuid;
  event_email text;
begin
  if tg_op = 'INSERT' then
    event_action := 'member.invited';
    event_actor := coalesce((select auth.uid()), new.invited_by);
  elsif old.accepted_at is null and new.accepted_at is not null then
    event_action := 'member.joined';
    event_actor := coalesce(new.accepted_by, (select auth.uid()));
  elsif old.revoked_at is null and new.revoked_at is not null then
    event_action := 'invite.revoked';
    event_actor := coalesce((select auth.uid()), new.invited_by);
  else
    return new;
  end if;

  select email into event_email from auth.users where id = event_actor;

  insert into public.activity_events (
    workspace_id, actor_id, actor_email, action, entity_type, entity_id, entity_name, metadata
  )
  values (
    new.workspace_id,
    event_actor,
    event_email,
    event_action,
    'workspace_member',
    coalesce(new.accepted_by, new.id),
    new.email,
    jsonb_build_object('role', new.role)
  );

  return new;
end;
$$;

create or replace function private.log_workspace_member_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  row_data public.workspace_members;
  event_action text;
  target_email text;
  event_actor uuid;
  event_actor_email text;
begin
  row_data := case when tg_op = 'DELETE' then old else new end;

  if tg_op = 'INSERT' then
    event_action := 'member.added';
  elsif tg_op = 'DELETE' then
    event_action := 'member.removed';
  elsif old.role is distinct from new.role then
    event_action := 'member.role_changed';
  else
    return new;
  end if;

  event_actor := coalesce((select auth.uid()), row_data.user_id);
  select email into event_actor_email from auth.users where id = event_actor;
  select email into target_email from auth.users where id = row_data.user_id;

  insert into public.activity_events (
    workspace_id, actor_id, actor_email, action, entity_type, entity_id, entity_name, metadata
  )
  values (
    row_data.workspace_id,
    event_actor,
    event_actor_email,
    event_action,
    'workspace_member',
    row_data.user_id,
    target_email,
    jsonb_build_object(
      'role', row_data.role,
      'previous_role', case when tg_op = 'UPDATE' then old.role else null end
    )
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists workspace_invitation_activity on public.workspace_invitations;
create trigger workspace_invitation_activity
after insert or update on public.workspace_invitations
for each row execute function private.log_workspace_invitation_activity();

drop trigger if exists workspace_member_activity_insert on public.workspace_members;
create trigger workspace_member_activity_insert
after insert on public.workspace_members
for each row execute function private.log_workspace_member_activity();

drop trigger if exists workspace_member_activity_update on public.workspace_members;
create trigger workspace_member_activity_update
after update on public.workspace_members
for each row execute function private.log_workspace_member_activity();

drop trigger if exists workspace_member_activity_delete on public.workspace_members;
create trigger workspace_member_activity_delete
after delete on public.workspace_members
for each row execute function private.log_workspace_member_activity();

revoke all on function private.log_workspace_invitation_activity() from public, anon, authenticated;
revoke all on function private.log_workspace_member_activity() from public, anon, authenticated;
