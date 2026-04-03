create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  avatar_url text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  constraint profiles_plan_check check (plan in ('free', 'pro'))
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace view public.public_profiles
with (security_invoker = true)
as
select id, username
from public.profiles;

grant select on public.public_profiles to authenticated;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  image_url text,
  category text not null default '',
  prep_time integer,
  servings integer,
  is_public boolean not null default false,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_user_id_idx
on public.recipes (user_id);

create index if not exists recipes_created_at_idx
on public.recipes (created_at desc);

create index if not exists recipes_public_created_at_idx
on public.recipes (is_public, created_at desc);

alter table public.recipes enable row level security;

create policy "recipes_select_own_or_public"
on public.recipes
for select
to authenticated
using (auth.uid() = user_id or is_public = true);

create policy "recipes_insert_own"
on public.recipes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "recipes_update_own"
on public.recipes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "recipes_delete_own"
on public.recipes
for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.recipe_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint recipe_likes_user_recipe_unique unique (user_id, recipe_id)
);

create index if not exists recipe_likes_user_id_idx
on public.recipe_likes (user_id);

create index if not exists recipe_likes_recipe_id_idx
on public.recipe_likes (recipe_id);

alter table public.recipe_likes enable row level security;

create policy "recipe_likes_select_own"
on public.recipe_likes
for select
to authenticated
using (auth.uid() = user_id);

create policy "recipe_likes_insert_own"
on public.recipe_likes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "recipe_likes_delete_own"
on public.recipe_likes
for delete
to authenticated
using (auth.uid() = user_id);
