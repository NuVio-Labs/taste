alter table public.profiles
  alter column plan set default 'free';

alter table public.profiles
  add column if not exists billing_status text not null default 'inactive',
  add column if not exists access_source text not null default 'free',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists current_period_end timestamptz,
  add column if not exists gifted_until timestamptz;

alter table public.profiles
  drop constraint if exists profiles_billing_status_check;

alter table public.profiles
  add constraint profiles_billing_status_check
  check (
    billing_status in (
      'inactive',
      'active',
      'trialing',
      'past_due',
      'canceled',
      'unpaid'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_access_source_check;

alter table public.profiles
  add constraint profiles_access_source_check
  check (
    access_source in (
      'free',
      'manual',
      'stripe'
    )
  );

update public.profiles
set access_source = 'manual'
where plan = 'pro'
  and stripe_customer_id is null
  and stripe_subscription_id is null;

create unique index if not exists profiles_stripe_customer_id_key
on public.profiles (stripe_customer_id)
where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_id_key
on public.profiles (stripe_subscription_id)
where stripe_subscription_id is not null;
