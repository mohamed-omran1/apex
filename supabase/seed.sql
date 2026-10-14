-- Phase 2 seed data for the Apex demo database.
-- Idempotent: re-running leaves the same rows. Marketing rows use ON CONFLICT
-- DO UPDATE so edits survive; site_settings uses DO NOTHING so demo admin
-- edits survive. Sample leads use fixed reference codes for the same reason.
-- See docs/specs/phase-2.md AC-7.

-- =============================================================================
-- Marketing content
-- =============================================================================

insert into public.services (id, slug, name, summary, is_emergency, sort_order) values
  ('00000000-0000-0000-0000-000000000101', 'emergency',     '24/7 emergency',  'System down, house heating up. Four fields: name, phone, zip, and what is wrong.', true,  6),
  ('00000000-0000-0000-0000-000000000102', 'ac-repair',     'AC repair',       'Not cooling, short cycling, warm air. Most repair visits land between $180 and $650.', false, 1),
  ('00000000-0000-0000-0000-000000000103', 'ac-replacement','AC replacement',  'A planned install. Free in-home estimate and financing in plain numbers. No lease program.', false, 3),
  ('00000000-0000-0000-0000-000000000104', 'heating-repair','Heating repair',  'Furnaces and heat pumps, before the first cold night in Dallas.', false, 4),
  ('00000000-0000-0000-0000-000000000105', 'tune-ups',      'Tune-ups',        'Spring AC and fall furnace. The $89 furnace checkup runs through October 31.', false, 5),
  ('00000000-0000-0000-0000-000000000106', 'indoor-air',    'Indoor air',      'Filters, ducts, and humidity. We say what is worth doing, and what can wait.', false, 2)
on conflict (slug) do update set
  name = excluded.name,
  summary = excluded.summary,
  is_emergency = excluded.is_emergency,
  sort_order = excluded.sort_order;

insert into public.service_areas (id, slug, city, zip_codes, is_active, sort_order) values
  ('00000000-0000-0000-0000-000000000201', 'dallas',     'Dallas',     array['75201','75202','75203','75204','75205','75206','75207','75208','75209','75210','75211','75212','75214','75215','75216','75217','75218','75219','75220','75221','75222','75223','75224','75225','75226','75227','75228','75229','75230','75231','75232','75233','75234','75235','75236','75237','75238','75240','75241','75243','75244','75246','75247','75248','75251','75252','75253','75254','75287'], true, 1),
  ('00000000-0000-0000-0000-000000000202', 'plano',      'Plano',      array['75023','75024','75025','75026','75074','75075','75093','75094'], true, 2),
  ('00000000-0000-0000-0000-000000000203', 'irving',     'Irving',     array['75038','75039','75060','75061','75062','75063'], true, 3),
  ('00000000-0000-0000-0000-000000000204', 'garland',    'Garland',    array['75040','75041','75042','75043','75044'], true, 4),
  ('00000000-0000-0000-0000-000000000205', 'richardson', 'Richardson', array['75080','75081','75082','75083','75085'], true, 5),
  ('00000000-0000-0000-0000-000000000206', 'frisco',     'Frisco',     array['75034','75035','75036','75037','75068'], true, 6)
on conflict (slug) do update set
  city = excluded.city,
  zip_codes = excluded.zip_codes,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.offers (id, title, body, starts_on, ends_on, is_active) values
  ('00000000-0000-0000-0000-000000000301', 'Fall furnace checkup', 'Fall furnace checkup — $89, with a written price before any work.', '2026-01-01', '2026-12-31', true)
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  is_active = excluded.is_active;

