# WCAG 2.2 AA Checklist for React/TSX

Referencia completa de criterios de éxito WCAG 2.2 nivel AA aplicables a componentes React/Next.js.

---

## Principio 1: Perceptible

### 1.1 Text Alternatives

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **1.1.1 Non-text Content** | A | `<img>` sin `alt`, `<svg>` sin accessible name, icon buttons sin aria-label, canvas sin fallback |

**Checklist:**
- [ ] Todas las imágenes `<img>` tienen atributo `alt`
- [ ] Imágenes decorativas usan `alt=""` o `role="presentation"`
- [ ] Elementos `<svg>` tienen `<title>`, `aria-label`, o `aria-labelledby`
- [ ] Botones con solo icono tienen `aria-label` o texto visualmente oculto
- [ ] Elementos `<canvas>` tienen contenido alternativo

```tsx
// ❌ Violación
<img src="/logo.png" />
<svg><path d="..." /></svg>
<button><Icon /></button>

// ✅ Correcto
<img src="/logo.png" alt="Logo de OpenDayCare" />
<svg aria-label="Icono de notificación"><path d="..." /></svg>
<button aria-label="Notificaciones"><Icon /></button>
```

### 1.2 Time-based Media

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **1.2.1 Audio-only and Video-only** | A | Videos sin transcripciones |
| **1.2.2 Captions** | A | Videos sin subtítulos |
| **1.2.3 Audio Description** | A | Videos sin descripción de audio |
| **1.2.4 Captions (Live)** | AA | Transmisiones en vivo sin captions |
| **1.2.5 Audio Description (Pre-recorded)** | AA | Videos pregrabados sin audio description |

### 1.3 Adaptable

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **1.3.1 Info and Relationships** | A | Estructura HTML incorrecta, headings desordenados, tablas sin th |
| **1.3.2 Meaningful Sequence** | A | Orden de lectura ilógico en el DOM |
| **1.3.3 Sensory Characteristics** | A | Instrucciones basadas solo en forma/color/posición |
| **1.3.4 Orientation** | AA | Contenido bloqueado a una orientación |
| **1.3.5 Identify Input Purpose** | AA | Inputs sin `autocomplete` para datos personales |

**Checklist:**
- [ ] Headings usan jerarquía correcta (h1 → h2 → h3, sin saltar niveles)
- [ ] Listas usan `<ul>`, `<ol>`, `<li>` (no divs)
- [ ] Tablas tienen `<thead>`, `<th>`, `scope` o `headers`
- [ ] Landmarks usan elementos semánticos (`<nav>`, `<main>`, `<aside>`)
- [ ] Inputs de datos personales tienen `autocomplete` attribute

### 1.4 Distinguishable

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **1.4.1 Use of Color** | A | Información conveyada solo por color |
| **1.4.2 Audio Control** | A | Audio automático sin control |
| **1.4.3 Contrast (Minimum)** | AA | Texto con contraste < 4.5:1 (normal) o < 3:1 (grande) |
| **1.4.4 Resize Text** | AA | Texto que no se puede redimensionar a 200% |
| **1.4.5 Images of Text** | AA | Imágenes de texto (excepto logotipos) |
| **1.4.10 Reflow** | AA | Scroll horizontal a 320px de ancho |
| **1.4.11 Non-text Contrast** | AA | Componentes UI con contraste < 3:1 |
| **1.4.12 Text Spacing** | AA | Texto que se corta con espaciado personalizado |
| **1.4.13 Content on Hover or Focus** | AA | Tooltips/popups sin dismiss ni hover persistente |

**Checklist:**
- [ ] Errores no se indican solo con color (ej: también con icono o texto)
- [ ] Links se distinguen de texto circundante (color + subrayado, o ≥ 3:1)
- [ ] Placeholder de inputs tiene contraste ≥ 4.5:1
- [ ] No hay scroll horizontal en viewport de 320px
- [ ] Tooltips se pueden cerrar con Escape y persisten al hacer hover

---

## Principio 2: Operable

### 2.1 Keyboard Accessible

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **2.1.1 Keyboard** | A | Elementos interactivos no operables con teclado |
| **2.1.2 No Keyboard Trap** | A | Focus atascado en un elemento |
| **2.1.4 Character Key Shortcuts** | A | Atajos de teclado de un solo carácter sin alternativa |

**Checklist:**
- [ ] Todos los `<div onClick>` tienen `tabIndex={0}`, `role`, y handler de teclado
- [ ] No hay `tabIndex` con valores positivos
- [ ] El usuario puede Tab hacia afuera de cualquier componente
- [ ] Atajos de teclado se pueden desactivar o remapear

```tsx
// ❌ Violación
<div onClick={handleClick}>Click me</div>

// ✅ Correcto
<button onClick={handleClick}>Click me</button>
```

### 2.2 Enough Time

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **2.2.1 Timing Adjustable** | A | Timeouts sin aviso ni extensión |
| **2.2.2 Stop, Pause, Hide** | A | Contenido en movimiento sin control de pausa |

