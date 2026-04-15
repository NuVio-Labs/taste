create table public.shopping_lists (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  name              text        not null,
  recipes           jsonb       not null default '[]',
  checked_item_keys jsonb       not null default '[]',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.shopping_lists enable row level security;

create policy "Users can read own shopping lists"
  on public.shopping_lists for select
  using (auth.uid() = user_id);

create policy "Users can insert own shopping lists"
  on public.shopping_lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shopping lists"
  on public.shopping_lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own shopping lists"
  on public.shopping_lists for delete
  using (auth.uid() = user_id);

create index shopping_lists_user_id_idx on public.shopping_lists (user_id);
