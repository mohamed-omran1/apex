-- Phase 2. Data and security
-- Creates enums, eight tables, indexes, RLS and all policies.
-- See docs/specs/phase-2.md for the full data model and security matrix.

-- =============================================================================
-- Enums
-- =============================================================================

create type public.lead_status as enum (
  'new',
  'contacted',
  'scheduled',
  'completed',
  'lost',
  'spam'
);

create type public.lead_kind as enum (
  'emergency',
  'repair',
  'estimate',
  'tune_up',
  'membership_enquiry'
);

-- =============================================================================
-- Tables
-- =============================================================================

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  kind public.lead_kind not null,
  status public.lead_status not null default 'new',
  name text not null,
  phone text not null,
  email text,
  zip text not null,
  address text,
  issue text,
  preferred_day date,
  preferred_window text,
  consent_email boolean not null default false,
  consent_sms boolean not null default false,
  consent_at timestamptz,
  consent_version text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  reference_code text unique,
  created_at timestamptz not null default now()
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  event_type text not null,
  actor_user_id uuid references public.admin_users (user_id) on delete set null,
  body text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null,
  is_emergency boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.service_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  city text not null,
  zip_codes text[] not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  reviewed_on date not null,
  is_sample boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  phone text not null,
  business_hours jsonb not null,
  emergency_mode boolean not null default false,
  emergency_banner text,
  tdlr_license text not null,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Indexes
-- =============================================================================

create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_phone_idx on public.leads (phone);
create index lead_events_lead_created_idx on public.lead_events (lead_id, created_at);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.admin_users enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.services enable row level security;
alter table public.service_areas enable row level security;
alter table public.offers enable row level security;
alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;

-- The admin check used inline in every admin policy.
-- admin_users lets each user see their own row (policy below),
-- which makes this EXISTS evaluate correctly for the requesting user.
-- (select auth.uid()) is wrapped so it runs once per statement, not once per row.

-- ---------------------------------------------------------------------------
-- admin_users
-- Any authenticated user can see their own row; nothing else.
-- ---------------------------------------------------------------------------

create policy "Users can view own admin row"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- leads
-- Anon: INSERT only, status must be new.
-- Admin: SELECT and UPDATE. No DELETE for anyone.
-- ---------------------------------------------------------------------------

create policy "Anyone can submit a lead"
  on public.leads for insert
  to anon
  with check (status = 'new');

create policy "Admins can view leads"
  on public.leads for select
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update leads"
  on public.leads for update
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- lead_events
-- Admin only: SELECT and INSERT.
-- ---------------------------------------------------------------------------

create policy "Admins can view lead events"
  on public.lead_events for select
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can insert lead events"
  on public.lead_events for insert
  to authenticated
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- services
-- Anon: SELECT. Admin: SELECT, INSERT, UPDATE, DELETE.
-- ---------------------------------------------------------------------------

create policy "Anyone can view services"
  on public.services for select
  to anon
  using (true);

create policy "Admins have full access to services"
  on public.services for all
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- service_areas
-- Anon: SELECT where is_active. Admin: full access.
-- ---------------------------------------------------------------------------

create policy "Anyone can view active service areas"
  on public.service_areas for select
  to anon
  using (is_active);

create policy "Admins have full access to service areas"
  on public.service_areas for all
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- offers
-- Anon: SELECT where is_active and current_date in window. Admin: full access.
-- ---------------------------------------------------------------------------

create policy "Anyone can view active in-season offers"
  on public.offers for select
  to anon
  using (is_active and current_date between starts_on and ends_on);

create policy "Admins have full access to offers"
  on public.offers for all
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- reviews
-- Anon: SELECT where is_published. Admin: full access.
-- ---------------------------------------------------------------------------

create policy "Anyone can view published reviews"
  on public.reviews for select
  to anon
  using (is_published);

create policy "Admins have full access to reviews"
  on public.reviews for all
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- site_settings
-- Anon: SELECT. Admin: SELECT, INSERT, UPDATE. No DELETE.
-- The primary key check (id) keeps it a singleton.
-- ---------------------------------------------------------------------------

create policy "Anyone can view site settings"
  on public.site_settings for select
  to anon
  using (true);

create policy "Admins can view site settings"
  on public.site_settings for select
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can insert site settings"
  on public.site_settings for insert
  to authenticated
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
