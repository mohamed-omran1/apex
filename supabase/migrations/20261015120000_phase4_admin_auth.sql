-- Phase 4. Admin auth
-- Rewrites every admin RLS policy from the admin_users EXISTS check to the
-- JWT app_metadata role claim. admin_users stays as an onboarding log; no
-- policy reads it anymore.
-- See docs/specs/phase-4.md AC-9.

-- ---------------------------------------------------------------------------
-- Helper: one expression every admin policy shares.
-- auth.jwt() returns the request JWT. The claim is set only by the service
-- role in scripts/create-admin.ts; user_metadata is never consulted.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- admin_users
-- Own row only (same as before). The bootstrap script writes with the
-- service role, which bypasses RLS; nothing else writes this table.
-- ---------------------------------------------------------------------------

drop policy if exists "Users can view own admin row" on public.admin_users;

create policy "Users can view own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------

drop policy if exists "Admins can view leads" on public.leads;
drop policy if exists "Admins can update leads" on public.leads;

create policy "Admins can view leads"
  on public.leads for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update leads"
  on public.leads for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- lead_events
-- ---------------------------------------------------------------------------

drop policy if exists "Admins can view lead events" on public.lead_events;
drop policy if exists "Admins can insert lead events" on public.lead_events;

create policy "Admins can view lead events"
  on public.lead_events for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert lead events"
  on public.lead_events for insert
  to authenticated
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------

drop policy if exists "Admins have full access to services" on public.services;

create policy "Admins have full access to services"
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- service_areas
-- ---------------------------------------------------------------------------

drop policy if exists "Admins have full access to service areas" on public.service_areas;

create policy "Admins have full access to service areas"
  on public.service_areas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------------

drop policy if exists "Admins have full access to offers" on public.offers;

create policy "Admins have full access to offers"
  on public.offers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------

drop policy if exists "Admins have full access to reviews" on public.reviews;

create policy "Admins have full access to reviews"
  on public.reviews for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------

drop policy if exists "Admins can view site settings" on public.site_settings;
drop policy if exists "Admins can insert site settings" on public.site_settings;
drop policy if exists "Admins can update site settings" on public.site_settings;

create policy "Admins can view site settings"
  on public.site_settings for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
