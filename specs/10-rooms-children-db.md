# SPEC 10 — Tablas rooms y children + integración con UI

> **Status:** Implementado
> **Depends on:** SPEC 07, SPEC 08
> **Date:** 2026-08-14
> **Objective:** Crear tablas `rooms` y `children` en Supabase, insertar 3 salas iniciales, integrar el listado de niños desde la base de datos y reemplazar los datos hardcodeados en la UI.

## Scope

**In:**

- Crear migración `rooms` vía MCP `apply_migration`: tabla con `id`, `daycare_id` FK → `daycares`, `name`, `created_at`. Habilitar RLS.
- Crear migración `children` vía MCP `apply_migration`: tabla con `id`, `room_id` FK → `rooms`, `full_name`, `birth_date`, `enrolled_at`, `medical_notes`, `allergy_tags` (text[]), `photo_consent`, `status` (child_status), `created_at`, `updated_at`. Habilitar RLS.
- Crear migración `seed_rooms`: insertar 3 salas iniciales (Soles, Lunas, Estrellas) vinculadas a un `daycare_id` existente.
- Modificar `components/AddChildModal.tsx`: reemplazar `console.log` por INSERT real a Supabase en tabla `children`. Al guardar, hacer upsert del niño y refrescar el listado.
- Modificar `app/kids/page.tsx`: eliminar import de `children` hardcodeado. Hacer SELECT a Supabase al montar el componente para obtener los niños reales. Mostrar loading state mientras se carga.
- Modificar `app/page.tsx` (feed): reemplazar string hardcodeado `"12 niños"` por un conteo dinámico desde Supabase (`children` donde `status = 'active'`).
- Eliminar `lib/children.ts` (datos hardcodeados de 8 niños).
- Eliminar imports de `lib/children.ts` en `components/CreatePostModal.tsx` y cualquier otro archivo que lo referencie.
- Crear `lib/types.ts` con tipos `Child` y `Room` mapeados a los campos reales de la tabla `children` de Supabase.

**Out of scope (for future specs):**

- Tabla `parent_children` (vinculación padre ↔ niño).
- Tabla `invitations`.
- Edición de niño existente.
- Eliminación de niño (borrado lógico).
- Búsqueda funcional de niños.
- Selección o generación de avatar.
- Filtrado de contenido por rol (staff vs parent).
- Tabla `posts` y tablas derivadas.

## Data model

### Nuevas tablas Supabase

**`rooms`**

```sql
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES daycares(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**`children`**

```sql
CREATE TYPE child_status AS ENUM ('active', 'archived');

CREATE TABLE children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  birth_date date NOT NULL,
  enrolled_at date NOT NULL DEFAULT CURRENT_DATE,
  medical_notes text,
  allergy_tags text[] DEFAULT '{}',
  photo_consent boolean NOT NULL DEFAULT true,
  status child_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Seed:** 3 filas en `rooms` (Soles, Lunas, Estrellas) vinculadas al primer `daycare_id` existente.

### Tipo TypeScript resultante

```ts
export interface Child {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[];
  photo_consent: boolean;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  room_name?: string;
}

export interface Room {
  id: string;
  daycare_id: string;
  name: string;
  created_at: string;
}
```

## Implementation plan

1. **Migración `rooms`:** crear tabla `rooms` vía MCP `apply_migration`. Habilitar RLS con política service_role full access. → tabla `rooms` existe en Supabase.

2. **Migración `children`:** crear enum `child_status`, tabla `children` con FK a `rooms`, y RLS con service_role full access. → tabla `children` existe en Supabase.

3. **Migración `seed_rooms`:** INSERT de 3 salas (Soles, Lunas, Estrellas) usando el primer `daycare_id` de la tabla `daycares`. → las 3 salas visibles en Supabase.

4. **Eliminar `lib/children.ts`:** borrar el archivo completo con los 8 niños hardcodeados y el tipo `Child`. → archivo eliminado.

5. **Crear `lib/types.ts`:** definir el tipo `Child` que mapea los campos reales de la tabla `children` de Supabase, más un tipo `Room` para la tabla `rooms`. → tipos disponibles para toda la app.

