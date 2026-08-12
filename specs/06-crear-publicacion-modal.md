# SPEC 06 — Modal Crear Publicación

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-08-12
> **Objective:** Implementar el modal de "Nueva publicación" que se abre desde el botón "+ Nueva publicación" del Sidebar, con formulario de selección de niños, tipo, descripción y carga de fotos, que hace `console.log` con los datos al publicar.

## Scope

**In:**

- `components/CreatePostModal.tsx`: modal client component con formulario que coincide visualmente con `crear-publicacion.dc.html`. Header fijo con "Cancelar" (cierra modal), título "Nueva publicación", "Publicar" (valida y envía). Botón "Publicar" deshabilitado (`opacity-50`, `cursor-not-allowed`) hasta que se cumplan las condiciones mínimas.
- Campo "PARA": chips de selección múltiple con los niños de `lib/children.ts`. Cada chip muestra avatar (initial en círculo de color) + nombre. Al seleccionar un niño, el chip cambia a fondo `#3F362E`, borde `#3F362E`, texto blanco. Chips no seleccionados: fondo `#FFFDF9`, borde `#ECE0D0`, texto `#6E6359`. Botón "Toda la sala" al final: al hacer click selecciona todos y deselecciona individuales; al seleccionar un individual, se deselecciona "Toda la sala". Mínimo un niño seleccionado para habilitar "Publicar".
- Campo "TIPO": chips de selección múltiple con tipos hardcodeados en memoria: Comida (`#9A7B1E`/`#fff`), Siesta (`#E7DCF6`/`#7B5FC0`), Actividad (`#2E89A6`/`#fff`), Logro (`#CFEBD8`/`#3E9B6C`), Ánimo (`#F9D2DE`/`#C56486`), Foto (`#FBD8CC`/`#D9684A`), Anuncio (`#CCD8F4`/`#4E72C8`). Mínimo un tipo seleccionado para habilitar "Publicar".
- Campo "DESCRIPCIÓN": textarea con placeholder "Contá cómo le fue hoy…", fondo `#fff`, borde `#EADFD0`, border-radius 14px. Obligatorio solo si no se sube ninguna foto.
- Campo "FOTOS": área de carga de imágenes. Soporta drag & drop y navegación de archivos (input type file, accept="image/*"). Muestra preview de fotos subidas como thumbnails (96x96px, border-radius 14px). Botón "Agregar" con icono `+` y texto. No hay límite de fotos. Solo se permiten archivos de tipo imagen; si se sube un archivo no imagen, se muestra mensaje de error visible debajo del área.
- Al publicar con validación OK: `console.log` con los datos, se cierra el modal y se resetea el estado.
- Al cancelar (click en "Cancelar" o click en overlay): el modal se cierra y se resetea el estado.
- `components/Sidebar.tsx`: el botón "+ Nueva publicación" se convierte en un botón que dispara un callback `onNewPost` pasado como prop.
- `app/page.tsx`: agrega estado para el modal y pasa `onNewPost` al Sidebar. Renderiza `<CreatePostModal />`.

**Out of scope (for future specs):**

- Publicación real en el feed (requiere integración con API).
- Persistencia de fotos.
- Edición o eliminación de publicación.
- Selección de sala.
- Tipos dinámicos desde base de datos.
- Niños dinámicos desde base de datos.
- Responsive móvil del modal.

## Data model

No se introducen nuevas estructuras de datos persistentes.

Tipos hardcodeados en memoria:

```ts
const POST_TYPES = [
  { id: "comida", label: "Comida", bg: "#9A7B1E", color: "#fff" },
  { id: "siesta", label: "Siesta", bg: "#E7DCF6", color: "#7B5FC0" },
  { id: "actividad", label: "Actividad", bg: "#2E89A6", color: "#fff" },
  { id: "logro", label: "Logro", bg: "#CFEBD8", color: "#3E9B6C" },
  { id: "animo", label: "Ánimo", bg: "#F9D2DE", color: "#C56486" },
  { id: "foto", label: "Foto", bg: "#FBD8CC", color: "#D9684A" },
  { id: "anuncio", label: "Anuncio", bg: "#CCD8F4", color: "#4E72C8" },
];
```

