create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  meta_title text,
  meta_description text,
  excerpt text,
  content_md text not null,
  cover_image_url text,
  cover_alt text,
  tags text[] not null default '{}',
  primary_keyword text,
  faq jsonb not null default '[]'::jsonb,
  schema_jsonld jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  reading_minutes int default 5,
  author text,
  source text default 'autopilot',
  quality jsonb default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at desc);
grant select on public.blog_posts to anon, authenticated;
grant all on public.blog_posts to service_role;
alter table public.blog_posts enable row level security;
drop policy if exists "public can read published posts" on public.blog_posts;
create policy "public can read published posts" on public.blog_posts
  for select using (status = 'published');