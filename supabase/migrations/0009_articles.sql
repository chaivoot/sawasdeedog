-- Articles ("เรื่องหมาๆ"), written by the team in the admin. Like places, only the
-- server (service-role key) reads or writes them. Safe to run more than once.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text,
  cover_url text,
  -- Simple markup: ## headings, paragraphs, - lists, **bold**, [links](url),
  -- ![images](url) and [[place:slug]] place cards, one block per blank-line gap.
  body text not null default '',
  author text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists articles_published_idx on public.articles (published_at desc) where published;

alter table public.articles enable row level security;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();
