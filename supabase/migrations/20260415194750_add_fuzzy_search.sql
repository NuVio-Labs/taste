-- Enable trigram extension for fuzzy/similarity search
create extension if not exists pg_trgm;

-- GIN index on recipes for fast trigram search across title, description, category
create index if not exists recipes_search_trgm_idx
  on public.recipes
  using gin (
    (coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, ''))
    gin_trgm_ops
  );

-- RPC: fuzzy recipe search
-- Returns recipes visible to the user (own + public) ranked by similarity
create or replace function public.search_recipes(
  p_user_id uuid,
  p_query    text
)
returns table (
  id            uuid,
  user_id       uuid,
  title         text,
  description   text,
  image_url     text,
  category      text,
  prep_time     int,
  servings      int,
  is_public     boolean,
  is_vegetarian boolean,
  is_vegan      boolean,
  created_at    timestamptz,
  updated_at    timestamptz,
  similarity    float4
)
language sql
stable
security definer
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
    greatest(
      similarity(r.title,       p_query),
      similarity(coalesce(r.description, ''), p_query),
      similarity(coalesce(r.category, ''),    p_query)
    ) as similarity
  from public.recipes r
  where
    (r.user_id = p_user_id or r.is_public = true)
    and (
      r.title          ilike '%' || p_query || '%'
      or r.description ilike '%' || p_query || '%'
      or r.category    ilike '%' || p_query || '%'
      or r.title                     % p_query
      or coalesce(r.description, '') % p_query
      or coalesce(r.category, '')    % p_query
    )
  order by similarity desc, r.created_at desc;
$$;

-- Allow authenticated users to call this function
grant execute on function public.search_recipes(uuid, text) to authenticated;
