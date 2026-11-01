-- LOCAL TEST DOUBLE ONLY. Never run this file in a Supabase project.
-- Minimal Auth/Storage contracts for an isolated in-memory PostgreSQL engine.
-- These are not migrations and do not simulate HTTP uploads or Auth token verification.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid;
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
create schema storage;
create table storage.buckets (
  id text primary key, name text not null, public boolean not null default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id), name text not null,
  unique(bucket_id, name)
);
alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects, storage.buckets to anon, authenticated;

-- Deliberately generous defaults model inherited Supabase grants. The migration
-- must explicitly remove them from private tables and non-public functions.
alter default privileges for role postgres grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres grant execute on functions to anon, authenticated, service_role;
