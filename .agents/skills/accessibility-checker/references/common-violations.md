# Common WCAG Violations in React/Next.js

Top 20 violaciones de accesibilidad encontradas en aplicaciones React/Next.js, con ejemplos de código.

---

## 1. Imágenes sin `alt`

**Criterio:** 1.1.1 Non-text Content

```tsx
// ❌ Violación
<img src="/daycare-photo.jpg" />

// ✅ Fix
<img src="/daycare-photo.jpg" alt="Niños jugando en el jardín" />
```

---

## 2. Botones con solo icono sin accessible name

**Criterio:** 4.1.2 Name, Role, Value

```tsx
// ❌ Violación
<button onClick={handleClose}>
  <CloseIcon />
</button>

// ✅ Fix
<button onClick={handleClose} aria-label="Cerrar">
  <CloseIcon />
</button>
```

---

## 3. `<div onClick>` sin keyboard access

**Criterio:** 2.1.1 Keyboard

```tsx
// ❌ Violación
<div className="card" onClick={handleClick}>
  <h3>Título</h3>
</div>

// ✅ Fix — usar elemento semántico
<button className="card" onClick={handleClick}>
  <h3>Título</h3>
</button>

// ✅ Fix — si no puede ser button
<div
  className="card"
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  <h3>Título</h3>
</div>
```

---

## 4. Inputs sin `<label>` asociado

**Criterio:** 3.3.2 Labels or Instructions

```tsx
// ❌ Violación
<input type="text" placeholder="Nombre" />

// ✅ Fix — label visible
<label htmlFor="nombre">Nombre</label>
<input id="nombre" type="text" placeholder="Nombre" />

// ✅ Fix — label oculto (pero accesible)
<label htmlFor="nombre" className="sr-only">Nombre</label>
<input id="nombre" type="text" placeholder="Nombre" />
```

---

## 5. Focus outline eliminado sin reemplazo

**Criterio:** 2.4.7 Focus Visible

```css
/* ❌ Violación */
* {
  outline: none;
}

/* ✅ Fix */
*:focus-visible {
  outline: 2px solid #C5503A;
  outline-offset: 2px;
}
```

---

## 6. Links no descriptivos

**Criterio:** 2.4.4 Link Purpose

```tsx
// ❌ Violación
<a href="/post/1">Leer más</a>
<a href="/post/1">Click aquí</a>

// ✅ Fix
<a href="/post/1">Leer artículo: Creación de primer post</a>
```

---

## 7. Headings saltan niveles

**Criterio:** 1.3.1 Info and Relationships

```tsx
// ❌ Violación — salta de h1 a h3
<h1>Perfil</h1>
<h3>Datos personales</h3>

// ✅ Fix — jerarquía correcta
<h1>Perfil</h1>
<h2>Datos personales</h2>
```

---

## 8. Errores sin asociar al input

**Criterio:** 3.3.1 Error Identification

```tsx
// ❌ Violación
<form>
  <input type="email" />
  <p style={{ color: 'red' }}>Email inválido</p>
</form>

// ✅ Fix
<form>
  <label htmlFor="email">Correo</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  <p id="email-error" role="alert">Ingresá un correo válido</p>
</form>
```

---

## 9. Color como única señal visual

**Criterio:** 1.4.1 Use of Color

```tsx
// ❌ Violación — error solo en rojo
<p style={{ color: 'red' }}>Campo obligatorio</p>

// ✅ Fix — color + icono + texto
<p className="error">
  <AlertIcon /> Campo obligatorio
</p>
```

---

## 10. `tabIndex` con valores positivos

**Criterio:** 2.4.3 Focus Order

```tsx
// ❌ Violación — altera el orden de tabulación
<input tabIndex={3} />
<button tabIndex={1} />

// ✅ Fix — solo 0 o -1
<input tabIndex={0} />   {/* en el flujo normal */}
<div tabIndex={-1}>...</div> {/* focusable por JS, no por Tab */}
```

---

## 11. Modales sin focus trap

**Criterio:** 2.1.2 No Keyboard Trap (y Focus Management)

