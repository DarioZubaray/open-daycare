# SPEC 04 — Modal Agregar Niño

> **Status:** Implementado
> **Depends on:** SPEC 02
> **Date:** 2026-08-11
> **Objective:** Implementar el modal de agregar niño en `/kids`, con formulario de validación y máscara de fecha, que se abre al presionar el botón "Agregar niño" y agrega el niño a la grilla en memoria.

## Scope

**In:**

- `components/AddChildModal.tsx`: modal client component con formulario que coincide visualmente con `agregar-nino.dc.html`. Header fijo con "Cancelar" (cierra modal), título "Agregar niño", "Guardar" (valida y envía). Campos: nombre completo (obligatorio), fecha de nacimiento con máscara `dd/mm/aaaa` (obligatorio), selector de sala hardcodeado con 3 opciones (Soles, Lunas, Estrellas), alergias como input de tags separados por comas (opcional), notas médicas textarea (opcional).
- Validaciones on submit: nombre completo no vacío, fecha de nacimiento con formato válido `dd/mm/aaaa` y fecha real. Mensajes de error inline debajo de cada campo.
- Máscara de fecha: autoinserta `/` mientras el usuario escribe (ej: "12032022" → "12/03/2022"). Placeholder `dd/mm/aaaa`.
- Input de alergias: al presionar coma, la palabra ingresada se convierte en tag visual con botón de eliminar. Tags se almacenan como `string[]`.
- Al guardar: `console.log` con todos los datos del formulario para debug.
- Al guardar con validación OK: el niño nuevo se agrega al array `children` en memoria y se visible en la grilla. El modal se cierra.
- Al cancelar: el modal se cierra sin guardar.
- `app/kids/page.tsx`: cambiar a client component, agregar estado para abrir/cerrar modal, agregar estado para el array de niños (inicializado con `children` de `lib/children.ts`), wire del botón "Agregar niño" para abrir el modal.
- `lib/children.ts`: agregar campo `allergies: string[]` al tipo `Child`. Los 8 niños existentes reciben `allergies: []` por defecto.

**Out of scope (for future specs):**

- Persistencia real, backend, API, base de datos.
- Edición de niño existente.
- Eliminación de niño.
- Búsqueda funcional de niños.
- Selección de avatar o generación automática de avatar.
- Validación de fecha futura o fecha demasiado antigua.
- Responsive móvil del modal.

## Data model

`lib/children.ts` (modificación del tipo `Child`):

```ts
export interface Child {
  id: string;
  name: string;
  age: string;
  room: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  badge?: ChildBadge;
  parents: LinkedParent[];
  birthDate: string;
  joinDate: string;
  allergyNotes?: string;
  allergies: string[];  // NUEVO: tags de alergias ["Maní", "Lactosa"]
}
```

Los 8 niños existentes se actualizan con `allergies: []`.

Estado local del formulario en `AddChildModal.tsx`:

```ts
interface AddChildFormState {
  fullName: string;
  birthDate: string;       // "dd/mm/aaaa" con máscara
  room: string;            // "Soles" | "Lunas" | "Estrellas"
  allergies: string[];     // tags acumulados
  allergyInput: string;    // texto temporal del input de alergias
  medicalNotes: string;
  errors: {
    fullName?: string;
    birthDate?: string;
  };
}
```

## Implementation plan

1. **`lib/children.ts`:** agregar `allergies: string[]` al tipo `Child`. Actualizar los 8 niños existentes con `allergies: []`. → `npx tsc --noEmit` sin errores en el archivo.

2. **`components/AddChildModal.tsx`:** crear client component con el modal. Estructura: overlay oscuro (`bg-black/40`) con card centrada (`max-w-[520px]`, fondo `#FBF4EC`, border-radius 24px, sombra). Header flex con "Cancelar" (`text-[#94887B]`, `font-bold`), título "Agregar niño" (Fredoka 18px), "Guardar" (`text-[#D9583C]`, `font-extrabold`). Body con campos del mockup: label uppercase 12px `#94887B`, inputs con `border-[#EADFD0]`, `rounded-[14px]`, `bg-white`, padding 13px 16px. → build pasa.

3. **`components/AddChildModal.tsx` — lógica de máscara de fecha:** handler `handleDateChange` que filtra solo dígitos, limita a 8 caracteres, autoinserta `/` en posiciones 2 y 4. El estado `birthDate` almacena el valor con formato `dd/mm/aaaa`. → el input muestra la máscara mientras se escribe.

4. **`components/AddChildModal.tsx` — lógica de tags de alergias:** handler `handleAllergyKeyDown` que al presionar coma (`,`) toma el texto actual del input, lo agrega al array `allergies` si no está vacío, y limpia el input. Renderizar tags como pills con texto + botón `×` para eliminar. → el input de alergias funciona como tag editor.

5. **`components/AddChildModal.tsx` — validación y submit:** handler `handleSubmit` que valida: `fullName.trim()` no vacío, `birthDate` matchea `/^\d{2}\/\d{2}\/\d{4}$/` y la fecha es real (día 1-31, mes 1-12, año razonable). Si hay errores, los muestra inline. Si pasa, ejecuta `console.log("Nuevo niño:", { fullName, birthDate, room, allergies, medicalNotes })`, genera el objeto `Child` con id kebab-case, initial, age calculada, avatar por defecto, y lo agrega al array. Cierra el modal. → al guardar se loguea en consola y el niño aparece en la grilla.

