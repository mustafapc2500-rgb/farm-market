-- READ-ONLY verification after an approved migration. SQL Editor, role postgres.
-- These catalog checks do not substitute for API requests under real user roles.
select schemaname, tablename, rowsecurity
from pg_tables
where (schemaname = 'public' and tablename in ('products','categories','product_images','store_settings'))
   or (schemaname = 'farm_market_private' and tablename = 'authorized_administrators')
order by schemaname, tablename;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename in ('products','categories','product_images','store_settings'))
   or (schemaname = 'farm_market_private' and tablename = 'authorized_administrators')
   or (schemaname = 'storage' and policyname like 'fm\_%' escape '\')
order by schemaname, tablename, policyname;

select
  has_table_privilege('anon','public.products','INSERT') as anon_insert_must_be_false,
  has_table_privilege('authenticated','public.products','TRUNCATE') as auth_truncate_must_be_false,
  has_table_privilege('authenticated','farm_market_private.authorized_administrators','SELECT') as auth_admin_read_must_be_false,
  has_table_privilege('authenticated','farm_market_private.authorized_administrators','INSERT') as auth_admin_insert_must_be_false,
  has_table_privilege('service_role','farm_market_private.authorized_administrators','INSERT') as service_admin_insert_must_be_false;

select p.proname, p.prosecdef, p.proconfig, pg_get_userbyid(p.proowner) as owner
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'farm_market_private'
order by p.proname;

select id, public, file_size_limit, allowed_mime_types
from storage.buckets where id = 'product-images';

select count(*) as administrator_count from farm_market_private.authorized_administrators;
select count(*) as product_count from public.products;
select slug, is_published from public.categories order by sort_order;

select count(*) as store_settings_count from public.store_settings;