Estado local:

```ts
interface CreatePostFormState {
  selectedChildren: string[];  // ids, o ["all"]
  selectedTypes: string[];     // ids de tipos
  description: string;
  photos: File[];
  photoError: string | null;
}
```

## Implementation plan

1. **`components/CreatePostModal.tsx`:** crear client component con el modal. Estructura: overlay oscuro (`bg-black/40`) con card centrada (`max-w-[580px]`, fondo `#FBF4EC`, border-radius 24px, sombra). Header flex con "Cancelar", título "Nueva publicación", "Publicar". → build pasa.

2. **Sección PARA:** importar `children` de `lib/children.ts`. Renderizar chips con avatar + nombre. Lógica de selección con `selectedChildren`. Botón "Toda la sala". → selección funciona.

3. **Sección TIPO:** renderizar chips con colores de `POST_TYPES`. `selectedTypes` como array. → selección funciona.

4. **Sección DESCRIPCIÓN:** textarea con estilos del mockup. → renderiza correctamente.

5. **Sección FOTOS:** área con drag & drop + input file. Thumbnails. Botón "Agregar". Validación de tipo archivo. → carga funciona.

6. **Validación y botón "Publicar":** deshabilitado si faltan condiciones. `console.log` al publicar. Cierre y reset. → flujo completo funciona.

7. **`components/Sidebar.tsx`:** agregar prop `onNewPost?: () => void`. Cambiar `<a href="#">` a `<button onClick={onNewPost}>`. → botón dispara callback.

8. **`app/page.tsx`:** agregar estado `isCreatePostOpen`. Pasar `onNewPost` al Sidebar. Renderizar `<CreatePostModal />`. → modal se abre desde feed.

9. **Verificación:** `tsc`, `lint`, `build`; comparación visual con mockup; flujo completo.

## Acceptance criteria

- [x] `npx tsc --noEmit` sin errores.
- [x] `npm run lint` sin errores en `app/` y `components/`.
- [x] `npm run build` compila.
- [x] Click en "+ Nueva publicación" abre el modal.
- [x] Modal coincide visualmente con `crear-publicacion.dc.html`.
- [x] Chips de niños con avatar + nombre, selección múltiple funciona.
- [x] "Toda la sala" selecciona todos, individual deselecciona "Toda la sala".
- [x] Chips de tipos con colores fijos, selección múltiple funciona.
- [x] Botón "Publicar" deshabilitado cuando faltan condiciones.
- [x] Botón "Publicar" habilitado con 1 niño + 1 tipo + (descripción o foto).
- [x] Drag & drop de imágenes funciona.
- [x] Archivo no imagen muestra error visible.
- [x] Thumbnails de fotos subidas visibles.
- [x] `console.log` al publicar con datos válidos.
- [x] Modal se cierra y resetea al publicar o cancelar.

## Decisions taken and discarded

- **Tomada:** client component — necesita estado local para formulario y fotos.
- **Tomada:** host en `app/page.tsx` — sigue el patrón de otros specs.
- **Tomada:** tipos hardcodeados — el usuario confirmó.
- **Tomada:** botón deshabilitado en lugar de errores on submit — el usuario pidió.
- **Tomada:** descripción obligatoria solo sin foto — el usuario lo especificó.
- **Tomada:** sin límite de fotos — el usuario confirmó.
- **Descartada:** publicación real en el feed — requiere API.
- **Descartada:** persistencia de fotos — sin backend.
- **Descartada:** responsive móvil — fuera de alcance.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Drag & drop puede no funcionar en algunos navegadores | Input file como fallback siempre visible |
| Archivos grandes pueden causar lentitud en preview | Usar `URL.createObjectURL` para preview local |

## What is **not** in this spec

- Publicación real en el feed.
- Persistencia de fotos.
- Edición o eliminación de publicación.
- Selección de sala.
- Tipos y niños dinámicos desde BD.
- Responsive móvil.