insert into public.reviews (id, name, rating, body, reviewed_on, is_sample, is_published) values
  ('00000000-0000-0000-0000-000000000401', 'Maria G.',           5, 'The tech named the part before he opened the van. The bill matched the number from the phone call.',           '2026-09-12', true, true),
  ('00000000-0000-0000-0000-000000000402', 'James Okonkwo',      5, 'Furnace checkup took an hour. He showed me the filter and did not try to sell a system I do not need yet.',    '2026-10-02', true, true),
  ('00000000-0000-0000-0000-000000000403', 'Priya S.',           5, 'Called at 9 at night. Somebody picked up, and a truck was in the driveway before breakfast.',                    '2026-08-28', true, true),
  ('00000000-0000-0000-0000-000000000404', 'Derek W.',           4, 'Straightforward repair. Would have liked a bit more communication on the ETA.',                                 '2026-07-15', true, true),
  ('00000000-0000-0000-0000-000000000405', 'Angela Martinez',    5, 'Honest quote, no upsell, and the system has been running great since.',                                          '2026-06-20', true, true)
on conflict (id) do update set
  name = excluded.name,
  rating = excluded.rating,
  body = excluded.body,
  reviewed_on = excluded.reviewed_on,
  is_sample = excluded.is_sample,
  is_published = excluded.is_published;

-- site_settings: DO NOTHING so demo admin edits survive re-runs.
insert into public.site_settings (id, phone, business_hours, emergency_mode, emergency_banner, tdlr_license) values
  (true, '(214) 555-0148', '{"mon_sat": "7a-7p", "emergency": "24/7", "online": "anytime"}'::jsonb, false, null, 'TACLB000000C')
on conflict (id) do nothing;

-- =============================================================================
-- Sample leads and events
-- Fixed reference codes make the seed idempotent. Statuses span the full
-- enum so the Phase 4 inbox looks alive on first open.
-- =============================================================================

