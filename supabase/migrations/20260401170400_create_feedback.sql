create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text,
  username text,
  category text not null,
  message text not null,
  page text not null,
  user_agent text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint feedback_category_check check (category in ('bug', 'feedback', 'idea')),
  constraint feedback_status_check check (status in ('new', 'reviewed', 'done'))
);

alter table public.feedback enable row level security;

create policy "feedback_insert_own"
on public.feedback
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "feedback_select_own"
on public.feedback
for select
to authenticated
using (auth.uid() = user_id);