6. **Modificar `components/AddChildModal.tsx`:**
   - Importar `createClient` de `@/utils/supabase/client`.
   - Reemplazar `console.log` en `handleSubmit` por `supabase.from('children').insert(...)`.
   - Dropdown de salas ahora hace SELECT a `rooms` para obtener opciones reales.
   - → el modal inserta niños reales en Supabase.

7. **Modificar `app/kids/page.tsx`:**
   - Eliminar import de `children` de `@/lib/children`.
   - Agregar useEffect que haga `supabase.from('children').select('*, rooms(name)')` al montar.
   - Almacenar resultado en state. Mostrar skeleton mientras carga.
   - → el listado de `/kids` muestra niños reales de la DB.

8. **Modificar `app/page.tsx` (feed):**
   - Eliminar string hardcodeado `"12 niños"`.
   - Hacer count query: `supabase.from('children').select('*', { count: 'exact', head: true }).eq('status', 'active')`.
   - → el feed muestra la cantidad real de niños.

9. **Modificar `components/CreatePostModal.tsx`:**
   - Eliminar import de `children` de `@/lib/children`.
   - → sin dependencia de datos hardcodeados.

10. **Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Acceptance criteria

- [x] Tabla `rooms` existe en Supabase con RLS habilitado.
- [x] Tabla `children` existe en Supabase con RLS habilitado.
- [x] Enum `child_status` creado (`active`, `archived`).
- [x] 3 salas iniciales insertadas (Soles, Lunas, Estrellas).
- [x] `lib/children.ts` eliminado.
- [x] `lib/types.ts` creado con tipos `Child` y `Room`.
- [x] `AddChildModal` hace INSERT a Supabase al guardar (sin `console.log`).
- [x] Dropdown de salas en `AddChildModal` carga opciones desde `rooms` en DB.
- [x] `/kids` carga niños desde Supabase al montar (con loading state).
- [x] Al agregar un niño desde el modal, el listado se actualiza automáticamente.
- [x] Feed (`/`) muestra conteo dinámico de niños activos.
- [x] `CreatePostModal` no importa de `lib/children.ts`.
- [x] No hay ningún import de `lib/children.ts` en todo el proyecto.
- [x] `npx tsc --noEmit` sin errores.
- [x] `npm run lint` sin errores en `app/`, `components/`, `lib/`.
- [x] `npm run build` compila.

## Decisions taken and discarded

- **Tomada:** migraciones vía MCP `apply_migration` — más directo que la CLI, evita inconsistencias entre entorno local y remoto.
- **Tomada:** `allergy_tags` como `text[]` de Postgres — suficiente para el volumen; normalizar en tabla separada si se necesita busca avanzada.
- **Tomada:** INSERT real desde `AddChildModal` — reemplaza `console.log`, integra el flujo completo de creación.
- **Tomada:** DELETE `lib/children.ts` — eliminar datos hardcodeados para forzar integridad con la DB.
- **Tomada:** tipo `Child` en archivo separado (`lib/types.ts`) — separa tipos de datos de lógica de negocio.
- **Tomada:** count dinámico en feed — más preciso que hardcodear.
- **Descartada:** tabla `parent_children` — fuera de alcance confirmado por el usuario.
- **Descartada:** seed de niños de prueba — el usuario poblará manualmente desde el modal.
- **Descartada:** tabla `allergies` normalizada — array `text[]` es suficiente por ahora.
- **Descartada:** edición/eliminación de niño — fuera de alcance, spec futuro.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| `daycare_id` puede no existir al hacer seed de rooms | Seed busca el primer `daycare_id` existente con `SELECT id FROM daycares LIMIT 1` |
| RLS denegar inserts desde el cliente | Usar service_role en migraciones; en UI el usuario debe estar autenticado |
| `CreatePostModal` puede romperse al eliminar import | Verificar SELECT a Supabase antes de eliminar |
| Tipo `Child` cambiado puede causar errores de tipado | Migrar todos los consumers en los mismos pasos |

## What is **not** in this spec

- Tabla `parent_children` (vinculación padre ↔ niño).
- Tabla `invitations`.
- Edición de niño existente.
- Eliminación de niño (borrado lógico).
- Búsqueda funcional de niños.
- Selección o generación de avatar.
- Filtrado de contenido por rol.
- Tabla `posts` y tablas derivadas.
- Seed de niños de prueba.

Cada uno de estos, si se implementa, va en su propio spec.
