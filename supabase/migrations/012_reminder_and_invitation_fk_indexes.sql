
create index if not exists review_reminder_deliveries_ai_system_idx
  on public.review_reminder_deliveries(ai_system_id, created_at desc);

create index if not exists workspace_invitations_invited_by_idx
  on public.workspace_invitations(invited_by);

create index if not exists workspace_invitations_accepted_by_idx
  on public.workspace_invitations(accepted_by);

create index if not exists workspace_reminder_settings_updated_by_idx
  on public.workspace_reminder_settings(updated_by);
