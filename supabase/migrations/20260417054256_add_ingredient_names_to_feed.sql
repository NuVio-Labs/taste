drop function if exists public.get_recipe_feed();
drop function if exists public.get_favorite_recipe_feed();

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
  is_favorite boolean,
  ingredient_names text
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
      from public.recipe_likes lc
      where lc.recipe_id = r.id
    ) as like_count,
    exists(
      select 1 from public.recipe_likes ol
      where ol.recipe_id = r.id and ol.user_id = auth.uid()
    ) as is_liked,
    exists(
      select 1 from public.recipe_favorites of
      where of.recipe_id = r.id and of.user_id = auth.uid()
    ) as is_favorite,
    coalesce(
      (
        select string_agg(elem->>'name', ' ')
        from jsonb_array_elements(coalesce(r.ingredients, '[]'::jsonb)) as elem
      ),
      ''
    ) as ingredient_names
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
  is_favorite boolean,
  ingredient_names text
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
      from public.recipe_likes lc
      where lc.recipe_id = r.id
    ) as like_count,
    exists(
      select 1 from public.recipe_likes ol
      where ol.recipe_id = r.id and ol.user_id = auth.uid()
    ) as is_liked,
    true as is_favorite,
    coalesce(
      (
        select string_agg(elem->>'name', ' ')
        from jsonb_array_elements(coalesce(r.ingredients, '[]'::jsonb)) as elem
      ),
      ''
    ) as ingredient_names
  from public.recipe_favorites fav
  join public.recipes r on r.id = fav.recipe_id
  left join public.public_profiles pp on pp.id = r.user_id
  where auth.uid() is not null
    and fav.user_id = auth.uid()
    and (r.user_id = auth.uid() or r.is_public = true)
  order by r.created_at desc;
$$;

grant execute on function public.get_favorite_recipe_feed() to authenticated;