### 2.3 Seizures and Physical Reactions

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **2.3.1 Three Flashes or Below Threshold** | A | Contenido que parpadea > 3 veces/segundo |

### 2.4 Navigable

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **2.4.1 Bypass Blocks** | A | Sin skip link para contenido repetido |
| **2.4.2 Page Titled** | A | Páginas sin título descriptivo |
| **2.4.3 Focus Order** | A | Orden de focus ilógico |
| **2.4.4 Link Purpose (In Context)** | A | Links con texto no descriptivo ("click here") |
| **2.4.5 Multiple Ways** | AA | Solo una forma de encontrar páginas |
| **2.4.6 Headings and Labels** | AA | Headings/labels no descriptivos |
| **2.4.7 Focus Visible** | AA | Focus outline eliminado sin reemplazo |

**Checklist:**
- [ ] Skip link existe y funciona (`<a href="#main-content">Saltar al contenido</a>`)
- [ ] Focus visible tiene estilo claro (no `outline: none` sin reemplazo)
- [ ] Links de "leer más" o "click here" tienen aria-label descriptivo
- [ ] Focus sigue orden lógico del contenido

```tsx
// ❌ Violación
<a href="/post/1">Click here</a>
<style>{`* { outline: none; }`}</style>

// ✅ Correcto
<a href="/post/1" aria-label="Leer artículo: Cómo crear tu primer post">
  Click here
</a>
<style>{`
  *:focus-visible {
    outline: 2px solid #C5503A;
    outline-offset: 2px;
  }
`}</style>
```

### 2.5 Input Modalities

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **2.5.1 Pointer Gestures** | A | Gestos complejos sin alternativa de un solo pointer |
| **2.5.2 Pointer Cancellation** | A | Acciones en `pointerdown` en vez de `pointerup` |
| **2.5.3 Label in Name** | A | Nombre accesible no contiene el texto visible |
| **2.5.4 Motion Actuation** | A | Funciones activadas por movimiento sin alternativa |

---

## Principio 3: Entendible

### 3.1 Readable

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **3.1.1 Language of Page** | A | `<html>` sin `lang` |
| **3.1.2 Language of Parts** | AA | Cambios de idioma sin atributo `lang` |

### 3.2 Predictable

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **3.2.1 On Focus** | A | Cambios de contexto al hacer focus |
| **3.2.2 On Input** | A | Cambios de contexto al cambiar un input |
| **3.2.3 Consistent Navigation** | AA | Navegación inconsistente entre páginas |
| **3.2.4 Consistent Identification** | AA | Mismos componentes con diferentes labels |

### 3.3 Input Assistance

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **3.3.1 Error Identification** | A | Errores no identificados o no descriptivos |
| **3.3.2 Labels or Instructions** | A | Inputs sin labels visibles o aria-label |
| **3.3.3 Error Suggestion** | AA | Errores sin sugerencia de corrección |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | AA | Envíos importantes sin reversión o confirmación |

**Checklist:**
- [ ] Errores se muestran junto al campo (no solo en toast genérico)
- [ ] Cada error describe qué está mal y cómo corregirlo
- [ ] Inputs requeridos tienen `aria-required="true"` o `required`
- [ ] Mensajes de error se asocian al input con `aria-describedby`

```tsx
// ❌ Violación
<input type="email" />
{error && <p>Ocurrió un error</p>}

// ✅ Correcto
<label htmlFor="email">Correo electrónico</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && (
  <p id="email-error" role="alert">
    Ingresá un correo válido (ej: usuario@ejemplo.com)
  </p>
)}
```

---

## Principio 4: Robusto

### 4.1 Compatible

| Criterio | Nivel | Qué buscar en TSX |
|----------|-------|-------------------|
| **4.1.2 Name, Role, Value** | A | Componentes custom sin roles ARIA o sin accessible name |
| **4.1.3 Status Messages** | AA | Actualizaciones dinámicas sin `aria-live` o `role="status"` |

**Checklist:**
- [ ] Componentes custom tienen roles ARIA válidos
- [ ] Estados se comunican con `aria-expanded`, `aria-selected`, `aria-checked`, etc.
- [ ] Mensajes de éxito/error usan `role="alert"` o `aria-live="polite"`
- [ ] Contenido cargado dinámicamente announce a screen readers

```tsx
// ❌ Violación — componente custom sin ARIA
<div className="tabs">
  <div className="tab active">Tab 1</div>
  <div className="tab">Tab 2</div>
</div>

// ✅ Correcto
<div role="tablist" aria-label="Secciones del perfil">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    Tab 1
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Tab 2
  </button>
</div>
<div role="tabpanel" id="panel-1">...</div>
<div role="tabpanel" id="panel-2" hidden>...</div>
```

---

## Resumen de ratios de contraste

| Elemento | Ratio mínimo |
|----------|-------------|
| Texto normal (< 18pt / < 14pt bold) | 4.5:1 |
| Texto grande (≥ 18pt / ≥ 14pt bold) | 3:1 |
| Componentes UI (borders, icons, focus rings) | 3:1 |
| Gráficos y objetos no-textuales | 3:1 |
