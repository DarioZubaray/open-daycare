# SPEC 05 — Modal Vincular Padre

> **Status:** Aprobado
> **Depends on:** SPEC 02, SPEC 04
> **Date:** 2026-08-11
> **Objective:** Implementar el modal de "Vincular padre" en `/kids/[id]`, con formulario de validación (nombre, email, parentesco) y código de invitación auto-generado, que se abre al presionar "Vincular otro padre" y agrega el padre al array en memoria con estado pending.

## Scope

**In:**

- `components/LinkParentModal.tsx`: modal client component con formulario que coincide visualmente con `vincular-padre.dc.html`. Header fijo con título "Vincular padre", subtítulo "a {child.name}", y botón X (cierra modal). States: pre-submit (formulario visible) y post-submit (formulario deshabilitado, código + info box visibles).
- Campos del formulario: nombre del padre/madre (label "NOMBRE DEL PADRE/MADRE", placeholder "Ej. Diego Fernández", obligatorio), email (label "EMAIL", placeholder "correo@ejemplo.com", obligatorio, type email), selector de parentesco con 3 botones de selección única (Mamá, Papá, Tutor/a — valor por defecto Mamá).
- Código de invitación: se genera aleatoriamente (5 caracteres alfanuméricos, ej: "7K4P9") al hacer submit. Se muestra en sección amarilla con fondo `#FBF1D6`, borde dashed `#E6D08A`, texto Fredoka 34px letter-spacing 7px, y "Vence en 7 días" debajo. Solo visible después del submit.
- Info box azul (`#E3ECFB`): "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {child.name}." Solo visible después del submit.
- Botón "Enviar invitación" con gradiente `#F4977E→#EE8164`, icono de avión, sombra. Deshabilitado post-submit.
- Validaciones on submit: nombre no vacío (trim), email con formato válido (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). Mensajes de error inline debajo de cada campo.
- Al enviar con validación OK: se genera el código, se muestra info box + código, formulario se deshabilita, el padre se agrega al array `parents` del niño con status `"pending"`. El modal permanece abierto hasta que el usuario cierre con la X.
- Al cancelar (click en X o click en overlay): el modal se cierra y se resetea el estado del formulario.
- `app/kids/[id]/page.tsx`: convertir a client component, agregar estado para modal (abierto/cerrado) y para el array `parents` del niño (inicializado con los padres existentes de `children`). Reemplazar el dead link "Vincular otro padre" por un botón que abre el modal. Wire del `onAddParent` para agregar el nuevo padre al array y actualizar la UI.
- `lib/children.ts`: agregar campo `invitationCode?: string` al tipo `LinkedParent`. Los padres existentes no lo tienen (opcional).

**Out of scope (for future specs):**

- Envío real de correo con código de invitación.
- Activación de cuenta del padre (pantalla del mockup `activar-cuenta.dc.html` ya implementada en SPEC 03).
- Validación de código de invitación al activar cuenta.
- Eliminación o edición de padre vinculado.
- Límite de padres por niño (la regla de negocio es no tener límite).
- Persistencia real, backend, API, base de datos.
- Responsive móvil del modal.

## Data model

`lib/children.ts` (modificación del tipo `LinkedParent`):

```ts
export type LinkedParent = {
  name: string;
  role: string;           // "mother" | "father" | "guardian"
  status: "active" | "pending";
  avatarBg: string;
  avatarColor: string;
  initial: string;
  invitationCode?: string; // NUEVO: "7K4P9" — solo para padres pending
};
```

Los padres existentes no reciben `invitationCode` (queda `undefined`). El campo es opcional.

Estado local del formulario en `LinkParentModal.tsx`:

```ts
interface LinkParentFormState {
  parentName: string;
  email: string;
  role: "mother" | "father" | "guardian";
  submitted: boolean;
  invitationCode: string;
  errors: {
    parentName?: string;
    email?: string;
  };
}
```

## Implementation plan

1. **`lib/children.ts`:** agregar `invitationCode?: string` al tipo `LinkedParent`. No se modifica ningún padre existente (el campo es opcional). → `npx tsc --noEmit` sin errores en el archivo.

2. **`components/LinkParentModal.tsx`:** crear client component con el modal. Estructura: overlay oscuro (`bg-black/40`) con card centrada (`max-w-[480px]`, fondo `#FBF4EC`, border-radius 24px, sombra). Header flex con "Vincular padre" (Fredoka 18px font-semibold), subtítulo "a {child.name}" (13px `#A89A8B`), botón X a la derecha (34px round, fondo `#F0E6D8`, icono cruz). Body padding 22px 26px. → build pasa.

