# SPEC 02 — Pantallas Niños y Perfil de niño

> **State:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-08-10
> **Objective:** Implementar las pantallas de listado de niños (`/kids`) y perfil de niño (`/kids/[id]`) a partir de los mockups `ninos.dc.html` y `perfil-nino.dc.html`, con datos mock estáticos, componente reutilizable `ChildCard`, y navegación funcional entre ambas páginas y de vuelta al home.

## Scope

**In:**

- Layout desktop idéntico al mockup: sidebar sticky (reutilizada de SPEC 01) + main centrado con scroll propio.
- `lib/children.ts`: tipos `Child`, `ChildBadge` y array `children` con los 8 niños del mockup (nombre, edad, inicial, avatarBg, avatarColor, badges, padres vinculados).
- `components/ChildCard.tsx`: tarjeta reutilizable con avatar, nombre Fredoka, edad, cantidad de padres, y badge condicional (alergia o VINCULAR).
- `app/kids/page.tsx`: página de listado con header "GESTIÓN / Niños", botón "Agregar niño" (`href="#"`), barra de búsqueda (visual, sin filtro funcional), sección "SALA SOLES · 8 niños", grid 2 columnas de `ChildCard` enlazadas a `/kids/[id]`.
- `app/kids/[id]/page.tsx`: página de perfil con botón "Volver a Niños" (`/kids`), avatar grande, nombre, edad, sala, botón "Editar" (`href="#"`), tarjeta de alergias y notas, tabla de datos (fecha de nacimiento, sala, ingreso), sección "Padres vinculados" con estado ACTIVA/PENDIENTE, enlace "Vincular otro padre" (`href="#"`), botón "Resumen del día" (`href="#"`).
- `components/Sidebar.tsx`: actualizar hrefs de Niños para apuntar a `/kids` (las demás nav siguen con `href="#"`).
- Navegación funcional: `/` → `/kids` → `/kids/[id]` → `/kids`.
- Design tokens y tipografías reutilizados de SPEC 01.

**Out of scope (for future specs):**

- Búsqueda funcional de niños.
- Pantalla "Agregar niño" (`agregar-nino.dc.html`).
- Pantalla "Resumen del día" (`resumen-dia.dc.html`).
- Pantalla "Vincular padre" (`vincular-padre.dc.html`).
- Pantalla "Editar niño".
- Autenticación, persistencia, API o base de datos.
- Pantallas Avisos, Mi cuenta, Crear publicación.
- Feed familia (`familia-feed.dc.html`).

## Data model

`lib/children.ts` (nuevo):

```ts
export type ChildBadge = {
  label: string;       // "MANÍ", "LACTOSA", "VINCULAR"
  bg: string;          // background color
  color: string;       // text color
};

export type LinkedParent = {
  name: string;
  role: string;        // "Mamá", "Papá"
  status: "active" | "pending";
  avatarBg: string;
  avatarColor: string;
  initial: string;
};

export interface Child {
  id: string;           // "mateo-fernandez"
  name: string;         // "Mateo Fernández"
  age: string;          // "3 años"
  room: string;         // "Soles"
  initial: string;      // "M"
  avatarBg: string;     // "#A9D9E8"
  avatarColor: string;  // "#1F7A93"
  badge?: ChildBadge;
  parents: LinkedParent[];
  birthDate: string;    // "12 mar 2022"
  joinDate: string;     // "feb 2025"
  allergyNotes?: string; // "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila."
}

export const children: Child[] = [ /* los 8 niños del mockup */ ];
```

## Implementation plan

