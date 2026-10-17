-- Phase 5: local content columns on service_areas (docs/specs/phase-5.md AC-1).
-- RLS is unchanged: the existing anon SELECT where is_active policy already
-- covers new columns. Defaults keep existing rows and the pgTAP fixtures
-- valid; the seed fills unique per city content for the six active areas.
-- The fallback slug list in lib/content/areas.ts mirrors these six slugs.

alter table public.service_areas
  add column lede text not null default '',
  add column meta_description text not null default '',
  add column neighborhoods text[] not null default '{}',
  add column local_issues text[] not null default '{}',
  add column price_range text not null default '',
  add column faqs jsonb not null default '[]'::jsonb;

comment on column public.service_areas.lede is
  'Intro paragraph under the area page h1. Unique per city.';
comment on column public.service_areas.meta_description is
  'Meta description for the area page. Unique per city.';
comment on column public.service_areas.neighborhoods is
  'Neighborhood or corridor names shown as chips on the area page.';
comment on column public.service_areas.local_issues is
  'Local HVAC patterns listed under the "what we see" card.';
comment on column public.service_areas.price_range is
  'Plain language price range shown on the area page.';
comment on column public.service_areas.faqs is
  'Array of {"q": string, "a": string} pairs rendered visibly and as FAQPage JSON-LD.';