```tsx
// ❌ Violación — focus escapa del modal
function Modal({ isOpen, children }) {
  if (!isOpen) return null;
  return <div role="dialog">{children}</div>;
}

// ✅ Fix — focus trap + return focus
function Modal({ isOpen, onClose, children }) {
  const previousFocus = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      closeRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" onKeyDown={(e) => {
      if (e.key === 'Escape') onClose();
    }}>
      {children}
      <button ref={closeRef} onClick={onClose}>Cerrar</button>
    </div>
  );
}
```

---

## 12. Contenido dinámico sin announce

**Criterio:** 4.1.3 Status Messages

```tsx
// ❌ Violación — screen reader no anuncia el cambio
<p>{count} resultados encontrados</p>

// ✅ Fix — aria-live
<p aria-live="polite">{count} resultados encontrados</p>

// ✅ Fix — role="status" para mensajes no urgentes
<div role="status">
  {isLoading ? 'Cargando...' : `${count} resultados`}
</div>
```

---

## 13. Tabla sin encabezados

**Criterio:** 1.3.1 Info and Relationships

```tsx
// ❌ Violación
<table>
  <tr><td>Nombre</td><td>Edad</td></tr>
  <tr><td>Ana</td><td>5</td></tr>
</table>

// ✅ Fix
<table>
  <thead>
    <tr><th scope="col">Nombre</th><th scope="col">Edad</th></tr>
  </thead>
  <tbody>
    <tr><td>Ana</td><td>5</td></tr>
  </tbody>
</table>
```

---

## 14. Skip link inexistente

**Criterio:** 2.4.1 Bypass Blocks

```tsx
// ❌ Violación — contenido repetido sin skip
<header>...</header>
<main id="main-content">...</main>

// ✅ Fix — skip link como primer elemento
<>
  <a href="#main-content" className="skip-link">
    Saltar al contenido principal
  </a>
  <header>...</header>
  <main id="main-content">...</main>
</>
```

---

## 15. `lang` attribute faltante

**Criterio:** 3.1.1 Language of Page

```tsx
// ❌ Violación — en layout.tsx
<html>
  <body>{children}</body>
</html>

// ✅ Fix
<html lang="es">
  <body>{children}</body>
</html>
```

---

## 16. Imágenes decorativas sin `alt=""`

**Criterio:** 1.1.1 Non-text Content

```tsx
// ❌ Violación — image decorativa sin alt (screen reader lee la URL)
<img src="/decoration.png" />

// ✅ Fix — alt vacío = decorativa
<img src="/decoration.png" alt="" role="presentation" />
```

---

## 17. ARIA redundante

**Criterio:** Best Practice (4.1.2)

```tsx
// ❌ Violación — role redundante
<button role="button">Enviar</button>
<nav role="navigation">...</nav>
<h1 role="heading">Título</h1>

// ✅ Fix — el elemento ya tiene la semántica
<button>Enviar</button>
<nav>...</nav>
<h1>Título</h1>
```

---

## 18. Tooltip sin dismiss ni persistencia

**Criterio:** 1.4.13 Content on Hover or Focus

```tsx
// ❌ Violación — desaparece al mover el mouse
<div onMouseEnter={show} onMouseLeave={hide}>...</div>

// ✅ Fix — persiste al hover sobre el tooltip y se cierra con Escape
function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onKeyDown={(e) => e.key === 'Escape' && setVisible(false)}
    >
      {children}
      {visible && (
        <span role="tooltip" className="tooltip">{content}</span>
      )}
    </span>
  );
}
```

---

## 19. Auto-submit en forms

**Criterio:** 3.2.2 On Input

```tsx
// ❌ Violación — cambia contexto al seleccionar
<select onChange={(e) => router.push(`/filtered/${e.target.value}`)}>
  <option>Todos</option>
  <option>Staff</option>
</select>

// ✅ Fix — botón explícito para aplicar filtro
<>
  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
    <option>Todos</option>
    <option>Staff</option>
  </select>
  <button onClick={() => router.push(`/filtered/${filter}`)}>
    Aplicar filtro
  </button>
</>
```

---

## 20. Touch targets demasiado pequeños

**Criterio:** 2.5.8 Target Size (Minimum)

```tsx
// ❌ Violación — botón de 16x16px
<button style={{ width: '16px', height: '16px' }}>Menú</button>

// ✅ Fix — mínimo 24x24px, idealmente 44x44px
<button style={{ minWidth: '44px', minHeight: '44px' }}>Menú</button>
```
