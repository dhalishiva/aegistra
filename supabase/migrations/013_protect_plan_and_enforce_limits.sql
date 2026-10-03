-- Stop clients from changing their own plan, and enforce the AI-system limit in the database.

-- 1. Column-level privileges: clients may only set the workspace name on insert/update.
revoke insert, update, truncate, references, trigger on public.workspaces from anon, authenticated;
grant insert (id, name, created_by, created_at) on public.workspaces to authenticated;
grant update (name) on public.workspaces to authenticated;

-- 2. Public (anonymous) role has no business touching application tables. RLS already blocks rows;
--    this removes the grants as defence in depth.
revoke all on all tables in schema public from anon;

-- 3. Authenticated users never need these table-level powers (RLS does not cover TRUNCATE).
revoke truncate, references, trigger on all tables in schema public from authenticated;

-- 4. Enforce plan limits on ai_systems regardless of which client writes.
create or replace function private.enforce_ai_system_limit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  plan_name text;
  max_systems int;
  current_count int;
begin
  select plan into plan_name from public.workspaces where id = new.workspace_id;
  max_systems := case coalesce(plan_name, 'free')
    when 'free' then 3
    when 'team' then 50
    else 100000
  end;

  select count(*) into current_count from public.ai_systems where workspace_id = new.workspace_id;

  if current_count >= max_systems then
    raise exception 'Your % plan AI-system limit has been reached.', coalesce(plan_name, 'free')
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_ai_system_limit() from public, anon, authenticated;

drop trigger if exists ai_system_plan_limit on public.ai_systems;
create trigger ai_system_plan_limit
  before insert on public.ai_systems
  for each row execute function private.enforce_ai_system_limit();