3. **`components/LinkParentModal.tsx` — sección info box + formulario (pre-submit):** Info box azul `#E3ECFB` con icono de info y texto "Le enviaremos un correo..." — oculta por defecto (se muestra post-submit). Campos del formulario: labels uppercase 12px `#94887B` font-extrabold letter-spacing 0.7px, inputs `border-[#EADFD0] rounded-[14px] bg-white px-[16px] py-[13px]`. Botones de parentesco: 3 botones flex, radio 999px, seleccionado = fondo `#CCD8F4` borde `#9FB8EC` texto `#4E72C8`, no seleccionado = fondo `#FFFDF9` borde `#ECE0D0` texto `#6E6359`. → formulario rendering correctly.

4. **`components/LinkParentModal.tsx` — sección código de invitación (post-submit):** Bloque con fondo `#FBF1D6`, borde dashed `#E6D08A`, radio 16px, padding 18px, centrado. Label "CÓDIGO DE INVITACIÓN" 12px `#A88526`, código en Fredoka 600 34px letter-spacing 7px `#8A7234`, texto "Vence en 7 días" 13px `#A88526`. Oculto por defecto, se muestra solo cuando `submitted === true`. → el código aparece después del submit.

5. **`components/LinkParentModal.tsx` — lógica de parentesco:** handler `handleRoleChange(role)` que actualiza el estado `role`. Renderizar los 3 botones con estilo condicional según `role` activo. → selección única funciona.

6. **`components/LinkParentModal.tsx` — validación y submit:** handler `handleSubmit` que valida: `parentName.trim()` no vacío, `email` matchea regex. Si hay errores, los muestra inline. Si pasa: genera código aleatorio (5 chars alfanuméricos de `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`), guarda en estado `invitationCode`, marca `submitted = true`, ejecuta `onAddParent({ name, role, status: "pending", invitationCode, avatarBg: "#D8CBBA", avatarColor: "#8A7C6D", initial: name.charAt(0).toUpperCase() })`. → al guardar se genera el código y el padre se agrega al array.

7. **`components/LinkParentModal.tsx` — botón "Enviar invitación" y cierre:** Botón con gradiente `linear-gradient(180deg, #F4977E, #EE8164)`, sombra, texto blanco, icono de avión. Post-submit: botón deshabilitado (opacity 50%, cursor not-allowed). Cierre: click en X o click en overlay ejecuta `onClose()` y resetea el estado del formulario. → el modal se cierra y resetea correctamente.

8. **`app/kids/[id]/page.tsx`:** agregar `'use client'`, importar `LinkParentModal`. Usar `useState` para `isModalOpen` (boolean) y `parentsList` (array de `LinkedParent`, inicializado con `child.parents` del child encontrado). El dead link "Vincular otro padre" cambia de `<a href="#">` a `<button onClick={() => setIsModalOpen(true)}>` manteniendo los mismos estilos. Renderizar `<LinkParentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} childName={child.name} onAddParent={handleAddParent} />`. `handleAddParent` agrega el padre a `parentsList`. → al hacer click en "Vincular otro padre" se abre el modal.

9. **Verificación:** `npx tsc --noEmit`, `npm run lint`, `npm run build`; comparación visual con `references/pantallas/vincular-padre.dc.html`; flujo: `/kids/mateo-fernandez` → click "Vincular otro padre" → modal se abre con formulario → intentar guardar vacío → errores aparecen → completar nombre + email válido + seleccionar parentesco → enviar → código aparece + info box visible + formulario deshabilitado → cerrar con X → modal se cierra → el padre nuevo aparece en "Padres vinculados" con badge PENDIENTE.

## Acceptance criteria

