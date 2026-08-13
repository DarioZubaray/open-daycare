-- OpenDayCare: public schema
-- Declarative schema definition for daycares table

create table daycares (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  address    text,
  created_at timestamptz not null default now()
);

alter table daycares enable row level security;

create policy "Service role full access"
  on daycares
  for all
  to service_role
  using (true)
  with check (true);
