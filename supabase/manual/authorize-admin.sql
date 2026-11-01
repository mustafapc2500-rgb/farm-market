-- MANUAL TEMPLATE ONLY. Not a migration and never executed automatically.
-- After review, create/invite the owner via Supabase Authentication > Users.
-- Verify the user's identity and confirmed email, then replace the placeholder
-- with that existing Auth user's UUID. Run as postgres in SQL Editor.
-- Do not insert records directly into auth.users or use client-editable metadata.
begin;
do $authorize$
declare
  target_user_id uuid := 'REPLACE_WITH_EXISTING_AUTH_USER_UUID';
begin
  if not exists (
    select 1 from auth.users
    where id = target_user_id and email_confirmed_at is not null
  ) then
    raise exception 'Target must be an existing Auth user with a confirmed email; verify the UUID';
  end if;
  insert into farm_market_private.authorized_administrators(user_id, is_active, notes)
  values (target_user_id, true, 'Identity verified; manually authorized by project owner')
  on conflict (user_id) do update set
    is_active = true,
    notes = excluded.notes;
end;
$authorize$;
commit;
