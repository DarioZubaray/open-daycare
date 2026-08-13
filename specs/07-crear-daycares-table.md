# SPEC 07 — Crear tabla daycares (Supabase)

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-08-12
> **Objective:** Crear la tabla `daycares` como entidad raíz del schema con migración declarativa de Supabase, RLS restringido a `service_role`, y seed data con 5 guarderías.

## Scope

**In:**

- Inicializar directorio `supabase/` con `config.toml` si no existe.
- Crear `supabase/schemas/public.sql` con la definición declarativa de la tabla `daycares`.
- Generar migración en `supabase/migrations/` con la tabla `daycares` (campos: `id` uuid PK, `name` text, `address` text, `created_at` timestamptz).
- Configurar RLS: habilitar en `daycares`, política de acceso solo para `service_role` (lectura y escritura).
- Seed data: insertar 5 guarderías de ejemplo en `supabase/seed.sql`, siendo "Guardería Sala Soles" la principal.
- Generar tipos TypeScript con `supabase gen types typescript`.

**Out of scope (for future specs):**

- Tablas `users`, `rooms`, `children` y demás (van en specs separados).
- Integración de auth con `daycares`.
- CRUD de guarderías desde la UI.
- RLS para `authenticated` o `parent` (se configura cuando se agregan las tablas dependientes).
- Exponer la tabla vía Data API (se hace al agregar RLS para `authenticated`).

## Data model

```sql
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
```

Seed data (`supabase/seed.sql`):

```sql
insert into daycares (name, address) values
  ('Guardería Sala Soles', 'Av. Libertador 1234, CABA'),
  ('Guardería Pequeños Genios', 'Calle Belgrano 567, CABA'),
  ('Guardería El Jardín', 'Av. Santa Fe 890, CABA'),
  ('Guardería Sonrisas', 'Calle Corrientes 2345, CABA'),
  ('Guardería Creciendo', 'Av. Rivadavia 6789, CABA');
```

## Implementation plan

1. **Inicializar Supabase local:** ejecutar `supabase init` si no existe `supabase/config.toml`. Verificar que el directorio `supabase/` se crea con la estructura correcta. → `supabase/config.toml` existe.

2. **Crear schema declarativo:** crear `supabase/schemas/public.sql` con la tabla `daycares` + RLS (definición arriba). → el archivo existe y es válido SQL.

3. **Generar migración:** ejecutar `supabase db diff --schema public > supabase/migrations/00001_create_daycares.sql` para generar la migración desde el schema declarativo. → archivo de migración generado.

4. **Verificar migración:** ejecutar `supabase db push` o revisar el archivo generado para confirmar que contiene `CREATE TABLE daycares` + `ALTER TABLE daycares ENABLE ROW LEVEL SECURITY` + la política de `service_role`. → migración correcta.

5. **Seed data:** crear `supabase/seed.sql` con los 5 INSERTs. → archivo creado.

6. **Generar tipos TypeScript:** ejecutar `supabase gen types typescript --local > lib/database.types.ts` (o ruta equivalente). → tipos generados sin errores.

7. **Verificación final:** `npx tsc --noEmit`, `npm run lint`, `npm run build`. → todo pasa.

## Acceptance criteria

- [ ] `supabase/config.toml` existe con configuración válida.
- [ ] `supabase/schemas/public.sql` define la tabla `daycares` con los campos `id`, `name`, `address`, `created_at`.
- [ ] Migración generada en `supabase/migrations/` contiene `CREATE TABLE daycares`.
- [ ] RLS habilitado en `daycares`.
- [ ] Política de acceso solo para `service_role` (no `authenticated`, no `anon`).
- [ ] `supabase/seed.sql` inserta 5 guarderías, con "Guardería Sala Soles" como primera.
- [ ] Tipos TypeScript generados incluyen la tabla `daycares`.
- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores en `app/` y `lib/`.
- [ ] `npm run build` compila.

## Decisions taken and discarded

- **Tomada:** enfoque declarativo (`supabase/schemas/`) — el usuario lo pidió explícitamente.
- **Tomada:** migración generada vía `db diff` — combina lo declarativo con control manual del archivo de migración.
- **Tomada:** RLS solo `service_role` — la tabla es raíz, no tiene sentido exponerla hasta que existan usuarios autenticados.
- **Tomada:** campo `address` agregado — el usuario lo pidió además del schema de referencia.
- **Tomada:** seed data con 5 guarderías — el usuario lo especificó.
- **Descartada:** integración con auth — va en spec separado cuando se cree la tabla `users`.
- **Descartada:** RLS para `authenticated` — premature hasta que haya auth configurado.
- **Descartada:** campos adicionales (`phone`, `logo_url`) — el usuario solo pidió `address`.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Schema drift entre `schemas/` y la migración generada | Usar `db diff` como única fuente de verdad; no editar migraciones a mano |
| Seed data se ejecuta en producción | Verificar `config.toml` tenga `[db] seed = "supabase/seed.sql"` y no ejecutar seed en prod |

## What is **not** in this spec

- Tablas `users`, `rooms`, `children`, `posts` y demás.
- Integración de auth con Supabase Auth.
- CRUD de guarderías desde la UI.
- RLS para `authenticated` o `parent`.
- Exponer la tabla vía Data API.
- Responsive móvil.
