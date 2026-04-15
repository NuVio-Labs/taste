alter table public.recipes
  add column if not exists is_vegetarian boolean not null default false,
  add column if not exists is_vegan boolean not null default false;
