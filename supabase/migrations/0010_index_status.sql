-- Google index status per page, from the Search Console URL Inspection API.
-- Written by the admin "Google" page; only the server (service-role key) reads it.
-- Safe to run more than once.
create table if not exists public.index_status (
  url text primary key,
  verdict text,
  coverage_state text,
  robots_txt_state text,
  indexing_state text,
  page_fetch_state text,
  last_crawl_time timestamptz,
  google_canonical text,
  user_canonical text,
  error text,
  checked_at timestamptz not null default now()
);

create index if not exists index_status_checked_idx on public.index_status (checked_at);

alter table public.index_status enable row level security;
