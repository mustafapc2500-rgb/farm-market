-- MANUAL TEMPLATE ONLY. Replace the UUID after review; run as postgres.
-- Revocation applies to subsequent DB/Storage authorization checks, including
-- requests using an existing session token. It does not erase cached downloads
-- or revoke already-issued signed URLs before their expiry.
begin;
do $revoke$
declare
  target_user_id uuid := 'REPLACE_WITH_EXISTING_AUTH_USER_UUID';
begin
  update farm_market_private.authorized_administrators
  set is_active = false, notes = 'Authorization manually revoked by project owner'
  where user_id = target_user_id;
  if not found then
    raise exception 'Administrator UUID not found; verify the UUID';
  end if;
end;
$revoke$;
commit;
