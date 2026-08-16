# SPEC 11 — Vinculación padre-niño: invitación con email y registro

> **Status:** Aprobado
> **Depends on:** SPEC 05, SPEC 09, SPEC 10
> **Date:** 2026-08-15
> **Objective:** Persistir invitaciones en Supabase, enviar correo de invitación vía Resend, validar el código en activación de cuenta y crear el vínculo padre-niño en `parent_children`.

## Scope

**In:**

- Crear migración `invitations` vía MCP `apply_migration`: tabla con `id`, `child_id` FK → `children`, `invited_by` FK → `users`, `full_name`, `email`, `relationship` (relationship_type), `code` (text UNIQUE), `status` (invitation_status), `expires_at`, `accepted_at`, `created_at`. Habilitar RLS.
- Crear migración `parent_children` vía MCP `apply_migration`: tabla con `id`, `parent_id` FK → `users`, `child_id` FK → `children`, `relationship` (relationship_type), `created_at`. UNIQUE (`parent_id`, `child_id`). Habilitar RLS.
- Instalar paquete `resend` (`npm install resend`).
- Crear variable de entorno `RESEND_API_KEY` en `.env`.
- Crear `app/api/send-invitation/route.ts`: API route POST que recibe `{ invitationId, email, childName, parentName, code }`, envía correo vía Resend con template en español. Return 200 o error.
- Modificar `components/LinkParentModal.tsx`: al submit, hacer INSERT a tabla `invitations` en Supabase (con `child_id`, `invited_by` del usuario actual via `getUser()`, `full_name`, `email`, `relationship`, `code`, `status = 'pending'`, `expires_at = now + 7 días`). Luego llamar a `/api/send-invitation` para enviar el correo. Mostrar estado de loading y error si falla.
- Modificar `app/kids/[id]/page.tsx`: pasar `childId` al `LinkParentModal` para que pueda hacer el INSERT.
- Modificar `app/auth/activar-cuenta/page.tsx`:
  - Leer `?code=` de la URL al cargar.
  - Validar el código contra la tabla `invitations` (buscar por `code`, verificar que `status = 'pending'` y `expires_at > now()`).
  - Mostrar datos del niño (nombre, sala) en la tarjeta de invitación consultando `children` via `child_id` de la invitación.
  - Al hacer signUp exitoso: insertar en `parent_children` con `parent_id` = nuevo user ID, `child_id` de la invitación, `relationship` de la invitación. Actualizar `invitations.status` a `'accepted'` y `invitations.accepted_at` a `now()`.
  - Si el código no existe, expiró o ya fue aceptado: mostrar error inline.
- Actualizar `lib/database.types.ts` con `supabase generate types` al final.
- Crear `lib/invitations.ts` con tipo `Invitation` mapeado a la tabla.

**Out of scope (for future specs):**

- Lógica de expiración automática (cron job o trigger). La verificación es on-demand al intentar activar.
- Cancelación de invitaciones por el staff.
- Reenvío de invitación (generar nuevo código).
- Notificaciones push al padre.
- Edición o eliminación de padre vinculado.
- Filtrado de contenido por rol (staff vs parent).

## Data model

### Nuevas tablas Supabase

**Enum `relationship_type`:**

```sql
CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian');
```

**Enum `invitation_status`:**

```sql
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
```

**`invitations`:**

```sql
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  relationship relationship_type NOT NULL,
  code text UNIQUE NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**`parent_children`:**

```sql
CREATE TABLE parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  relationship relationship_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, child_id)
);
```

### Tipo TypeScript resultante

```ts
export interface Invitation {
  id: string;
  child_id: string;
  invited_by: string;
  full_name: string;
  email: string;
  relationship: "father" | "mother" | "guardian";
  code: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface ParentChild {
  id: string;
  parent_id: string;
  child_id: string;
  relationship: "father" | "mother" | "guardian";
  created_at: string;
}
```

## Implementation plan

1. **Migración `invitations`:** crear enum `relationship_type`, enum `invitation_status`, tabla `invitations` con FKs a `children` y `users`, y RLS con service_role full access. → tabla `invitations` existe en Supabase.

2. **Migración `parent_children`:** crear tabla `parent_children` con FKs a `users` y `children`, UNIQUE compuesta, y RLS con service_role full access. → tabla `parent_children` existe en Supabase.

3. **Instalar Resend:** `npm install resend`. Agregar `RESEND_API_KEY` a `.env.local` con valor provisional `re_xxxxx` (el usuario configura la key real después). → paquete instalado, variable definida.

4. **Crear `lib/invitations.ts`:** definir tipo `Invitation` y `ParentChild` mapeados a las tablas reales. Exportar helper `generateInvitationCode()` (5 chars alfanuméricos mayúsculos) y `buildInvitationExpiry()` (now + 7 días). → tipos y helpers disponibles.

5. **Crear `app/api/send-invitation/route.ts`:**
   - POST handler que recibe `{ invitationId, email, childName, parentName, code }`.
   - Instancia `Resend` con `RESEND_API_KEY`.
   - Envía email con `resend.emails.send()` desde `invitaciones@resend.dev` al `email` del padre.
   - Subject: `Invitación a OpenDayCare - Seguí el día de {childName}`.
   - Body en español (HTML simple): saludo, nombre del niño, código de invitación, link a `/auth/activar-cuenta?code={code}`, texto de expiración en 7 días.
   - Return `{ success: true }` o `{ error: message }` con status 400/500.
   → API route funcional, envía correo de prueba.

6. **Modificar `components/LinkParentModal.tsx`:**
   - Agregar prop `childId: string`.
   - Importar `createClient` de `@/utils/supabase/client`.
   - Importar `generateInvitationCode`, `buildInvitationExpiry` de `@/lib/invitations`.
   - En `handleSubmit`: después de validar, hacer `supabase.auth.getUser()` para obtener el staff ID. Luego INSERT a `invitations` con todos los campos. Luego POST a `/api/send-invitation`.
   - Agregar estados `sending` y `sendError` para manejar loading y errores del envío.
   - Si el INSERT o el email fallan: mostrar error inline, NO marcar `submitted = true`.
   - Si todo OK: proceder con el flujo actual (mostrar código, info box, deshabilitar formulario).
   → el modal persiste la invitación y envía el correo.

7. **Modificar `app/kids/[id]/page.tsx`:**
   - Pasar `childId={child.id}` al `<LinkParentModal>`.
   - → el modal recibe el ID del niño para el INSERT.

8. **Modificar `app/auth/activar-cuenta/page.tsx`:**
   - Al montar, leer `searchParams.get("code")` de la URL. Si existe, prellenar el campo código.
   - Modificar `validateInvitationCode`: buscar el código en la tabla `invitations`. Si no existe → error "Código inválido". Si existe y `status !== 'pending'` → error "La invitación ya fue utilizada". Si existe y `expires_at < now()` → error "La invitación expiró". Si existe y OK → guardar la `invitation` en estado.
   - Mostrar datos reales del niño en la tarjeta de invitación (consultar `children` via `child_id` de la invitación).
   - En `handleSubmit`: después de `signUp` exitoso, obtener el `user.id` del nuevo usuario. INSERT en `parent_children` con `parent_id = user.id`, `child_id` de la invitación, `relationship` de la invitación. UPDATE `invitations` set `status = 'accepted'`, `accepted_at = now()`.
   - Los defaults hardcodeados (`"7K4P9"`, `"lucia.fernandez@gmail.com"`, `"Mateo · Sala Soles"`) se eliminan. Si no hay `?code=` en la URL, el campo código queda vacío.
   → activar-cuenta valida contra la DB y crea el vínculo.

9. **Actualizar `lib/database.types.ts`:** ejecutar `npx supabase generate types` o recrear manualmente los tipos para incluir `rooms`, `children`, `invitations`, `parent_children`. → tipos sincronizados con la DB.

10. **Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Acceptance criteria

- [ ] Tabla `invitations` existe en Supabase con RLS habilitado.
- [ ] Tabla `parent_children` existe en Supabase con RLS habilitado.
- [ ] Enums `relationship_type` e `invitation_status` creados.
- [ ] Paquete `resend` instalado.
- [ ] Variable `RESEND_API_KEY` definida en `.env.local`.
- [ ] `lib/invitations.ts` creado con tipos `Invitation`, `ParentChild`, `generateInvitationCode()`, `buildInvitationExpiry()`.
- [ ] `app/api/send-invitation/route.ts` existe y envía correo vía Resend.
- [ ] `LinkParentModal` acepta prop `childId`.
- [ ] Al enviar el modal: se INSERTa una fila en `invitations` con todos los campos correctos.
- [ ] Al enviar el modal: se envía correo al email del padre con código y link a activar-cuenta.
- [ ] Al enviar el modal: si falla el INSERT o el email, se muestra error inline y NO se muestra el código.
- [ ] Al enviar el modal: si todo OK, se muestra el código y la info box (flujo actual).
- [ ] `/auth/activar-cuenta` lee `?code=` de la URL y prellena el campo.
- [ ] `/auth/activar-cuenta` valida el código contra la tabla `invitations`.
- [ ] Código inexistente muestra error "Código inválido".
- [ ] Código con status distinto de `pending` muestra error "La invitación ya fue utilizada".
- [ ] Código expirado (`expires_at < now()`) muestra error "La invitación expiró".
- [ ] Tarjeta de invitación muestra nombre real del niño y sala (desde DB).
- [ ] Al activar cuenta exitosamente: se INSERTa en `parent_children`.
- [ ] Al activar cuenta exitosamente: `invitations.status` cambia a `'accepted'` y `accepted_at` se registra.
- [ ] Defaults hardcodeados eliminados de `activar-cuenta` (`"7K4P9"`, `"lucia.fernandez@gmail.com"`, `"Mateo · Sala Soles"`).
- [ ] `lib/database.types.ts` actualizado con todas las tablas.
- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores en `app/`, `components/`, `lib/`.
- [ ] `npm run build` compila.

## Decisions taken and discarded

- **Tomada:** inserts directos desde el cliente (no API route para DB) — consistente con el patrón de SPEC 10 (`AddChildModal` hace INSERT directo). La API route es solo para Resend (server-side secret).
- **Tomada:** código generado client-side — consistente con SPEC 05, más simple. La uniqueness se garantiza con `UNIQUE` en la columna `code`.
- **Tomada:** verificación de expiración on-demand (no cron) — suficiente para el volumen actual; un cron job es overengineering por ahora.
- **Tomada:** `invitaciones@resend.dev` como sender — dominio de prueba de Resend, funcional sin configurar DNS.
- **Tomada:** email HTML simple (no react-email) — suficiente para MVP; se puede mejorar el template después.
- **Tomada:** `getUser()` en el modal para obtener `invited_by` — el usuario debe estar autenticado (SPEC 09 protege las rutas).
- **Tomada:** eliminar defaults hardcodeados de activar-cuenta — la página ahora depende de datos reales de la DB.
- **Tomada:** errores de invitación inline (no modal ni toast) — consistente con el patrón de errores de SPEC 05.
- **Descartada:** API route para INSERTs de DB — innecesario cuando el cliente puede hablar directamente con Supabase.
- **Descartada:** cron job de expiración — fuera de alcance, se resuelve on-demand.
- **Descartada:** reenvío de invitación — spec separado si se necesita.
- **Descartada:** cancelación de invitación — spec separado.
- **Descartada:** react-email o template avanzado — HTML simple es suficiente para MVP.
- **Descartada:** notificaciones push — fuera de alcance.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| `RESEND_API_KEY` no configurada | El email falla silenciosamente; mostrar error inline al usuario. Documentar en README que necesita configurar la key. |
| Código duplicado (colisión de 5 chars) | Probabilidad baja (~3.6M combinaciones). UNIQUE constraint en DB previene duplicados. Si falla, reintentar con nuevo código. |
| `getUser()` falla si la sesión expiró | El middleware de SPEC 09 ya redirige a login. Si llega al modal, la sesión es válida. |
| Usuario no existe en `users` al hacer INSERT en `invitations` | El trigger de SPEC 08 crea la fila en `users` al hacer signUp. Pero `invited_by` es el staff, no el padre. El staff ya existe en `users`. |
| `parent_children` INSERT falla si el user aún no tiene fila en `users` | Ocurre después de signUp, que ejecuta el trigger. El INSERT en `parent_children` se hace después del signUp, así que `users` ya existe. |

## What is **not** in this spec

- Lógica de expiración automática (cron job o trigger).
- Cancelación de invitaciones por el staff.
- Reenvío de invitación.
- Notificaciones push.
- Edición o eliminación de padre vinculado.
- Filtrado de contenido por rol (staff vs parent).
- Template de email avanzado (react-email).

Cada uno de estos, si se implementa, va en su propio spec.
