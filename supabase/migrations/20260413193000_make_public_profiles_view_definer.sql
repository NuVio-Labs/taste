create or replace view public.public_profiles
with (security_invoker = false)
as
select id, username
from public.profiles;

grant select on public.public_profiles to authenticated;
