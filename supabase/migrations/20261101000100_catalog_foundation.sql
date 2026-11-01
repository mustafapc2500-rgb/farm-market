-- Farm Market database foundation. REVIEW FIRST; do not apply automatically.
-- Run once, as postgres in the farm-market-dev SQL Editor after approval.
-- Existing frontend/mock data is not connected or replaced by this migration.
begin;

-- Fail rather than silently modifying an existing catalog or bucket.
-- Auth and Storage are managed by Supabase; this migration does not alter their columns.
do $preflight$
begin
  if to_regclass('auth.users') is null
     or to_regclass('storage.objects') is null
     or to_regclass('storage.buckets') is null then
    raise exception 'Supabase Auth and Storage must exist before this migration';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'storage.objects'::regclass)
     or not (select relrowsecurity from pg_class where oid = 'storage.buckets'::regclass) then
    raise exception 'Supabase Storage RLS must already be enabled';
  end if;
  if exists (select 1 from storage.buckets where id = 'product-images') then
    raise exception 'product-images bucket already exists; review before applying';
  end if;
end;
$preflight$;

create schema farm_market_private;
revoke all on schema farm_market_private from public, anon, authenticated, service_role;
-- USAGE is necessary for policy helpers; it grants no table access.
-- Never add this schema to the Data API exposed schemas.
grant usage on schema farm_market_private to anon, authenticated;

create table farm_market_private.authorized_administrators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table farm_market_private.authorized_administrators enable row level security;
-- Intentionally NO client policies, including for existing administrators.
-- Only the trusted SQL owner can assign/revoke administrators manually.
revoke all on farm_market_private.authorized_administrators
  from public, anon, authenticated, service_role;

create function farm_market_private.is_administrator()
returns boolean
language sql stable security definer
set search_path = ''
as $function$
  select exists (
    select 1 from farm_market_private.authorized_administrators as administrator
    where administrator.user_id = (select auth.uid()) and administrator.is_active
  );
$function$;
-- The postgres migration owner bypasses the allowlist's RLS. No dynamic SQL,
-- caller-supplied user IDs, signup triggers, or editable JWT metadata are trusted.
revoke all on function farm_market_private.is_administrator() from public, anon, authenticated, service_role;
grant execute on function farm_market_private.is_administrator() to anon, authenticated;

create function farm_market_private.set_timestamps()
returns trigger
language plpgsql security invoker
set search_path = ''
as $function$
begin
  if tg_op = 'INSERT' then
    new.created_at := clock_timestamp();
  else
    new.created_at := old.created_at;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$function$;
revoke all on function farm_market_private.set_timestamps() from public, anon, authenticated, service_role;
create trigger administrators_timestamps
before insert or update on farm_market_private.authorized_administrators
for each row execute function farm_market_private.set_timestamps();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    char_length(slug) between 1 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  color_key text check (color_key is null or color_key ~ '^[a-z][a-z0-9_-]{0,31}$'),
  is_published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_display_order_idx on public.categories(sort_order, name);