- [ ] `npx tsc --noEmit` sin errores.
- [ ] `npm run lint` sin errores en `app/` y `components/` (se ignoran los de `references/`).
- [ ] `npm run build` compila.
- [ ] Click en "Vincular otro padre" abre el modal.
- [ ] Modal muestra header con "Vincular padre", subtítulo "a {child.name}", y botón X idéntico al mockup.
- [ ] Campo nombre: label "NOMBRE DEL PADRE/MADRE", placeholder "Ej. Diego Fernández", obligatorio.
- [ ] Campo email: label "EMAIL", placeholder "correo@ejemplo.com", type email, obligatorio.
- [ ] Campo parentesco: 3 botones "Mamá", "Papá", "Tutor/a" con selección única. Mamá seleccionado por defecto.
- [ ] Botón "Mamá" seleccionado: fondo `#CCD8F4`, borde `#9FB8EC`, texto `#4E72C8`.
- [ ] Botones no seleccionados: fondo `#FFFDF9`, borde `#ECE0D0`, texto `#6E6359`.
- [ ] Al guardar con nombre vacío: se muestra error inline "El nombre es obligatorio".
- [ ] Al guardar con email inválido: se muestra error inline "Email inválido".
- [ ] Al guardar con datos válidos: se genera código de 5 caracteres alfanuméricos.
- [ ] Al guardar con datos válidos: se muestra sección de código con fondo `#FBF1D6`, borde dashed, código en Fredoka 34px letter-spacing 7px, "Vence en 7 días".
- [ ] Al guardar con datos válidos: se muestra info box azul `#E3ECFB` con texto informativo.
- [ ] Al guardar con datos válidos: el formulario se deshabilita (campos readonly, botón enviar opacity 50%).
- [ ] Al guardar con datos válidos: el padre nuevo aparece en "Padres vinculados" del perfil con badge PENDIENTE.
- [ ] Al guardar con datos válidos: el código se almacena en `invitationCode` del `LinkedParent`.
- [ ] Al cancelar (X o overlay): el modal se cierra y el formulario se resetea.
- [ ] Cerrar el modal después de submit y reabrirlo: el formulario está limpio (reset completo).
- [ ] Estilos del modal coinciden visualmente con `vincular-padre.dc.html` (fondo `#FBF4EC`, bordes `#EADFD0`, radio 14px/24px, sombra, tipografías Fredoka/Nunito).
- [ ] Todos los identificadores internos en inglés; español solo en copy de UI.

## Decisions taken and discarded

- **Tomada:** client component para el modal (`LinkParentModal.tsx`) — necesita estado local para formulario, generación de código, y states pre/post submit.
- **Tomada:** `app/kids/[id]/page.tsx` como client component — necesita gestionar estado del modal y el array de padres; sigue el patrón de SPEC 04 donde las páginas con interactividad son client components.
- **Tomada:** role en inglés ("mother", "father", "guardian") — el usuario pidió que los identificadores internos estén en inglés, labels en español.
- **Tomada:** código de 5 caracteres alfanuméricos mayúsculos — legible, corto, consistente con el mockup ("7K4P9").
- **Tomada:** código generado post-submit, no pre-submit — el usuario confirmó que el código y la info box se muestran después de enviar.
- **Tomada:** modal no se cierra automáticamente post-submit — el usuario pidió que el cierre sea manual con la X.
- **Tomada:** info box siempre visible post-submit — es estática, solo informativa, sin comportamiento condicional.
- **Tomada:** formulario deshabilitado post-submit en lugar de oculto — permite ver los datos ingresados junto con el código generado.
- **Tomada:** validaciones on submit (no on blur) — consistente con SPEC 04.
- **Tomada:** sin límite de padres — el usuario confirmó que la regla de negocio es no tener límite.
- **Descartada:** envío real de correo — sin backend no tiene sentido; el usuario no lo pidió.
- **Descartada:** persistencia (localStorage, cookies) — sin backend no tiene sentido.
- **Descartada:** edición o eliminación de padre vinculado — fuera de alcance, spec separado si se necesita.
- **Descartada:** on blur para validaciones — consistente con SPEC 04, solo on submit.
- **Descartada:** countdown real de 7 días para el código — sin persistencia no tiene sentido; el texto "Vence en 7 días" es estático.

## Risks

| Riesgo | Mitigación |
|--------|------------|
| Generar el código post-submit puede causar confusión si el usuario espera verlo antes | El usuario confirmó explícitamente este flujo: código + info box solo después de enviar |
| Convertir `app/kids/[id]/page.tsx` a client component afecta el SEO | No aplica: es una app interna de guardería, no necesita SEO |
| El array de padres en memoria se pierde al recargar la página | Aceptado: no hay backend; la regla es que todo es en memoria, consistente con SPEC 04 |

## What is **not** in this spec

- Envío real de correo con código de invitación.
- Activación de cuenta del padre.
- Validación de código de invitación al activar cuenta.
- Eliminación o edición de padre vinculado.
- Límite de padres por niño (la regla es no tener límite).
- Persistencia real, backend, API, base de datos.
- Responsive móvil del modal.

Cada uno de estos, si se implementa, va en su propio spec.
