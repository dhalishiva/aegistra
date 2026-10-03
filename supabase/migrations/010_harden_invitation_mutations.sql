drop policy if exists "workspace admins create invitations" on public.workspace_invitations;
create policy "workspace admins create invitations"
  on public.workspace_invitations
  for insert
  to authenticated
  with check (
    invited_by = (select auth.uid())
    and (
      (private.is_workspace_owner(workspace_id) and role in ('admin','member','viewer'))
      or
      (
        private.is_workspace_admin(workspace_id)
        and not private.is_workspace_owner(workspace_id)
        and role in ('member','viewer')
      )
    )
  );

drop policy if exists "workspace admins update invitations" on public.workspace_invitations;
revoke update on public.workspace_invitations from authenticated;

create or replace function private.log_workspace_invitation_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  row_data public.workspace_invitations;
  event_action text;
  event_actor uuid;
  event_email text;
begin
  if tg_op = 'INSERT' then
    row_data := new;
    event_action := 'member.invited';
    event_actor := coalesce((select auth.uid()), new.invited_by);
  elsif tg_op = 'DELETE' then
    row_data := old;
    event_action := 'invite.revoked';
    event_actor := coalesce((select auth.uid()), old.invited_by);
  elsif old.accepted_at is null and new.accepted_at is not null then
    row_data := new;
    event_action := 'member.joined';
    event_actor := coalesce(new.accepted_by, (select auth.uid()));
  else
    return new;
  end if;

  select email into event_email from auth.users where id = event_actor;

  insert into public.activity_events (
    workspace_id, actor_id, actor_email, action, entity_type, entity_id, entity_name, metadata
  )
  values (
    row_data.workspace_id,
    event_actor,
    event_email,
    event_action,
    'workspace_member',
    coalesce(row_data.accepted_by, row_data.id),
    row_data.email,
    jsonb_build_object('role', row_data.role)
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists workspace_invitation_activity on public.workspace_invitations;
create trigger workspace_invitation_activity
after insert or update or delete on public.workspace_invitations
for each row execute function private.log_workspace_invitation_activity();
