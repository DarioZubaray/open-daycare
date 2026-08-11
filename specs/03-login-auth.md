# SPEC 03 — Pantallas de autenticación (Login + Activar cuenta)

> **Status:** Draft
> **Depends on:** SPEC 01
> **Date:** 2026-08-11
> **Objective:** Implementar las pantallas de login (`/auth/login`) y activar cuenta (`/auth/activar-cuenta`) a partir de los mockups `login.dc.html` y `activar-cuenta.dc.html`, con formularios funcionales con validación, navegación entre ambas y hacia el home, sin sidebar, sin persistencia ni estado de sesión.

## Scope

**In:**

- Ruta `/auth/login`: layout desktop idéntico al mockup `login.dc.html` (panel izquierdo gradiente + formulario derecho), sin sidebar. Formulario funcional con campos email y password, validación básica, botón "Iniciar sesión" que navega a `/`. Link "Activá tu cuenta" → `/auth/activar-cuenta`. Link "¿Olvidaste tu contraseña?" → `href="#"`.
- Ruta `/auth/activar-cuenta`: layout desktop idéntico al mockup `activar-cuenta.dc.html` (formulario centrado), sin sidebar. Formulario funcional con campos código de invitación, email, crear contraseña, checkbox de autorización fotográfica, validación. Botón "Activar mi cuenta" que navega a `/`. Link "¿Ya tenés cuenta? Iniciar sesión" → `/auth/login`.
- Quitar los botones de selección de rol ("Personal" / "Familia") del login — fuera de alcance.
- `components/AuthLayout.tsx`: layout compartido para ambas pantallas auth (fondo `#FBF4EC`, sin sidebar, contenido centrado).
- Actualizar el botón "Cerrar sesión" en `components/Sidebar.tsx` (ya existente en SPEC 01) para que navegue a `/auth/login`.
- Validación de campos: email con formato válido, password mínimo 6 caracteres, código de invitación no vacío.
- Mensajes de error inline debajo de cada campo, estilo consistente con el design system.

**Out of scope (for future specs):**

- Autenticación real, JWT, sesiones, backend, API, base de datos.
- Persistencia de任何形式 (localStorage, cookies, etc.).
- Selección de rol (Personal / Familia).
- Recuperación de contraseña ("¿Olvidaste tu contraseña?").
- Feed familia (`familia-feed.dc.html`).
- Responsive móvil para pantallas auth.

## Data model

This feature introduces no new data structures for persistence. It uses local React state for form fields and validation errors.

```ts
// Local state shape for login form (app/auth/login/page.tsx)
interface LoginFormState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
  };
}

// Local state shape for activate-account form (app/auth/activar-cuenta/page.tsx)
interface ActivateFormState {
  invitationCode: string;
  email: string;
  password: string;
  authorizePhotos: boolean;
  errors: {
    invitationCode?: string;
    email?: string;
    password?: string;
  };
}
```

Validation rules:
- Email: must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Password: minimum 6 characters.
- Invitation code: non-empty after trimming.

## Implementation plan

1. **`components/AuthLayout.tsx`:** layout server component wrapping auth pages. Props: `children`. Renders a full-viewport container with `bg-[#FBF4EC]`, centered content, no sidebar. Used by both `/auth/login` and `/auth/activar-cuenta`. → build passes.

2. **`app/auth/login/page.tsx`:** page client component inside `AuthLayout`. Split layout: left gradient panel (identical to mockup — gradient `#F6A98E→#EC7E62`, decorative circles, logo, heading, subheading, "Guardería Sala Soles"), right form panel (email input, password input, "¿Olvidaste tu contraseña?" `href="#"`, "Iniciar sesión" button with gradient, "Activá tu cuenta" link → `/auth/activar-cuenta`). No role buttons. Local state for email, password, errors. On submit: validate, if valid `router.push("/")`. → `/auth/login` renders correctly, form validates.

3. **`app/auth/activar-cuenta/page.tsx`:** page client component inside `AuthLayout`. Centered form (identical to mockup — logo icon, heading "Bienvenida a OpenDayCare", subheading, invitation card with avatar "M" + "Mateo · Sala Soles", invitation code input, email input, create-password input, checkbox "Autorizo a la guardería…", "Activar mi cuenta" button with gradient, "¿Ya tenés cuenta? Iniciar sesión" link → `/auth/login`). Local state for all fields + errors. On submit: validate all fields, if valid `router.push("/")`. → `/auth/activar-cuenta` renders correctly, form validates.

4. **`components/Sidebar.tsx`:** change the logout `<a href="#">` to `<Link href="/auth/login">` (line 141). → clicking "Cerrar sesión" in sidebar navigates to `/auth/login`.