-- Leads (18 samples)
insert into public.leads (id, kind, status, name, phone, email, zip, address, issue, preferred_day, preferred_window, consent_email, consent_sms, consent_at, consent_version, reference_code, created_at) values
  ('00000000-0000-0000-0000-000000001001', 'emergency',     'new',       'Sarah Chen',        '(214) 555-0201', 'sarah.chen@example.com',    '75201', null,                                    'AC dead, house at 84 degrees',              null,             'ASAP',           true,  true,  '2026-10-14 09:15:00+00', 'v1', 'APEX-DEMO-001', '2026-10-14 09:15:00+00'),
  ('00000000-0000-0000-0000-000000001002', 'repair',        'contacted', 'Mike Torres',       '(214) 555-0202', 'mike.torres@example.com',   '75204', null,                                    'Short cycling, unit restarts every 10 min',  '2026-10-15',    'morning',        true,  false, '2026-10-13 14:30:00+00', 'v1', 'APEX-DEMO-002', '2026-10-13 14:30:00+00'),
  ('00000000-0000-0000-0000-000000001003', 'estimate',      'scheduled', 'Jennifer Park',     '(972) 555-0203', 'jpark@example.com',         '75024', '452 Legacy Dr, Plano, TX 75024',         'Considering full system replacement',        '2026-10-16',    'afternoon',      true,  true,  '2026-10-12 11:00:00+00', 'v1', 'APEX-DEMO-003', '2026-10-12 11:00:00+00'),
  ('00000000-0000-0000-0000-000000001004', 'tune_up',       'completed', 'Robert Nguyen',     '(972) 555-0204', 'r.nguyen@example.com',      '75080', null,                                    'Fall furnace checkup',                      '2026-10-10',    'morning',        true,  false, '2026-10-08 16:45:00+00', 'v1', 'APEX-DEMO-004', '2026-10-08 16:45:00+00'),
  ('00000000-0000-0000-0000-000000001005', 'repair',        'lost',      'Amy Walsh',         '(469) 555-0205', 'amy.walsh@example.com',     '75034', null,                                    'Called about a leak but went with someone else', null,         null,             false, false, null,                   null,   'APEX-DEMO-005', '2026-10-07 10:20:00+00'),
  ('00000000-0000-0000-0000-000000001006', 'emergency',     'new',       'Carlos Rivera',     '(214) 555-0206', null,                        '75211', null,                                    'Burning smell at outdoor unit',            null,             'ASAP',           true,  true,  '2026-10-14 07:50:00+00', 'v1', 'APEX-DEMO-006', '2026-10-14 07:50:00+00'),
  ('00000000-0000-0000-0000-000000001007', 'repair',        'contacted', 'Lisa Kim',          '(972) 555-0207', 'lisa.kim@example.com',      '75025', null,                                    'Warm air from vents in afternoon',         '2026-10-15',    'afternoon',      true,  true,  '2026-10-13 09:10:00+00', 'v1', 'APEX-DEMO-007', '2026-10-13 09:10:00+00'),
  ('00000000-0000-0000-0000-000000001008', 'estimate',      'new',       'David Okoro',       '(469) 555-0208', 'd.okoro@example.com',       '75035', '1800 Main St, Frisco, TX 75035',        'Wants estimate for heat pump install',      '2026-10-17',    'morning',        true,  true,  '2026-10-14 13:25:00+00', 'v1', 'APEX-DEMO-008', '2026-10-14 13:25:00+00'),
  ('00000000-0000-0000-0000-000000001009', 'tune_up',       'scheduled', 'Rachel Simmons',    '(214) 555-0209', 'r.simmons@example.com',     '75214', null,                                    'Spring AC tune-up booking',                '2026-10-18',    'morning',        true,  false, '2026-10-11 15:00:00+00', 'v1', 'APEX-DEMO-009', '2026-10-11 15:00:00+00'),
  ('00000000-0000-0000-0000-000000001010', 'repair',        'new',       'Tom Bradley',       '(972) 555-0210', null,                        '75082', null,                                    'Thermostat not responding',                null,             'evening',        true,  true,  '2026-10-14 18:40:00+00', 'v1', 'APEX-DEMO-010', '2026-10-14 18:40:00+00'),
  ('00000000-0000-0000-0000-000000001011', 'membership_enquiry','contacted','Nina Patel',   '(469) 555-0211', 'nina.patel@example.com',    '75044', null,                                    'Asked about Seasonal Club',                null,             null,             true,  true,  '2026-10-10 12:05:00+00', 'v1', 'APEX-DEMO-011', '2026-10-10 12:05:00+00'),
  ('00000000-0000-0000-0000-000000001012', 'emergency',     'contacted', 'Greg Holloway',     '(214) 555-0212', 'g.holloway@example.com',    '75206', null,                                    'No heat, night temperature dropping',       null,             'ASAP',           true,  true,  '2026-10-13 22:10:00+00', 'v1', 'APEX-DEMO-012', '2026-10-13 22:10:00+00'),
  ('00000000-0000-0000-0000-000000001013', 'repair',        'completed', 'Sandra Lopez',      '(972) 555-0213', 's.lopez@example.com',       '75040', null,                                    'Capacitor replaced',                       '2026-10-05',    'afternoon',      true,  false, '2026-10-03 10:30:00+00', 'v1', 'APEX-DEMO-013', '2026-10-03 10:30:00+00'),
  ('00000000-0000-0000-0000-000000001014', 'estimate',      'scheduled', 'Brian Kowalski',    '(469) 555-0214', 'brian.k@example.com',       '75068', '77 Frisco Sq Blvd, Frisco, TX 75068',  'Ductwork assessment plus system quote',    '2026-10-19',    'afternoon',      true,  true,  '2026-10-09 14:00:00+00', 'v1', 'APEX-DEMO-014', '2026-10-09 14:00:00+00'),
  ('00000000-0000-0000-0000-000000001015', 'tune_up',       'lost',      'Hannah Brooks',     '(214) 555-0215', 'hbrooks@example.com',       '75218', null,                                    'Tune-up but cancelled, out of town',       '2026-10-20',    'morning',        true,  false, '2026-10-08 09:00:00+00', 'v1', 'APEX-DEMO-015', '2026-10-08 09:00:00+00'),
  ('00000000-0000-0000-0000-000000001016', 'repair',        'spam',      'Spam Lead',         '(000) 000-0000', null,                        '00000', null,                                    'Clearly a marketing call',                 null,             null,             false, false, null,                   null,   'APEX-DEMO-016', '2026-10-06 03:15:00+00'),
  ('00000000-0000-0000-0000-000000001017', 'emergency',     'new',       'Monica Jefferson',  '(972) 555-0217', 'm.jefferson@example.com',   '75041', null,                                    'Water pouring from air handler',           null,             'ASAP',           true,  true,  '2026-10-14 08:05:00+00', 'v1', 'APEX-DEMO-017', '2026-10-14 08:05:00+00'),
  ('00000000-0000-0000-0000-000000001018', 'membership_enquiry','new',    'Kevin Zhao',        '(214) 555-0218', 'kevin.zhao@example.com',    '75205', null,                                    'Wants pricing for Seasonal Club',          null,             'evening',        true,  true,  '2026-10-14 17:30:00+00', 'v1', 'APEX-DEMO-018', '2026-10-14 17:30:00+00')