6. **`app/kids/page.tsx`:** agregar `'use client'`, importar `AddChildModal`, agregar state `isModalOpen` (boolean) y `kidsList` (array de `Child`, inicializado con `children`). El botón "Agregar niño" cambia `href="#"` a `onClick={() => setIsModalOpen(true)}`. Renderizar `<AddChildModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddChild={handleAddChild} />`. `handleAddChild` agrega el niño a `kidsList`. → al hacer click en "Agregar niño" se abre el modal.

7. **Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run build`; comparación visual con `references/screenshots/agregar-nino.png` (si existe) y mockup HTML; flujo: `/kids` → click "Agregar niño" → modal se abre → intentar guardar vacío → errores aparecen → completar nombre + fecha válida + sala → guardar → console.log visible → niño aparece en grilla → modal cerrado → cancelar → modal se cierra.

## Acceptance criteria

- [x] `npx tsc --noEmit` sin errores.
- [x] `npm run lint` sin errores en `app/` y `components/` (se ignoran los de `references/`).
- [x] `npm run build` compila.
- [x] Click en "Agregar niño" abre el modal.
- [x] Modal muestra header con "Cancelar", "Agregar niño", "Guardar" idéntico al mockup.
- [x] Campo nombre completo: label "NOMBRE COMPLETO", placeholder "Ej. Martina López", obligatorio.
- [x] Campo fecha de nacimiento: label "FECHA DE NACIMIENTO", placeholder "dd/mm/aaaa", máscara autoinserta `/`.
- [x] Campo sala: label "SALA", dropdown con opciones Soles, Lunas, Estrellas, valor por defecto "Soles".
- [x] Campo alergias: label "ALERGIAS (ETIQUETAS)", placeholder "Ej. Maní, Lactosa", al presionar coma crea tag visual.
- [x] Tags de alergias se muestran como pills con botón `×` para eliminar.
- [x] Campo notas médicas: label "NOTAS MÉDICAS", placeholder "Indicaciones, medicación, contactos…", textarea.
- [x] Al guardar con nombre vacío: se muestra error inline "El nombre es obligatorio".
- [x] Al guardar con fecha inválida: se muestra error inline "Fecha inválida".
- [x] Al guardar con datos válidos: `console.log` con los datos del formulario.
- [x] Al guardar con datos válidos: el niño nuevo aparece en la grilla con nombre, edad calculada, sala, y alergias.
- [x] Al guardar con datos válidos: el modal se cierra.
- [x] Al cancelar: el modal se cierra sin guardar.
- [x] Estilos del modal coinciden visualmente con `agregar-nino.dc.html` (fondo `#FBF4EC`, bordes `#EADFD0`, radio 14px, sombra, tipografías Fredoka/Nunito).
- [x] Todos los identificadores internos en inglés; español solo en copy de UI.

## Decisions taken and discarded

- **Tomada:** client component para el modal (`AddChildModal.tsx`) — necesita estado local para formularios, máscara de fecha, y tags.
- **Tomada:** `app/kids/page.tsx` como client component — necesita gestionar estado del modal y el array de niños; sigue el patrón de SPEC 03 donde las páginas con interactividad son client components.
- **Tomada:** validaciones on submit (no on blur) — el usuario pidió validaciones "al guardar". Se puede agregar on blur después si se necesita.
- **Tomada:** sala hardcodeada con 3 opciones (Soles, Lunas, Estrellas) — el usuario confirmó que son las salas del mockup y que eventualmente vienen de BD.
- **Tomada:** máscara de fecha con auto-inserción de `/` — el usuario confirmó que debe autoinsertar las barras para facilitar la escritura.
- **Tomada:** tags de alergias con coma como separador — el usuario confirmó que al presionar coma se engloba la palabra recién ingresada como tag.
- **Tomada:** `console.log` al guardar — el usuario lo pidió para facilitar el debug.
- **Tomada:** niño nuevo se agrega al array en memoria y se ve en la grilla — el usuario confirmó que la salida es visible en memoria.
- **Descartada:** persistencia (localStorage, cookies) — sin backend no tiene sentido persistir; el usuario no la pidió.
- **Descartada:** generación automática de avatar — fuera de alcance; se usa un avatar por defecto.
- **Descartada:** on blur para validaciones — el usuario pidió solo on submit.
- **Descartada:** edición o eliminación de niño — fuera de alcance, spec separado si se necesita.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| La máscara de fecha puede causar comportamiento inesperado con pegado de texto | Handler filtra solo dígitos y reemplaza el valor completo; probar con paste |
| El input de tags puede no funcionar bien en móvil (teclado sin tecla coma) | Por ahora solo desktop; mobile es out of scope |
| Calcular la edad desde la fecha de nacimiento puede dar resultados incorrectos en meses | Usar diferencia de años simple; el mockup muestra "3 años" sin precisión de meses |

## What is **not** in this spec

- Persistencia real, backend, API, base de datos.
- Edición de niño existente.
- Eliminación de niño.
- Búsqueda funcional de niños.
- Selección o generación de avatar.
- Responsive móvil del modal.
- Validación de fecha futura o fecha demasiado antigua.

Cada uno de estos, si se implementa, va en su propio spec.
