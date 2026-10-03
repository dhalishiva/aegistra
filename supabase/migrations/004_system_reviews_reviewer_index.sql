create index if not exists system_reviews_reviewer_idx
  on public.system_reviews(reviewer_id, reviewed_at desc);
