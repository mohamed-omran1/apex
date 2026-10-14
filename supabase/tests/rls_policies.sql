-- Phase 2 RLS tests.
-- Proves AC-2, AC-3 and AC-4 from docs/specs/phase-2.md.
-- Fixtures run as postgres (RLS bypass). Tests switch identity with
-- set local role + set local request.jwt.claims. The whole file is one
-- transaction that rolls back at the end, leaving no rows behind.

begin;

-- ---------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------

insert into auth.users (id) values
  ('aaaaaaaa-0000-0000-0000-000000000001'),
  ('aaaaaaaa-0000-0000-0000-000000000002');

insert into public.admin_users (user_id, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin');

insert into public.services (id, slug, name, summary, is_emergency, sort_order) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'ac-repair', 'AC repair', 'summary', false, 1),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'emergency', 'Emergency', 'summary', true,  2);

insert into public.service_areas (id, slug, city, zip_codes, is_active, sort_order) values
  ('cccccccc-0000-0000-0000-000000000001', 'dallas', 'Dallas', array['75201'], true,  1),
  ('cccccccc-0000-0000-0000-000000000002', 'plano',  'Plano',  array['75024'], false, 2);

insert into public.offers (id, title, body, starts_on, ends_on, is_active) values
  ('dddddddd-0000-0000-0000-000000000001', 'In season',     'body', '2026-01-01', '2026-12-31', true),
  ('dddddddd-0000-0000-0000-000000000002', 'Out of season', 'body', '2020-01-01', '2020-12-31', true),
  ('dddddddd-0000-0000-0000-000000000003', 'Disabled',      'body', '2026-01-01', '2026-12-31', false);

insert into public.reviews (id, name, rating, body, reviewed_on, is_sample, is_published) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'Published',   5, 'body', '2026-09-01', true, true),
  ('eeeeeeee-0000-0000-0000-000000000002', 'Unpublished', 4, 'body', '2026-09-02', true, false);

insert into public.site_settings (id, phone, business_hours, tdlr_license) values
  (true, '(214) 555-0148', '{}'::jsonb, 'TACLB000000C');

insert into public.leads (id, kind, status, name, phone, zip, reference_code) values
  ('ffffffff-0000-0000-0000-000000000001', 'repair', 'new', 'Admin Target', '(214) 555-9999', '75201', 'TEST-RLS-001');

-- ---------------------------------------------------------------------------
-- Plan: 14 assertions total
-- ---------------------------------------------------------------------------

select plan(14);

-- ===========================================================================
-- AC-2: anon reads
-- ===========================================================================

select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

select is(
  (select count(*)::int from public.services),
  2,
  'anon sees all services'
);

select is(
  (select count(*)::int from public.service_areas),
  1,
  'anon sees only active service areas'
);

select is(
  (select count(*)::int from public.offers),
  1,
  'anon sees only active in-season offers'
);

select is(
  (select count(*)::int from public.reviews),
  1,
  'anon sees only published reviews'
);

select is(
  (select count(*)::int from public.site_settings),
  1,
  'anon can read site_settings'
);

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

select is(
  (select count(*)::int from public.admin_users),
  0,
  'anon sees zero admin users'
);

-- ===========================================================================
-- AC-3: anon lead insert
-- ===========================================================================

insert into public.leads (kind, name, phone, zip)
values ('repair', 'Anon Visitor', '(214) 555-0100', '75201');

select is(
  (select status::text from public.leads where phone = '(214) 555-0100'),
  'new',
  'anon insert defaults status to new'
);

select throws_ok(
  $$
    insert into public.leads (kind, status, name, phone, zip)
    values ('repair', 'scheduled', 'Bad Actor', '(214) 555-0101', '75201')
  $$,
  '42501',
  'new row violates row-level security policy for table "leads"',
  'anon insert with status other than new is refused'
);

-- anon still cannot select leads after inserting one.
select is(
  (select count(*)::int from public.leads),
  0,
  'anon cannot select leads after insert'
);

reset role;

-- ===========================================================================
-- AC-2 continued: anon has no update anywhere
-- ===========================================================================

select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

-- Update silently changes zero rows under RLS.
update public.services set name = 'Hacked' where id = 'bbbbbbbb-0000-0000-0000-000000000001';

select is(
  (select name from public.services where id = 'bbbbbbbb-0000-0000-0000-000000000001'),
  'AC repair',
  'anon update on services changes nothing'
);

reset role;

-- ===========================================================================
-- AC-4: non-admin authenticated denial
-- ===========================================================================

select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000002", "role": "authenticated"}', true);
set local role authenticated;

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
  (select count(*)::int from public.leads),
  1,
  'admin sees the lead'
);

update public.leads set status = 'contacted' where id = 'ffffffff-0000-0000-0000-000000000001';

select is(
  (select status::text from public.leads where id = 'ffffffff-0000-0000-0000-000000000001'),
  'contacted',
  'admin status update persists'
);

insert into public.lead_events (lead_id, event_type, body)
values ('ffffffff-0000-0000-0000-000000000001', 'status_changed', 'Marked contacted');

select is(
  (select count(*)::int from public.lead_events where lead_id = 'ffffffff-0000-0000-0000-000000000001'),
  1,
  'admin can insert lead events'
);

reset role;

-- ---------------------------------------------------------------------------
-- Finish and clean up.
-- ---------------------------------------------------------------------------

select * from finish();

rollback;