1. **`lib/children.ts`:** crear tipos `ChildBadge`, `LinkedParent`, `Child` y exportar `children` con los 8 niños del mockup (nombres, edades, avatares, badges, padres, fechas, notas de alergia). → `npx tsc --noEmit` sin errores en el archivo.
2. **`components/ChildCard.tsx`:** componente que recibe un `Child` y renderiza la tarjeta del mockup: avatar circular con inicial, nombre Fredoka, texto de edad y padres, badge condicional (si tiene `badge`, lo muestra con sus colores; si no tiene badge y tiene 0 padres, muestra chevron). Envolto en `<Link href={`/kids/${child.id}`}>`. → build pasa.
3. **`app/kids/page.tsx`:** página server component con layout flex (Sidebar + main), header "GESTIÓN" / "Niños", botón "Agregar niño" (`href="#"`), barra de búsqueda (input visual, sin lógica), divider "SALA SOLES · 8 niños", grid 2 columnas con `children.map(ChildCard)`. → `/kids` muestra las 8 tarjetas.
4. **`app/kids/[id]/page.tsx`:** página con parámetro `id`, busca el `Child` en el array, renderiza: "Volver a Niños" (`/kids`), avatar 84px, nombre, edad, sala, botón "Editar" (`href="#"`), tarjeta de alerta (alergias), tabla de datos, sección padres vinculados con badges ACTIVA/PENDIENTE, "Vincular otro padre" (`href="#"`), "Resumen del día" (`href="#"`). Si `id` no existe, mostrar 404. → `/kids/mateo-fernandez` muestra el perfil completo.
5. **`components/Sidebar.tsx`:** cambiar el href de Niños de `href="#"` a `href="/kids"`. Los demás hrefs siguen con `#`. → navegación `/` → `/kids` funciona.
6. **Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run build`; comparación visual con `references/screenshots/kids.png` y `references/screenshots/perfil-nino.png`; navegación `/` → sidebar Niños → `/kids` → click Mateo → `/kids/mateo-fernandez` → "Volver a Niños" → `/kids`.

## Acceptance criteria

- [x] `npx tsc --noEmit` sin errores.
- [x] `npm run lint` sin errores en `app/` y `components/` (se ignoran los de `references/`).
- [x] `npm run build` compila.
- [x] `/kids` muestra header "GESTIÓN / Niños", barra de búsqueda, divider "SALA SOLES · 8 niños", grid 2 columnas con las 8 tarjetas.
- [x] Cada `ChildCard` muestra avatar circular con inicial, nombre Fredoka, edad y padres vinculados.
- [x] Tarjetas con badge (MANÍ, LACTOSA) muestran el badge con color de fondo y texto del mockup.
- [x] Tarjeta de Valentina (sin padres) muestra badge VINCULAR en rosa.
- [x] Tarjetas sin badge y con al menos 1 padre muestran chevron a la derecha.
- [x] Click en cualquier tarjeta navega a `/kids/{id}`.
- [x] `/kids/mateo-fernandez` muestra perfil completo: avatar 84px, nombre, edad, sala, notas de alergia, fecha de nacimiento, sala, ingreso, 2 padres (Lucía ACTIVA, Diego PENDIENTE).
- [x] "Volver a Niños" en el perfil navega de regreso a `/kids`.
- [x] "Resumen del día", "Editar", "Vincular otro padre" y "Agregar niño" usan `href="#"`.
- [x] Sidebar muestra enlace Niños apuntando a `/kids`; otros enlaces siguen con `href="#"`.
- [x] Layout coincide visualmente con los mockups de `references/screenshots/`.
- [x] Todos los identificadores internos en inglés; español solo en copy de UI.

## Decisions taken and discarded

- **Tomada:** datos mock estáticos en `lib/children.ts` — misma estrategia que `lib/posts.ts` de SPEC 01, sin backend.
- **Tomada:** badge condicional en el tipo `Child` — opcional, con `label`, `bg`, `color` para cubrir alergias (MANÍ, LACTOSA) y VINCULAR.
- **Tomada:** solo navegación Niños ↔ Perfil funcional; el resto de hrefs son `#` — el usuario decidió limitar el alcance a estas dos pantallas.
- **Tomada:** "Resumen del día" y "Vincular otro padre" como dead links — el usuario pidió incluirlos visualmente.
- **Tomada:** reutilizar `Sidebar.tsx` de SPEC 01, solo actualizando el href de Niños.
- **Tomada:** `app/kids/[id]/page.tsx` con routing dinámico de Next.js — idiomático y sin librerías adicionales.
- **Descartada:** búsqueda funcional — input visual por ahora, se implementa en otro spec si se necesita.
- **Descartada:** pantalla "Agregar niño" — fuera de alcance, viene en spec separado.
- **Descartada:** cualquier persistencia, backend o autenticación.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| El sidebar reutilizado de SPEC 01 podría necesitar ajustes para el href de Niños | Solo se cambia un `href="#"` a `href="/kids"` en el paso 5 |
| El routing dinámico `/kids/[id]` requiere que los IDs sean slugs válidos | Los IDs se generan del nombre en formato kebab-case (`mateo-fernandez`) |
| El mockup de perfil muestra datos específicos (fechas, nombres de padres) que deben coincidir exactamente | Se copian los valores del mockup directamente al array `children` |

## What is **not** in this spec

- Pantalla "Agregar niño" (`agregar-nino.dc.html`).
- Pantalla "Resumen del día" (`resumen-dia.dc.html`).
- Pantalla "Vincular padre" (`vincular-padre.dc.html`).
- Pantalla "Editar niño".
- Búsqueda funcional de niños.
- Autenticación, persistencia, API o base de datos.
- Pantallas Avisos, Mi cuenta, Crear publicación, Login.
- Feed familia.
- Responsive móvil más allá de lo que ya existe en SPEC 01.

Cada uno de estos, si se implementa, va en su propio spec.
