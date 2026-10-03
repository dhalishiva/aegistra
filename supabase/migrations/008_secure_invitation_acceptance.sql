create or replace function private.accept_workspace_invitation(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  invitation public.workspace_invitations;
  current_user_id uuid := (select auth.uid());
  current_email text := lower(coalesce((select auth.jwt()->>'email'), ''));
  existing_workspace_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into invitation
  from public.workspace_invitations wi
  where wi.token_hash = p_token_hash
    and wi.accepted_at is null
    and wi.revoked_at is null
    and wi.expires_at > now()
  for update;

  if not found then
    raise exception 'Invitation is invalid or expired';
  end if;

  if current_email = '' or current_email <> invitation.email then
    raise exception 'Sign in with the email address that was invited';
  end if;

  select wm.workspace_id
  into existing_workspace_id
  from public.workspace_members wm
  where wm.user_id = current_user_id
  limit 1;

  if existing_workspace_id is not null
     and existing_workspace_id <> invitation.workspace_id then
    raise exception 'This account already belongs to another workspace';
  end if;

  if existing_workspace_id is null then
    insert into public.workspace_members (workspace_id, user_id, role)
    values (invitation.workspace_id, current_user_id, invitation.role);
  end if;

  insert into public.profiles (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  update public.workspace_invitations
  set accepted_at = now(),
      accepted_by = current_user_id
  where id = invitation.id;

  return jsonb_build_object(
    'ok', true,
    'workspace_id', invitation.workspace_id,
    'role', invitation.role
  );
end;
$$;

revoke all on function private.accept_workspace_invitation(text)
  from public, anon;
grant execute on function private.accept_workspace_invitation(text)
  to authenticated;

create or replace function public.accept_workspace_invitation(p_token_hash text)
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, private
as $$
  select private.accept_workspace_invitation(p_token_hash);
$$;

revoke all on function public.accept_workspace_invitation(text)
  from public, anon;
grant execute on function public.accept_workspace_invitation(text)
  to authenticated;
