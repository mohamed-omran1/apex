-- Phase 4 advisor fix (AC-9).
-- is_admin() only reads auth.jwt(), which the anon and authenticated roles
-- can both call directly. SECURITY DEFINER was unnecessary and trips two
-- advisor lints on an exposed-schema function (0028 anon, 0029
-- authenticated). Switch to SECURITY INVOKER; every admin policy is
-- `to authenticated`, and authenticated holds EXECUTE on auth.jwt().

alter function public.is_admin() security invoker;
