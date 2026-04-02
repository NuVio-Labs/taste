create table if not exists public.recipe_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint recipe_favorites_user_recipe_unique unique (user_id, recipe_id)
);

create index if not exists recipe_favorites_user_id_idx
on public.recipe_favorites (user_id);

create index if not exists recipe_favorites_recipe_id_idx
on public.recipe_favorites (recipe_id);

alter table public.recipe_favorites enable row level security;

create policy "recipe_favorites_select_own"
on public.recipe_favorites
for select
to authenticated
using (auth.uid() = user_id);

create policy "recipe_favorites_insert_own"
on public.recipe_favorites
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "recipe_favorites_delete_own"
on public.recipe_favorites
for delete
to authenticated
using (auth.uid() = user_id);
