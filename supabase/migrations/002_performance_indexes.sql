create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists workspaces_created_by_idx on public.workspaces(created_by);
create index if not exists ai_systems_created_by_idx on public.ai_systems(created_by);
create index if not exists action_items_ai_system_idx on public.action_items(ai_system_id);
create index if not exists action_items_created_by_idx on public.action_items(created_by);
create index if not exists evidence_items_ai_system_idx on public.evidence_items(ai_system_id);
create index if not exists evidence_items_created_by_idx on public.evidence_items(created_by);
