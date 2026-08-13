# SPEC 08 — Crear tabla users y enums (Supabase)

> **Status:** Aprobado
> **Depends on:** SPEC 07
> **Date:** 2026-08-13
> **Objective:** Crear la tabla `users` con enums `user_role` y `user_status`, trigger auto-creat en `auth.users`, RLS para `service_role` y `authenticated`, y seed con 1 usuario staff para testing.

## Scope

**In:**

- Crear enums `user_role` (`staff`, `parent`, `admin`) y `user_status` (`pending`, `active`) en el schema declarativo.
- Crear tabla `users` con campos: `id` (FK → `auth.users`), `daycare_id` (FK → `daycares`), `role`, `status`, `full_name`, `avatar_url`, `notify_on_post`, `daily_summary_enabled`, `created_at`, `updated_at`.
- Función `SECURITY DEFINER` + trigger `AFTER INSERT` en `auth.users` para auto-crear fila en `users` usando `raw_user_meta_data`.
- RLS: `service_role` acceso total; `authenticated` solo ve/edita usuarios de su misma `daycare_id`.
- Seed: 1 usuario staff (`dario@mail.com` / `Abc123456@`) vinculado a "Guardería Sala Soles".
- Generar tipos TypeScript actualizados.
- Migración en `supabase/migrations/`.

**Out of scope (for future specs):**

- Integración de login/signup en la UI (SPEC 03 ya cubre auth).
- CRUD de usuarios desde la UI.
- Flujo de invitaciones a padres (spec separado).
- Perfil de usuario / edición de avatar.
- Relación `parent_children` (spec separado).
- Tabs adicionales de la tabla users (posts, comments, etc.).

## Data model

```sql
-- Enums
create type user_role as enum ('staff', 'parent', 'admin');
create type user_status as enum ('pending', 'active');

-- Tabla users
create table users (
  id                     uuid primary key references auth.users(id) on delete cascade,
  daycare_id             uuid references daycares(id),
  role                   user_role  not null,
  status                 user_status not null default 'active',
  full_name              text       not null,
  avatar_url             text,
  notify_on_post         boolean    not null default true,
  daily_summary_enabled  boolean    not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Índice para búsquedas por daycare
create index idx_users_daycare_id on users(daycare_id);

-- RLS
alter table users enable row level security;

-- service_role: acceso total
create policy "Service role full access"
  on users
  for all
  to service_role
  using (true)
  with check (true);

-- authenticated: solo ve/edita usuarios de su misma daycare
create policy "Users can view same daycare"
  on users
  for select
  to authenticated
  using (daycare_id = (select daycare_id from users where id = auth.uid()));

create policy "Users can update same daycare"
  on users
  for update
  to authenticated
  using (daycare_id = (select daycare_id from users where id = auth.uid()))
  with check (daycare_id = (select daycare_id from users where id = auth.uid()));

-- Trigger: auto-crear user al insertar en auth.users
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
```

Seed data (`supabase/seed.sql` — agregar al final):

```sql
-- Staff user for testing (bypasses trigger, direct insert)
insert into users (id, daycare_id, role, status, full_name)
values (
  '00000000-0000-0000-0000-000000000001',
  (select id from daycares where name = 'Guardería Sala Soles'),
  'staff',
  'active',
  'Dario'
);
```

## Implementation plan

1. **Actualizar schema declarativo:** agregar enums `user_role`, `user_status` y tabla `users` + RLS + trigger a `supabase/schemas/public.sql`. → archivo contiene las 3 definiciones.

2. **Generar migración:** ejecutar `supabase db diff --schema public` para generar la migración. → archivo en `supabase/migrations/` con CREATE TYPE, CREATE TABLE, RLS, función y trigger.

3. **Verificar migración:** revisar que el archivo generado contiene los CREATE TYPE, CREATE TABLE, las policies de RLS, la función `handle_new_user` y el trigger `on_auth_user_created`. → todo presente.

4. **Seed data:** agregar INSERT del usuario staff a `supabase/seed.sql`. → archivo actualizado.

5. **Aplicar migración:** ejecutar `supabase db push` (o `supabase migration up`) para aplicar a la DB local/branch. → migración aplicada sin errores.

6. **Generar tipos TypeScript:** ejecutar `supabase gen types typescript` y actualizar `lib/database.types.ts`. → tipos incluyen `users`, `user_role`, `user_status`.

7. **Verificación final:** `npx tsc --noEmit`, `npm run lint`, `npm run build`. → todo pasa.

## Acceptance criteria

- [ ] `supabase/schemas/public.sql` define enums `user_role` y `user_status`.
- [ ] `supabase/schemas/public.sql` define tabla `users` con todos los campos del schema.
- [ ] Migración generada contiene `CREATE TYPE user_role`, `CREATE TYPE user_status`, `CREATE TABLE users`.
- [ ] Migración contiene función `handle_new_user` y trigger `on_auth_user_created`.
- [ ] RLS habilitado en `users`.
- [ ] Policy `service_role` permite acceso total.
- [ ] Policy `authenticated` filtra por `daycare_id`.
- [ ] `supabase/seed.sql` inserta 1 usuario staff vinculado a "Guardería Sala Soles".
- [ ] Tipos TypeScript generados incluyen tabla `users` y enums.
- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores en `app/` y `lib/`.
- [ ] `npm run build` compila.

## Decisions taken and discarded

- **Tomada:** trigger `AFTER INSERT` en `auth.users` — el schema de referencia lo especifica; evita tener que insertar en 2 tablas manualmente.
- **Tomada:** `SECURITY DEFINER` en la función — necesario para que pueda insertar en `users` sin permisos directos del usuario que hace signup.
- **Tomada:** RLS `authenticated` filtra por `daycare_id` — un usuario solo ve gente de su guardería.
- **Tomada:** `avatar_url` incluido en tabla pero sin UI — preparado para futuro spec de perfil.
- **Tomada:** seed con INSERT directo en `users` (no vía auth) — simpler para testing sin necesidad de crear auth user.
- **Tomada:** `idx_users_daycare_id` — optimiza el filtro RLS y queries frecuentes.
- **Descartada:** integración de login/signup en UI — ya cubierto en SPEC 03.
- **Descartada:** política `authenticated` para INSERT/DELETE — premature; el alta de usuarios es vía trigger o service_role.
- **Descartada:** campo `email` en tabla `users` — Supabase ya lo gestiona en `auth.users`.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Trigger puede fallar si `raw_user_meta_data` no tiene los campos requeridos | Validar en la función con COALESCE o defaults; log de error |
| RLS `authenticated` puede ser lento si `users` crece | Índice en `daycare_id` ya incluido; la subquery es indexada |
| Seed data con UUID fijo puede colisionar | UUID `00000000-0000-0000-0000-000000000001` es claramente un test; documentar que no usar en prod |

## What is **not** in this spec

- Login/signup en la UI (SPEC 03).
- CRUD de usuarios desde la UI.
- Flujo de invitaciones a padres.
- Perfil de usuario / edición de avatar.
- Relación `parent_children`.
- Tabs de posts, comments, reactions en users.