create trigger categories_timestamps before insert or update on public.categories
for each row execute function farm_market_private.set_timestamps();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    char_length(slug) between 1 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  full_description text not null check (char_length(btrim(full_description)) between 1 and 20000),
  price_eur numeric(10,2) not null check (price_eur between 0 and 99999999.99),
  currency text not null default 'EUR' check (currency = 'EUR'),
  is_available boolean not null default true,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_sample boolean not null default false,
  -- Preserve the existing UI's includes list and original illustration fallback.
  includes text[] not null default '{}' check (
    cardinality(includes) <= 30
    and (array_ndims(includes) is null or array_ndims(includes) = 1)
    and array_position(includes, null) is null
    and octet_length(array_to_string(includes, '')) <= 15000
  ),
  illustration_key text check (
    illustration_key is null or illustration_key in ('meadow','orchard','village','garden','sunset','plan')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_price_idx on public.products(category_id, price_eur)
where is_published;
create index products_featured_idx on public.products(is_featured, created_at desc)
where is_published;
create trigger products_timestamps before insert or update on public.products
for each row execute function farm_market_private.set_timestamps();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  bucket_id text not null default 'product-images' check (bucket_id = 'product-images'),
  -- UUID product folder / UUID image filename; no traversal, arbitrary folders, or SVG.
  storage_path text not null unique check (
    split_part(storage_path, '/', 1) = product_id::text
    and storage_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
  ),
  alt_text text not null check (char_length(btrim(alt_text)) between 1 and 300),
  sort_order integer not null default 0 check (sort_order between 0 and 100000),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_images_order_idx on public.product_images(product_id, sort_order, created_at);
create unique index product_images_one_primary_idx on public.product_images(product_id)
where is_primary;
create trigger product_images_timestamps before insert or update on public.product_images
for each row execute function farm_market_private.set_timestamps();

create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null check (char_length(btrim(store_name)) between 1 and 120),
  -- Public display data only. Never store keys, passwords, or private admin contacts here.
  logo_url text check (
    logo_url is null or (char_length(logo_url) <= 2048 and logo_url !~ '[[:space:]]' and (
      logo_url ~ '^https://[A-Za-z0-9][A-Za-z0-9.-]*(:[0-9]{1,5})?(/.*)?$'
      or logo_url ~ '^/[A-Za-z0-9][A-Za-z0-9/_-]*\.(svg|png|webp|jpg|jpeg)$'
    ))
  ),
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[1-9][0-9]{6,14}$'),
  contact_email text check (
    contact_email is null or (char_length(contact_email) <= 254 and contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
  ),
  contact_phone text check (contact_phone is null or contact_phone ~ '^[+0-9 ()-]{5,40}$'),
  contact_address text check (contact_address is null or char_length(contact_address) <= 1000),
  contact_description text not null default '' check (char_length(contact_description) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger store_settings_timestamps before insert or update on public.store_settings
for each row execute function farm_market_private.set_timestamps();

-- Start private, except the four already-known public category labels and store name.
insert into public.categories(slug, name, description, color_key, sort_order, is_published) values
  ('consultation', 'استشارات المزارع', 'أفكار صغيرة، فرق كبير', 'sage', 0, true),
  ('layout', 'تخطيط المزارع', 'كل زاوية في مكانها', 'yellow', 1, true),
  ('coaching', 'تدريب وإرشاد', 'ازرع مهارتك، خطوة بخطوة', 'peach', 2, true),
  ('decoration', 'تصاميم وديكورات', 'لمسة تشبه ذوقك', 'blue', 3, true);
insert into public.store_settings(id, store_name, logo_url) values (1, 'فارم ماركت', '/favicon.svg');
-- No products, image objects, Auth users, or administrators are seeded.

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.store_settings enable row level security;
alter table public.categories force row level security;
alter table public.products force row level security;
alter table public.product_images force row level security;
alter table public.store_settings force row level security;

revoke all on public.categories, public.products, public.product_images, public.store_settings
from public, anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.store_settings to anon;
grant select, insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant select, update on public.store_settings to authenticated;
-- Supabase's trusted server role is privileged and must never be shipped to a browser.
grant all on public.categories, public.products, public.product_images, public.store_settings to service_role;

create policy categories_public_read on public.categories for select to anon, authenticated
using (is_published);
create policy categories_admin_manage on public.categories for all to authenticated
using ((select farm_market_private.is_administrator()))
with check ((select farm_market_private.is_administrator()));

create policy products_public_read on public.products for select to anon, authenticated
using (is_published and exists (
  select 1 from public.categories as category
  where category.id = category_id and category.is_published
));
create policy products_admin_manage on public.products for all to authenticated
using ((select farm_market_private.is_administrator()))
with check ((select farm_market_private.is_administrator()));

create policy product_images_public_read on public.product_images for select to anon, authenticated
using (exists (
  select 1 from public.products as product
  join public.categories as category on category.id = product.category_id
  where product.id = product_id and product.is_published and category.is_published
));
create policy product_images_admin_manage on public.product_images for all to authenticated
using ((select farm_market_private.is_administrator()))
with check ((select farm_market_private.is_administrator()));

create policy store_settings_public_read on public.store_settings for select to anon, authenticated
using (true);
create policy store_settings_admin_update on public.store_settings for update to authenticated
using ((select farm_market_private.is_administrator()))
with check ((select farm_market_private.is_administrator()));
-- No client INSERT/DELETE policies or grants for the singleton settings row.

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', false, 5242880, array['image/jpeg','image/png','image/webp']);

create function farm_market_private.can_read_product_object(object_name text)
returns boolean language sql stable security invoker set search_path = ''
as $function$
  -- Invoker RLS on product_images filters out drafts and unpublished categories.
  select exists (select 1 from public.product_images as image where image.storage_path = object_name);
$function$;
create function farm_market_private.can_write_product_object(object_name text)
returns boolean language sql stable security invoker set search_path = ''
as $function$
  select (select farm_market_private.is_administrator())
    and object_name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
    and exists (select 1 from public.products as product where product.id::text = split_part(object_name, '/', 1));
$function$;
revoke all on function farm_market_private.can_read_product_object(text) from public, anon, authenticated, service_role;
revoke all on function farm_market_private.can_write_product_object(text) from public, anon, authenticated, service_role;
grant execute on function farm_market_private.can_read_product_object(text) to anon, authenticated;
grant execute on function farm_market_private.can_write_product_object(text) to anon, authenticated;

-- Link only objects already uploaded through the Storage API. No FK into managed
-- storage tables: deleting DB metadata must not pretend to delete physical bytes.
create function farm_market_private.validate_product_image_object()
returns trigger language plpgsql security invoker set search_path = ''
as $function$
begin
  if not exists (select 1 from storage.objects as object
    where object.bucket_id = new.bucket_id and object.name = new.storage_path) then
    raise exception using errcode = '23503', message = 'Upload the image through Supabase Storage before linking its metadata';
  end if;
  return new;
end;
$function$;
revoke all on function farm_market_private.validate_product_image_object() from public, anon, authenticated, service_role;
create trigger product_images_existing_object before insert or update of storage_path, bucket_id
on public.product_images for each row execute function farm_market_private.validate_product_image_object();

-- Storage grants are managed by Supabase. Do not revoke/replace its grants or
-- policies for other buckets. Scoped RESTRICTIVE guards prevent existing broad
-- permissive policies from accidentally exposing this private product bucket.
create policy fm_objects_select on storage.objects for select to anon, authenticated
using (bucket_id = 'product-images' and (
  (select farm_market_private.is_administrator()) or farm_market_private.can_read_product_object(name)
));
create policy fm_objects_select_guard on storage.objects as restrictive for select to anon, authenticated
using (bucket_id <> 'product-images' or (
  (select farm_market_private.is_administrator()) or farm_market_private.can_read_product_object(name)
));
create policy fm_objects_insert on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and farm_market_private.can_write_product_object(name));
create policy fm_objects_insert_guard on storage.objects as restrictive for insert to anon, authenticated
with check (bucket_id <> 'product-images' or farm_market_private.can_write_product_object(name));
create policy fm_objects_update on storage.objects for update to authenticated
using (bucket_id = 'product-images' and (select farm_market_private.is_administrator()))
with check (bucket_id = 'product-images' and farm_market_private.can_write_product_object(name));
create policy fm_objects_update_guard on storage.objects as restrictive for update to anon, authenticated
using (bucket_id <> 'product-images' or (select farm_market_private.is_administrator()))
with check (bucket_id <> 'product-images' or farm_market_private.can_write_product_object(name));
create policy fm_objects_delete on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and (select farm_market_private.is_administrator()));
create policy fm_objects_delete_guard on storage.objects as restrictive for delete to anon, authenticated
using (bucket_id <> 'product-images' or (select farm_market_private.is_administrator()));

-- Bucket configuration is SQL-owner-only; even catalog admins cannot make it public.
create policy fm_bucket_insert_guard on storage.buckets as restrictive for insert to anon, authenticated
with check (id <> 'product-images');
create policy fm_bucket_update_guard on storage.buckets as restrictive for update to anon, authenticated
using (id <> 'product-images') with check (id <> 'product-images');
create policy fm_bucket_delete_guard on storage.buckets as restrictive for delete to anon, authenticated
using (id <> 'product-images');

comment on table public.store_settings is 'Public storefront contact/display data only; no secrets or private admin details.';
comment on table farm_market_private.authorized_administrators is 'Manual SQL-owner allowlist; never exposed via Data API or client grants.';
comment on column public.products.slug is 'Stable storefront URL identifier; UUID id is for database relationships.';
comment on column public.product_images.storage_path is 'Existing private Storage object: product UUID / image UUID.extension.';

commit;
