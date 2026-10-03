alter table public.evidence_items
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_workspace_created_idx
  on public.activity_events(workspace_id, created_at desc);

create index if not exists activity_events_actor_idx
  on public.activity_events(actor_id, created_at desc);

grant select, insert on public.activity_events to authenticated;

alter table public.activity_events enable row level security;

create policy "activity workspace select"
  on public.activity_events
  for select
  to authenticated
  using (private.is_workspace_member(workspace_id));

create policy "activity workspace insert"
  on public.activity_events
  for insert
  to authenticated
  with check (
    private.is_workspace_member(workspace_id)
    and actor_id = (select auth.uid())
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'evidence',
  'evidence',
  false,
  15728640,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "workspace members upload evidence"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'evidence'
    and private.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

create policy "workspace members read evidence"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'evidence'
    and private.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

create policy "workspace members delete evidence"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'evidence'
    and private.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );
