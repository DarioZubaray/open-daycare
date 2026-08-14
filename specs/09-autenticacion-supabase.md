# SPEC 09 — Autenticación real con Supabase Auth

> **Status:** Aprobado
> **Depends on:** SPEC 03, SPEC 07, SPEC 08
> **Date:** 2026-08-13
> **Objective:** Implementar autenticación real (email + password) con Supabase Auth, proteger rutas con middleware de Next.js, y cerrar sesión correctamente.

## Scope

**In:**

- Re-habilitar trigger `on_auth_user_created` (existe pero deshabilitado en la DB).
- Crear `middleware.ts` en la raíz del proyecto para proteger rutas: todas excepto `/auth/login`, `/auth/activar-cuenta` y assets estáticos. Si no hay sesión válida → redirigir a `/auth/login`.
- Modificar `app/auth/login/page.tsx`: reemplazar `router.push("/")` por `supabase.auth.signInWithPassword()`. En error, mostrar mensaje inline. En éxito, navegar a `/`.
- Modificar `app/auth/activar-cuenta/page.tsx`: reemplazar `router.push("/")` por `supabase.auth.signUp()` con metadata (`role`, `daycare_id`, `full_name`). El código de invitación es decorativo por ahora (no se valida contra una tabla de invitations).
- Modificar `components/Sidebar.tsx`: el botón "Cerrar sesión" debe llamar `supabase.auth.signOut()` antes de navegar a `/auth/login`.
- Actualizar `utils/supabase/middleware.ts`: refactorizar para que `createClient` devuelva `{ supabase, response }` en lugar de solo `response`.
- Refrescar sesión en cada request vía middleware (`getSession`).
- Los usuarios son pre-creados por un admin en Supabase Auth con `raw_user_meta_data` que incluye `daycare_id`, `role` y `full_name`. El trigger auto-crea la fila en `users`.

**Out of scope (for future specs):**

- Tabla de invitaciones (código de invitación es decorativo por ahora).
- Recuperación de contraseña ("¿Olvidaste tu contraseña?").
- Filtrado de contenido por rol (staff vs parent).
- Perfil de usuario / edición de avatar.
- Responsive móvil para pantallas auth.
- Selección de rol (Personal / Familia) en el login.

## Data model

No se introducen nuevas estructuras de datos. Se reutiliza el schema existente:

- `auth.users` — Supabase Auth gestiona sesiones, JWT, passwords.
- `public.users` — trigger `handle_new_user` auto-crea fila al insertar en `auth.users`.
- `public.daycares` — referencia para `daycare_id`.

Cookies de sesión: Supabase SSR gestiona `sb-<project-ref>-auth-token` cookie automáticamente.

## Implementation plan

1. **Re-habilitar trigger:** ejecutar en Supabase DB: `ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;`. → trigger activo, new signups auto-crean fila en `users`.

2. **Refactorizar `utils/supabase/middleware.ts`:** cambiar `createClient` para que devuelva `{ supabase, response }` en lugar de solo `response`. Agregar `getSession()` para refrescar la sesión en cada request. → archivo actualizado, exporta ambas cosas.

3. **Crear `middleware.ts` en raíz del proyecto:** implementar middleware de Next.js que:
   - Ejecute en todas las rutas excepto `_next/static`, `_next/image`, `favicon.ico`, `public/`.
   - Para rutas `/auth/login` y `/auth/activar-cuenta`: si ya hay sesión válida, redirigir a `/` (evitar que un usuario logueado vea el login).
   - Para todas las demás rutas: si no hay sesión válida, redirigir a `/auth/login`.
   - Use `utils/supabase/middleware.ts` para crear el cliente Supabase.
   → `middleware.ts` creado, rutas protegidas funcionando.

4. **Modificar `app/auth/login/page.tsx`:** reemplazar `router.push("/")` por llamada a `supabase.auth.signInWithPassword({ email, password })`. Si hay error, mostrar mensaje inline debajo del formulario. Si éxito, navegar a `/`. Importar `createClient` de `@/utils/supabase/client`. → login funcional con Supabase Auth.

5. **Modificar `app/auth/activar-cuenta/page.tsx`:** reemplazar `router.push("/")` por llamada a `supabase.auth.signUp({ email, password, options: { data: { role, daycare_id, full_name } } })`. El código de invitación se ignora (decorativo). Importar `createClient` de `@/utils/supabase/client`. → activar-cuenta funcional con signUp.

6. **Modificar `components/Sidebar.tsx`:** importar `createClient` de `@/utils/supabase/client`. En el handler de "Cerrar sesión", llamar `await supabase.auth.signOut()` antes de `router.push("/auth/login")`. → logout cierra sesión correctamente.

7. **Verificación final:** `npx tsc --noEmit`, `npm run lint`, `npm run build`. → todo pasa.

## Acceptance criteria

- [ ] Trigger `on_auth_user_created` está habilitado en la DB (`tgenabled = 'A'`).
- [ ] `utils/supabase/middleware.ts` exporta `createClient` que devuelve `{ supabase, response }`.
- [ ] `middleware.ts` existe en la raíz del proyecto.
- [ ] Rutas protegidas redirigen a `/auth/login` cuando no hay sesión.
- [ ] `/auth/login` y `/auth/activar-cuenta` son accesibles sin sesión.
- [ ] Si un usuario logueado visita `/auth/login`, se redirige a `/`.
- [ ] Login llama a `supabase.auth.signInWithPassword()`.
- [ ] Login muestra mensaje de error inline si las credenciales son inválidas.
- [ ] Login navega a `/` en éxito.
- [ ] Activar-cuenta llama a `supabase.auth.signUp()` con metadata.
- [ ] Sidebar "Cerrar sesión" llama a `supabase.auth.signOut()` antes de navegar.
- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores en `app/`, `components/`, `utils/`.
- [ ] `npm run build` compila.

## Decisions taken and discarded

- **Tomada:** re-habilitar trigger existente — ya está definido en SPEC 08, solo necesita ENABLE TRIGGER.
- **Tomada:** middleware en raíz (`middleware.ts`) — patrón estándar de Next.js para route protection.
- **Tomada:** `getSession()` en middleware para refrescar cookies — mantiene la sesión viva entre requests.
- **Tomada:** redirigir a `/` si logueado visita `/auth/login` — evita mostrar login innecesariamente.
- **Tomada:** código de invitación decorativo por ahora — la validación real de invitations requiere una tabla nueva (spec futuro).
- **Tomada:** `signOut()` en sidebar — un usuario que cierra sesión debe perder la sesión completamente.
- **Tomada:** errores de login inline — UX consistente con el patrón de errores de campo existente.
- **Descartada:** tabla de invitations — requiere spec separado.
- **Descartada:** filtrado por rol — fuera de alcance explícito.
- **Descartada:** recuperación de contraseña — spec futuro.
- **Descartada:** `AuthLayout` como Server Component — se mantiene como está (funcional).

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Trigger deshabilitado puede causar users huérfanos en auth.users | Re-habilitar como paso 1 de la spec; verificar con test de signUp |
| Cookie de sesión puede expirar y causar loops de redirect | `getSession()` en middleware refresca cookies automáticamente |
| Errores de red en signIn/signUp pueden no mostrarse | Mostrar error genérico de "Error de conexión" como fallback |

## What is **not** in this spec

- Tabla de invitaciones.
- Recuperación de contraseña.
- Filtrado de contenido por rol (staff vs parent).
- Perfil de usuario / edición de avatar.
- Responsive móvil.
- Selección de rol en login.
