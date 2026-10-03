create or replace function private.workspace_member_directory(p_workspace_id uuid)
returns table (
  user_id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, private
as $$
begin
  if not private.is_workspace_member(p_workspace_id) then
    raise exception 'Workspace access denied';
  end if;

  return query
  select
    wm.user_id,
    au.email::text,
    p.full_name,
    wm.role,
    wm.created_at
  from public.workspace_members wm
  join auth.users au on au.id = wm.user_id
  left join public.profiles p on p.user_id = wm.user_id
  where wm.workspace_id = p_workspace_id
  order by
    case wm.role
      when 'owner' then 1
      when 'admin' then 2
      when 'member' then 3
      else 4
    end,
    wm.created_at;
end;
$$;

revoke all on function private.workspace_member_directory(uuid)
  from public, anon;
grant execute on function private.workspace_member_directory(uuid)
  to authenticated;

create or replace function public.workspace_member_directory(p_workspace_id uuid)
returns table (
  user_id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = pg_catalog, public, private
as $$
  select * from private.workspace_member_directory(p_workspace_id);
$$;

revoke all on function public.workspace_member_directory(uuid)
  from public, anon;
grant execute on function public.workspace_member_directory(uuid)
  to authenticated;
