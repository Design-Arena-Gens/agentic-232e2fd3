create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can manage own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users on delete cascade,
  parent_id uuid references public.pages on delete cascade,
  title text default 'Untitled',
  icon text,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pages enable row level security;

create policy "Users can read own pages"
  on public.pages
  for select
  using (auth.uid() = owner_id);

create policy "Users can insert own pages"
  on public.pages
  for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own pages"
  on public.pages
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete own pages"
  on public.pages
  for delete
  using (auth.uid() = owner_id);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages on delete cascade,
  owner_id uuid references auth.users on delete cascade,
  type text default 'paragraph',
  content jsonb default '{}'::jsonb,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.blocks enable row level security;

create policy "Users can read own blocks"
  on public.blocks
  for select
  using (auth.uid() = owner_id);

create policy "Users can insert own blocks"
  on public.blocks
  for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own blocks"
  on public.blocks
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete own blocks"
  on public.blocks
  for delete
  using (auth.uid() = owner_id);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_pages_updated_at
  before update on public.pages
  for each row execute procedure public.set_updated_at();

create trigger set_blocks_updated_at
  before update on public.blocks
  for each row execute procedure public.set_updated_at();
