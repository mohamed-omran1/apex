-- Add covering index for the lead_events.actor_user_id foreign key.
-- Raised by the performance advisor after the Phase 2 push.

create index lead_events_actor_user_id_idx on public.lead_events (actor_user_id);