5. **Verification:** `npx tsc --noEmit`, `npm run lint`, `npm run build`; visual comparison with `references/screenshots/login.png` (if exists) and mockup HTML; navigation flow: `/` → sidebar "Cerrar sesión" → `/auth/login` → fill form + "Iniciar sesión" → `/` → `/auth/login` → "Activá tu cuenta" → `/auth/activar-cuenta` → fill form + "Activar mi cuenta" → `/`.

## Acceptance criteria

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores en `app/` y `components/` (se ignoran los de `references/`).
- [ ] `npm run build` compila.
- [ ] `/auth/login` muestra layout split idéntico al mockup: panel izquierdo gradiente con logo, heading, subheading, "Guardería Sala Soles"; panel derecho con formulario.
- [ ] Login NO muestra botones de rol ("Personal" / "Familia").
- [ ] Login muestra campos email y password con estilos del mockup (bordes `#EADFD0`, radio 14px, fondo blanco).
- [ ] "¿Olvidaste tu contraseña?" aparece alineado a la derecha en color `#C5503A`, `href="#"`.
- [ ] "Iniciar sesión" es un botón con gradiente `#F4977E→#EE8164`, sombra, texto blanco, navega a `/` al hacer click si la validación pasa.
- [ ] "Activá tu cuenta" es un link en `#C5503A` que navega a `/auth/activar-cuenta`.
- [ ] Si el email es inválido (sin @ o dominio), se muestra error inline debajo del campo.
- [ ] Si la contraseña tiene menos de 6 caracteres, se muestra error inline debajo del campo.
- [ ] `/auth/activar-cuenta` muestra layout centrado idéntico al mockup: logo, heading, subheading, tarjeta de invitación (avatar "M", "Mateo · Sala Soles").
- [ ] Activate-account muestra campos código de invitación (letter-spacing 3px, Fredoka), email, crear contraseña, con estilos del mockup.
- [ ] Checkbox de autorización fotográfica con fondo `#FBF1D6` y check verde `#5FB97E`.
- [ ] "Activar mi cuenta" navega a `/` si la validación pasa.
- [ ] "¿Ya tenés cuenta? Iniciar sesión" navega a `/auth/login`.
- [ ] Si el código de invitación está vacío, se muestra error inline.
- [ ] Sidebar "Cerrar sesión" navega a `/auth/login`.
- [ ] Ambas páginas NO muestran sidebar.
- [ ] Navegación completa funciona: `/` → `/auth/login` → `/auth/activar-cuenta` → `/auth/login` → `/`.
- [ ] Todos los identificadores internos en inglés; español solo en copy de UI.

## Decisions taken and discarded

- **Tomada:** rutas `/auth/login` y `/auth/activar-cuenta` bajo prefijo `/auth/` — agrupa las pantallas de autenticación y las separa del contenido principal.
- **Tomada:** `AuthLayout.tsx` como layout compartido — evita duplicar el fondo `#FBF4EC` y el centrado en ambas páginas.
- **Tomada:** formularios con estado local (`useState`) y validación inline — suficiente sin backend; la validación se puede reutilizar cuando exista API.
- **Tomada:** quitar botones de rol — el usuario confirmó que están fuera de alcance.
- **Tomada:** "Cerrar sesión" en sidebar apunta a `/auth/login` — solo navega, sin limpiar estado (ya no hay estado).
- **Tomada:**死 links para "¿Olvidaste tu contraseña?" — el usuario confirmó que por ahora son dead links.
- **Descartada:** persistencia de sesión (localStorage, cookies) — sin backend no tiene sentido.
- **Descartada:** selección de rol (Personal / Familia) — fuera de alcance explícito.
- **Descartada:** feed familia (`familia-feed.dc.html`) — spec separado.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| El layout split del login puede no verse idéntico al mockup en diferentes anchos de ventana | Usar las mismas medidas del mockup (`grid-template-columns: 1.05fr 1fr`); ajustar con responsive si es necesario |
| La validación de email con regex puede no cubrir todos los casos válidos | Regex simple `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` es suficiente para la etapa actual sin backend |
| `router.push("/")` después del submit puede causar flash de contenido | Aceptable sin autenticación real; el usuario ya decidió que no hay estado |

## What is **not** in this spec

- Autenticación real, JWT, sesiones, backend, API, base de datos.
- Persistencia de任何形式.
- Selección de rol (Personal / Familia).
- Recuperación de contraseña.
- Feed familia.
- Responsive móvil para pantallas auth.

Cada uno de estos, si se implementa, va en su propio spec.
