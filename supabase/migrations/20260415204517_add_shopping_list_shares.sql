create table public.shopping_list_shares (
  id          uuid        primary key default gen_random_uuid(),
  list_id     uuid        not null references public.shopping_lists(id) on delete cascade,
  created_by  uuid        not null references auth.users(id) on delete cascade,
  token       text        not null unique default encode(gen_random_bytes(18), 'hex'),
  permission  text        not null default 'read',
  created_at  timestamptz not null default now(),
  constraint shopping_list_shares_permission_check check (permission in ('read', 'edit'))
);

alter table public.shopping_list_shares enable row level security;

create policy "Owner can manage own shares"
  on public.shopping_list_shares for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Authenticated users can read all shares"
  on public.shopping_list_shares for select
  using (auth.role() = 'authenticated');

-- security definer function to avoid RLS recursion when checking share access
create or replace function public.user_has_list_access(list_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.shopping_list_shares s
    where s.list_id = user_has_list_access.list_id
  );
$$;

-- Drop old select policy and replace with one that uses the helper function
drop policy if exists "Users can read own shopping lists" on public.shopping_lists;

create policy "Users can read own or shared shopping lists"
  on public.shopping_lists for select
  using (
    auth.uid() = user_id
    or public.user_has_list_access(id)
  );

-- Allow edit-permission holders to update shared lists
create policy "Shared list edit access"
  on public.shopping_lists for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.shopping_list_shares s
      where s.list_id = id
        and s.permission = 'edit'
    )
  );

create index shopping_list_shares_list_id_idx on public.shopping_list_shares (list_id);
create index shopping_list_shares_token_idx on public.shopping_list_shares (token);
