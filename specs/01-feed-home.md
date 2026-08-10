# SPEC 01 — Feed como home (`/`)

**State:** Implementado
**Depends on:** —
**Date:** 2026-08-09
**Objective:** Implementar el feed de staff del mockup `references/pantallas/feed.dc.html` como home (`/`) del proyecto con estilado idéntico al proporcionado, contenido estático, fecha dinámica en español y toggle móvil, sin autenticación ni persistencia.

## Scope (in)

- Layout desktop idéntico al mockup: sidebar sticky de 248px + main centrado (max-width 760px) con scroll propio, fondo `#F6ECDF`.
- Sidebar completa: logo "OpenDayCare / Sala Soles", botón "Nueva publicación", nav (Feed activo / Niños / Avisos / Mi cuenta), footer "Caro Giménez · Maestra · Soles" + logout.
- Composer "Compartí un momento…" como tarjeta enlazada.
- Header con saludo "Buenas, Caro", eyebrow "GUARDERÍA · SALA SOLES", "12 niños" fijo y **fecha real de hoy en es-AR** (`Intl.DateTimeFormat`, ej. "domingo 9 ago").
- 3 posts estáticos renderizados desde un módulo de datos tipado: LOGRO (Mateo, 3♥/1), ACTIVIDAD con placeholder de foto (Mateo, 5♥/2), ANUNCIO (icono megáfono, 8♥/0), bajo el divider "PUBLICADO HOY". Horas fijas ("14:20", "09:40", "07:50").
- Tipografías Fredoka + Nunito vía `next/font/google` reemplazando Geist; `lang="es"` y metadata en el layout.
- Design tokens en Tailwind v4 (`@theme`).
- Móvil: botón hamburguesa que muestra/oculta la sidebar bajo 900px (breakpoint custom).
- Enlaces a páginas inexistentes (Niños, Avisos, Mi cuenta, Nueva publicación, Editar, composer, logout) con `href="#"`.

## No está en el alcance

- Autenticación / login, persistencia / DB / API (ninguna).
- Pantallas crear-publicacion, detalle-publicacion, foto, ninos, avisos, mi-cuenta, login.
- Feed familia (`familia-feed.dc.html`).
- Interacciones reales (likes, comentarios, editar).
- Responsive más allá del toggle: cuando la sidebar se oculta, el main usa todo el ancho; no se diseña layout móvil nuevo.

## Data model

Todos los identificadores internos (variables, métodos, tipos, keys) en **inglés**; los únicos strings en español son el copy visible al usuario (badges "LOGRO", audiences, cuerpo de posts), obligado por el mockup.

`lib/posts.ts` (nuevo):

```ts
export type PostKind = "milestone" | "activity" | "announcement";

export interface PostAuthor {
  name: string;
  avatarBg: string;
  avatarColor: string;
  initial?: string;        // "M" for Mateo
  icon?: "megaphone";      // announcement avatar
}

export interface Post {
  id: string;
  author: PostAuthor;
  kind: PostKind;
  time: string;            // "14:20"
  audience: string;        // "Para: familia de Mateo" | "Para: toda la sala"
  body: string;
  photo?: { label: string }; // "Foto · pintando con témperas"
  likeCount: number;
  commentCount: number;
}

export const POST_KIND_STYLES: Record<PostKind, {
  label: string; badgeBg: string; dotColor: string; textColor: string;
}> = {
  milestone:   { label: "LOGRO",     badgeBg: "#CFEBD8", dotColor: "#3E9B6C", textColor: "#3E9B6C" },
  activity:    { label: "ACTIVIDAD", badgeBg: "#C7E7F1", dotColor: "#2E89A6", textColor: "#2E89A6" },
  announcement:{ label: "ANUNCIO",   badgeBg: "#CCD8F4", dotColor: "#4E72C8", textColor: "#4E72C8" },
};

export const feedPosts: Post[] = [ /* the 3 mockup posts */ ];
```

## Implementation plan

