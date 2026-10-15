-- Phase 2 RLS tests.
-- Proves AC-2, AC-3 and AC-4 from docs/specs/phase-2.md.
-- Fixtures run as postgres (RLS bypass) with ON CONFLICT DO NOTHING so the
-- file runs cleanly whether or not seed data is already present. Assertions
-- filter on fixture-specific UUIDs, never on global table counts. The whole
-- file is one transaction that rolls back, leaving no rows behind.

begin;

-- ---------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------

insert into auth.users (id) values
  ('aaaaaaaa-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.admin_users (user_id, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin')
on conflict (user_id) do nothing;

insert into public.services (id, slug, name, summary, is_emergency, sort_order) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'rls-test-service-a', 'RLS Service A', 'summary', false, 1),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'rls-test-service-b', 'RLS Service B', 'summary', true,  2)
on conflict (slug) do nothing;

insert into public.service_areas (id, slug, city, zip_codes, is_active, sort_order) values
  ('cccccccc-0000-0000-0000-000000000001', 'rls-test-area-active',   'RLS Active City',   array['75201'], true,  90),
  ('cccccccc-0000-0000-0000-000000000002', 'rls-test-area-inactive', 'RLS Inactive City', array['75024'], false, 91)
on conflict (slug) do nothing;

insert into public.offers (id, title, body, starts_on, ends_on, is_active) values
  ('dddddddd-0000-0000-0000-000000000001', 'RLS In season',     'body', '2026-01-01', '2026-12-31', true),
  ('dddddddd-0000-0000-0000-000000000002', 'RLS Out of season', 'body', '2020-01-01', '2020-12-31', true),
  ('dddddddd-0000-0000-0000-000000000003', 'RLS Disabled',      'body', '2026-01-01', '2026-12-31', false)
on conflict (id) do nothing;

insert into public.reviews (id, name, rating, body, reviewed_on, is_sample, is_published) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'RLS Published',   5, 'body', '2026-09-01', true, true),
  ('eeeeeeee-0000-0000-0000-000000000002', 'RLS Unpublished', 4, 'body', '2026-09-02', true, false)
on conflict (id) do nothing;

-- site_settings singleton: seed may already own it. If so, skip; assertions
-- below only check that anon can read the row, whoever created it.
insert into public.site_settings (id, phone, business_hours, tdlr_license) values
  (true, '(214) 555-0148', '{}'::jsonb, 'TACLB000000C')
on conflict (id) do nothing;

insert into public.leads (id, kind, status, name, phone, zip, reference_code) values
  ('ffffffff-0000-0000-0000-000000000001', 'repair', 'new', 'RLS Admin Target', '(214) 555-9999', '75201', 'TEST-RLS-001')
on conflict (reference_code) do nothing;

-- ---------------------------------------------------------------------------
-- Plan: 16 assertions total
-- ---------------------------------------------------------------------------

select plan(16);

-- ===========================================================================
-- AC-2: anon reads (scoped to fixture rows by UUID so seed data cannot skew)
-- ===========================================================================

select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

select is(
  (select count(*)::int from public.services
   where id in ('bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002')),
  2,
  'anon sees both fixture services'
);

select is(
  (select count(*)::int from public.service_areas
   where id in ('cccccccc-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002')),
  1,
  'anon sees only the active fixture service area'
);

select is(
  (select count(*)::int from public.offers
   where id in ('dddddddd-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000003')),
  1,
  'anon sees only the active in-season fixture offer'
);

select is(
  (select count(*)::int from public.reviews
   where id in ('eeeeeeee-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000002')),
  1,
  'anon sees only the published fixture review'
);

select is(
  (select count(*)::int from public.site_settings),
  1,
  'anon can read site_settings singleton'
);

-- Leads: anon must see zero of them, fixture or seeded.
select is(
  (select count(*)::int from public.leads),
  0,
  'anon sees zero leads'
);

select is(
  (select count(*)::int from public.lead_events),
  0,
  'anon sees zero lead events'
);

-- Admin users: anon sees zero (the fixture admin row must be invisible).
select is(
  (select count(*)::int from public.admin_users),
  0,
  'anon sees zero admin users'
);

-- ===========================================================================
-- AC-3: anon lead insert
-- ===========================================================================

insert into public.leads (kind, name, phone, zip)
values ('repair', 'RLS Anon Visitor', '(214) 555-0100', '75201');

select throws_ok(
  $$
    insert into public.leads (kind, status, name, phone, zip)
    values ('repair', 'scheduled', 'RLS Bad Actor', '(214) 555-0101', '75201')
  $$,
  '42501',
  'new row violates row-level security policy for table "leads"',
  'anon insert with status other than new is refused'
);

select is(
  (select count(*)::int from public.leads),
  0,
  'anon cannot select leads after insert'
);

reset role;

-- Verify the anon insert landed with status = new (as postgres, since anon
-- has no select on leads by design).
select is(
  (select status::text from public.leads where phone = '(214) 555-0100'),
  'new',
  'anon insert defaults status to new'
);

-- ===========================================================================
-- AC-2 continued: anon has no update anywhere
-- ===========================================================================

select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

update public.services set name = 'Hacked'
where id = 'bbbbbbbb-0000-0000-0000-000000000001';

select is(
  (select name from public.services where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'RLS Service A',
  'anon update on services changes nothing'
);

reset role;

-- ===========================================================================
-- AC-4: non-admin authenticated denial
-- ===========================================================================

select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000002", "role": "authenticated"}', true);
set local role authenticated;

-- Non admin sees zero leads (fixture + any seeded).
select is(
  (select count(*)::int from public.leads),
  0,
  'non-admin sees zero leads'
);

reset role;

-- ===========================================================================
-- AC-4: admin access
-- ===========================================================================

select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000001", "role": "authenticated"}', true);
set local role authenticated;

select is(
  (select count(*)::int from public.leads
   where id = 'ffffffff-0000-0000-0000-000000000001'),
  1,
  'admin sees the fixture lead'
);

update public.leads set status = 'contacted'
where id = 'ffffffff-0000-0000-0000-000000000001';

select is(
  (select status::text from public.leads
   where id = 'ffffffff-0000-0000-0000-000000000001'),
  'contacted',
  'admin status update persists'
);

insert into public.lead_events (lead_id, event_type, body)
values ('ffffffff-0000-0000-0000-000000000001', 'status_changed', 'Marked contacted');

select is(
  (select count(*)::int from public.lead_events
   where lead_id = 'ffffffff-0000-0000-0000-000000000001'),
  1,
  'admin can insert lead events'
);

reset role;

-- ---------------------------------------------------------------------------
-- Finish and clean up.
-- ---------------------------------------------------------------------------

select * from finish();

rollback;
