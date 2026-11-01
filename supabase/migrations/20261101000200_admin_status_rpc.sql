-- REVIEW REQUIRED: apply only this new migration after approval.
-- The existing catalog foundation is already installed: do NOT reapply it.
-- Read-only identity predicate; no new tables, role assignments, or RLS changes.
begin;
do $preflight$
begin
  if to_regprocedure('farm_market_private.is_administrator()') is null then
    raise exception 'The existing database foundation must be installed first';
  end if;
end;
$preflight$;

create function public.current_user_is_admin()
returns boolean
language sql stable security invoker
set search_path = ''
as $function$
  select (select auth.uid()) is not null
     and (select farm_market_private.is_administrator());
$function$;
revoke all on function public.current_user_is_admin() from public, anon, authenticated, service_role;
grant execute on function public.current_user_is_admin() to authenticated;
comment on function public.current_user_is_admin() is
  'Read-only self-status. No arguments, private rows, assignment, or client metadata. RLS remains authoritative.';
notify pgrst, 'reload schema';
commit;
