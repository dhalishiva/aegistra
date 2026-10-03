alter table public.activity_events alter column actor_id drop not null;

revoke insert on public.activity_events from authenticated;

drop policy if exists "activity workspace insert" on public.activity_events;

create or replace function private.log_ai_system_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.activity_events (
    workspace_id, actor_id, actor_email, action, entity_type, entity_id, entity_name, metadata
  )
  values (
    new.workspace_id,
    (select auth.uid()),
    (select auth.jwt()->>'email'),
    case when tg_op = 'INSERT' then 'ai_system.created' else 'ai_system.updated' end,
    'ai_system',
    new.id,
    new.name,
    jsonb_build_object(
      'priority_level', new.priority_level,
      'priority_score', new.priority_score,
      'lifecycle', new.lifecycle
    )
  );
  return new;
end;
$$;

create or replace function private.log_system_review_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  system_name text;
begin
  select name into system_name from public.ai_systems where id = new.ai_system_id;

  insert into public.activity_events (
    workspace_id, actor_id, actor_email, action, entity_type, entity_id, entity_name, metadata
  )
  values (
    new.workspace_id,
    (select auth.uid()),
    (select auth.jwt()->>'email'),
    'ai_system.reviewed',
    'ai_system',
    new.ai_system_id,
    system_name,
    jsonb_build_object(
      'outcome', new.outcome,
      'next_review_due', new.next_review_due
    )
  );
  return new;
end;
$$;

create or replace function private.log_action_item_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  event_action text;
begin
  if tg_op = 'INSERT' then
    event_action := 'action.created';
  elsif old.status is distinct from new.status and new.status = 'done' then
    event_action := 'action.completed';
  else
    event_action := 'action.updated';
  end if;

  insert into public.activity_events (
    workspace_id, actor_id, actor_email, action, entity_type, entity_id, entity_name, metadata
  )
  values (
    new.workspace_id,
    (select auth.uid()),
    (select auth.jwt()->>'email'),
    event_action,
    'action_item',
    new.id,
    new.title,
    jsonb_build_object(
      'status', new.status,
      'due_date', new.due_date,
      'owner', new.owner
    )
  );
  return new;
end;
$$;

create or replace function private.log_evidence_activity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  row_data public.evidence_items;
  event_action text;
begin
  if tg_op = 'DELETE' then
    row_data := old;
    event_action := 'evidence.deleted';
  else
    row_data := new;
    event_action := 'evidence.uploaded';
  end if;

  insert into public.activity_events (
    workspace_id, actor_id, actor_email, action, entity_type, entity_id, entity_name, metadata
  )
  values (
    row_data.workspace_id,
    (select auth.uid()),
    (select auth.jwt()->>'email'),
    event_action,
    'evidence',
    row_data.id,
    row_data.title,
    jsonb_build_object(
      'file_name', row_data.file_name,
      'evidence_type', row_data.evidence_type,
      'ai_system_id', row_data.ai_system_id
    )
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists ai_system_activity_insert on public.ai_systems;
create trigger ai_system_activity_insert
after insert on public.ai_systems
for each row execute function private.log_ai_system_activity();

drop trigger if exists ai_system_activity_update on public.ai_systems;
create trigger ai_system_activity_update
after update on public.ai_systems
for each row execute function private.log_ai_system_activity();

drop trigger if exists system_review_activity_insert on public.system_reviews;
create trigger system_review_activity_insert
after insert on public.system_reviews
for each row execute function private.log_system_review_activity();

drop trigger if exists action_item_activity_insert on public.action_items;
create trigger action_item_activity_insert
after insert on public.action_items
for each row execute function private.log_action_item_activity();

drop trigger if exists action_item_activity_update on public.action_items;
create trigger action_item_activity_update
after update on public.action_items
for each row execute function private.log_action_item_activity();

drop trigger if exists evidence_activity_insert on public.evidence_items;
create trigger evidence_activity_insert
after insert on public.evidence_items
for each row execute function private.log_evidence_activity();

drop trigger if exists evidence_activity_delete on public.evidence_items;
create trigger evidence_activity_delete
after delete on public.evidence_items
for each row execute function private.log_evidence_activity();

revoke all on function private.log_ai_system_activity() from public, anon, authenticated;
revoke all on function private.log_system_review_activity() from public, anon, authenticated;
revoke all on function private.log_action_item_activity() from public, anon, authenticated;
revoke all on function private.log_evidence_activity() from public, anon, authenticated;
