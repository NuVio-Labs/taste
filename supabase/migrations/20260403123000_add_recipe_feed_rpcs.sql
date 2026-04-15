create or replace function public.get_recipe_feed()
returns table (
  id uuid,
  user_id uuid,
  title text,
  description text,
  image_url text,
  category text,
  prep_time integer,
  servings integer,
  is_public boolean,
  is_vegetarian boolean,
  is_vegan boolean,
  created_at timestamptz,
  updated_at timestamptz,
  author_name text,
  like_count integer,
  is_liked boolean,
  is_favorite boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.image_url,
    r.category,
    r.prep_time,
    r.servings,
    r.is_public,
    r.is_vegetarian,
    r.is_vegan,
    r.created_at,
    r.updated_at,
    coalesce(pp.username, 'Unbekannter Nutzer') as author_name,
    (
      select count(*)::integer
      from public.recipe_likes like_counts
      where like_counts.recipe_id = r.id
    ) as like_count,
    exists(
      select 1
      from public.recipe_likes own_like
      where own_like.recipe_id = r.id
        and own_like.user_id = auth.uid()
    ) as is_liked,
    exists(
      select 1
      from public.recipe_favorites own_favorite
      where own_favorite.recipe_id = r.id
        and own_favorite.user_id = auth.uid()
    ) as is_favorite
  from public.recipes r
  left join public.public_profiles pp on pp.id = r.user_id
  where auth.uid() is not null
    and (r.user_id = auth.uid() or r.is_public = true)
  order by r.created_at desc;
$$;

grant execute on function public.get_recipe_feed() to authenticated;

create or replace function public.get_favorite_recipe_feed()
returns table (
  id uuid,
  user_id uuid,
  title text,
  description text,
  image_url text,
  category text,
  prep_time integer,
  servings integer,
  is_public boolean,
  is_vegetarian boolean,
  is_vegan boolean,
  created_at timestamptz,
  updated_at timestamptz,
  author_name text,
  like_count integer,
  is_liked boolean,
  is_favorite boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.image_url,
    r.category,
    r.prep_time,
    r.servings,
    r.is_public,
    r.is_vegetarian,
    r.is_vegan,
    r.created_at,
    r.updated_at,
    coalesce(pp.username, 'Unbekannter Nutzer') as author_name,
    (
      select count(*)::integer
      from public.recipe_likes like_counts
      where like_counts.recipe_id = r.id
    ) as like_count,
    exists(
      select 1
      from public.recipe_likes own_like
      where own_like.recipe_id = r.id
        and own_like.user_id = auth.uid()
    ) as is_liked,
    true as is_favorite
  from public.recipe_favorites favorite
  join public.recipes r on r.id = favorite.recipe_id
  left join public.public_profiles pp on pp.id = r.user_id
  where auth.uid() is not null
    and favorite.user_id = auth.uid()
    and (r.user_id = auth.uid() or r.is_public = true)
  order by r.created_at desc;
$$;

grant execute on function public.get_favorite_recipe_feed() to authenticated;
