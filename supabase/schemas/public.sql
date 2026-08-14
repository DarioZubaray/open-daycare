-- OpenDayCare: public schema
-- Declarative schema definition

-- ============================================
-- ENUMS
-- ============================================

create type user_role as enum ('staff', 'parent', 'admin');
create type user_status as enum ('pending', 'active');

-- ============================================
-- TABLES
-- ============================================

-- daycares (SPEC 07)
create table daycares (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  address    text,
  created_at timestamptz not null default now()
);

-- users (SPEC 08)
create table users (
  id                     uuid primary key references auth.users(id) on delete cascade,
  daycare_id             uuid references daycares(id),
  role                   user_role   not null,
  status                 user_status not null default 'active',
  full_name              text        not null,
  avatar_url             text,
  notify_on_post         boolean     not null default true,
  daily_summary_enabled  boolean     not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_users_daycare_id on users(daycare_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table daycares enable row level security;

create policy "Service role full access"
  on daycares
  for all
  to service_role
  using (true)
  with check (true);

alter table users enable row level security;

create policy "Service role full access"
  on users
  for all
  to service_role
  using (true)
  with check (true);

-- NOTE: These policies use auth.uid() = id (no self-referential subqueries).
-- The original "same daycare" policies queried the users table from within RLS
-- policies on the same table, which caused PostgREST to return 500 errors.
create policy "Users can read own profile"
  on users
  for select
  to authenticated
  using (( SELECT auth.uid() AS uid) = id);

create policy "Users can update own profile"
  on users
  for update
  to authenticated
  using (( SELECT auth.uid() AS uid) = id)
  with check (( SELECT auth.uid() AS uid) = id);

create policy "Users can insert own profile"
  on users
  for insert
  to authenticated
  with check (( SELECT auth.uid() AS uid) = id);

-- ============================================
-- TRIGGERS
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, daycare_id, role, full_name)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'daycare_id')::uuid,
    (new.raw_user_meta_data ->> 'role')::user_role,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