1. **Fonts + tokens:** `app/layout.tsx` (Fredoka/Nunito con `next/font/google`, `lang="es"`, metadata "OpenDayCare", eliminar Geist) y `app/globals.css` (`@theme` con tokens: `--color-cream #F6ECDF`, `--color-surface #FFFDF9`, `--color-line #ECE0D0`, `--color-ink #3F362E`, `--color-muted #A89A8B`, `--color-subtle #94887B`, gradiente primario `#F4977E→#EE8164`, `--color-accent #C5503A`, breakpoint custom `--breakpoint-sidebar: 900px`; reset de body). → build pasa.
2. **`lib/posts.ts`:** tipos + `POST_KIND_STYLES` + `feedPosts` con los 3 posts (contenido, colores de avatar/badge y contadores del mockup).
3. **`components/PostCard.tsx`:** tarjeta exacta (avatar, nombre Fredoka, hora, badge con dot, "Para:…", cuerpo, placeholder de foto, footer con contadores y "Editar" `href="#"`).
4. **`components/Sidebar.tsx`:** sidebar completa del mockup con `href="#"`, estado de abierto/cerrado y overlay; oculta bajo 900px.
5. **`app/page.tsx`:** layout flex (Sidebar + main 760px con scroll propio), header con fecha dinámica es-AR, composer, divider "PUBLICADO HOY", `feedPosts.map(PostCard)` y botón hamburguesa visible bajo 900px.
6. **Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run build`; comparación visual desktop con `references/screenshots/feed.png` y chequeo del toggle en viewport móvil.

## Acceptance criteria

- [x] `npx tsc --noEmit` sin errores.
- [x] `npm run lint` sin errores en `app/` y `components/` (se ignoran los de `references/`).
- [x] `npm run build` compila.
- [x] `/` muestra sidebar 248px sticky + main centrado (760px), fondo `#F6ECDF`, tarjetas `#FFFDF9` borde `#ECE0D0` radio 20px.
- [x] Sidebar con logo, botón gradiente "Nueva publicación", nav con Feed activo (`#FBE3D8`) y footer de Caro con logout.
- [x] Header: "GUARDERÍA · SALA SOLES", "Buenas, Caro", "12 niños · {fecha de hoy es-AR}".
- [x] Los 3 posts con badges LOGRO/ACTIVIDAD/ANUNCIO en sus colores, audiences, textos, contadores (3/1, 5/2, 8/0) y placeholder "Foto · pintando con témperas".
- [x] Bajo 900px aparece hamburguesa que abre/cierra la sidebar; sobre 900px no hay hamburguesa.
- [x] No hay string literals en español en el código: todos los identificadores internos y literales están en inglés; el español queda solo en el copy de UI (badges, audiences, cuerpos, textos del mockup).
- [x] Todos los enlaces sin destino usan `href="#"` y no rompen.
- [x] Layout coincide visualmente con `references/screenshots/feed.png`.

## Decisions taken and discarded

- **Tomada:** fecha dinámica solo en header (es-AR), resto del texto idéntico — el estilo debe coincidir píxel a píxel.
- **Tomada:** módulo de datos tipado + `PostCard` reutilizable — las specs futuras (crear-publicacion, detalle) lo reutilizan.
- **Tomada:** enlaces muertos `href="#"` en vez de rutas placeholder — fuera de alcance.
- **Tomada:** `next/font/google` (Fredoka+Nunito) en lugar de Geist — idéntico al mockup e idiomático en Next.
- **Tomada:** **Clean code + inglés interno** — todos los identificadores (variables, tipos, métodos, nombres de archivos, keys) en inglés; los únicos strings en español son el copy de UI exigido por el mockup. Ej.: `PostKind = "milestone" | "activity" | "announcement"`.
- **Tomada:** hamburguesa bajo 900px — sin mockup móvil, es la opción mínima no destructiva. **Descartadas:** ocultar sin toggle, convertir a topbar.
- **Descartada:** cualquier persistencia, backend o autenticación.

## Risks

- Sin mockup móvil, el comportamiento mobile es decisión propia; puede requerir ajuste cuando exista un mockup móvil del feed staff.
- La fecha dinámica se calcula en el Server Component (hora del servidor); si el deploy corre en otra zona horaria diferirá de la local. Aceptable sin backend.

## Clean code practices

- Se debe implementar las reglas de código limpio tanto como sean posible. Por ejemplo los nombre de variables, funciones, clases deben estar en ingles.