on conflict (reference_code) do update set
  kind = excluded.kind,
  status = excluded.status,
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  zip = excluded.zip,
  address = excluded.address,
  issue = excluded.issue,
  preferred_day = excluded.preferred_day,
  preferred_window = excluded.preferred_window,
  consent_email = excluded.consent_email,
  consent_sms = excluded.consent_sms,
  consent_at = excluded.consent_at,
  consent_version = excluded.consent_version;

-- Lead events (sample history for the completed and contacted leads)
insert into public.lead_events (id, lead_id, event_type, actor_user_id, body, metadata, created_at) values
  ('00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000001004', 'status_changed', null, 'Lead marked as completed', null, '2026-10-10 15:30:00+00'),
  ('00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000001004', 'note',          null, 'Furnace checkup done, filter replaced, no repairs needed', null, '2026-10-10 15:35:00+00'),
  ('00000000-0000-0000-0000-000000002003', '00000000-0000-0000-0000-000000001013', 'status_changed', null, 'Lead marked as completed', null, '2026-10-05 16:00:00+00'),
  ('00000000-0000-0000-0000-000000002004', '00000000-0000-0000-0000-000000001002', 'email_sent',    null, 'Initial contact email sent', null, '2026-10-13 15:00:00+00'),
  ('00000000-0000-0000-0000-000000002005', '00000000-0000-0000-0000-000000001002', 'status_changed', null, 'Lead marked as contacted', null, '2026-10-13 15:05:00+00'),
  ('00000000-0000-0000-0000-000000002006', '00000000-0000-0000-0000-000000001007', 'email_sent',    null, 'Initial contact email sent', null, '2026-10-13 09:45:00+00'),
  ('00000000-0000-0000-0000-000000002007', '00000000-0000-0000-0000-000000001007', 'status_changed', null, 'Lead marked as contacted', null, '2026-10-13 09:50:00+00'),
  ('00000000-0000-0000-0000-000000002008', '00000000-0000-0000-0000-000000001005', 'status_changed', null, 'Lead marked as lost', 'Customer went with another company', '2026-10-07 16:00:00+00'),
  ('00000000-0000-0000-0000-000000002009', '00000000-0000-0000-0000-000000001016', 'status_changed', null, 'Lead marked as spam', null, '2026-10-06 04:00:00+00'),
  ('00000000-0000-0000-0000-000000002010', '00000000-0000-0000-0000-000000001012', 'email_sent',    null, 'Emergency callback confirmation', null, '2026-10-13 22:30:00+00'),
  ('00000000-0000-0000-0000-000000002011', '00000000-0000-0000-0000-000000001012', 'status_changed', null, 'Lead marked as contacted', null, '2026-10-13 22:35:00+00')
on conflict (id) do nothing;
