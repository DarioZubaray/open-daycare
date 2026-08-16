# ARIA Patterns for React Components

Guía de patrones ARIA correctos para componentes React/TSX.

---

## Reglas generales

1. **No uses ARIA si el elemento HTML nativo ya tiene la semántica.** `<button>` es mejor que `<div role="button">`.
2. **No dupliques roles.** `<button role="button">` es redundante.
3. **Todos los componentes interactivos ARIA necesitan keyboard access.**
4. **Los names accesibles son obligatorios.** Todo componente interactivo necesita un nombre legible por screen readers.

---

## Botones

```tsx
// ✅ Botón con solo icono
<button aria-label="Cerrar modal">
  <CloseIcon />
</button>

// ✅ Botón con estado
<button
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  onClick={toggleMenu}
>
  Menú
</button>

// ✅ Botón de toggle
<button
  role="switch"
  aria-checked={isOn}
  onClick={toggle}
>
  Notificaciones
</button>
```

## Links

```tsx
// ❌ Link no descriptivo
<a href="/post/1">Leer más</a>

// ✅ Link descriptivo
<a href="/post/1">Leer artículo: Cómo crear tu primer post</a>

// ✅ Link externo
<a href="https://ejemplo.com" target="_blank" rel="noopener noreferrer">
  Sitio externo
  <span className="sr-only">(abre en nueva ventana)</span>
</a>
```

## Forms

```tsx
// ✅ Input con label visible
<label htmlFor="nombre">Nombre</label>
<input id="nombre" type="text" />

// ✅ Input con label visualmente oculto (pero accesible)
<label htmlFor="busqueda" className="sr-only">
  Buscar
</label>
<input id="busqueda" type="search" placeholder="Buscar..." />

// ✅ Input requerido con error
<label htmlFor="email">
  Correo electrónico <span aria-hidden="true">*</span>
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-hint email-error"
/>
<p id="email-hint">No compartiremos tu correo.</p>
{hasError && (
  <p id="email-error" role="alert">
    Ingresá un correo válido.
  </p>
)}

// ✅ Grupo de inputs relacionados
<fieldset>
  <legend>Dirección de envío</legend>
  <label htmlFor="calle">Calle</label>
  <input id="calle" type="text" />
  <label htmlFor="ciudad">Ciudad</label>
  <input id="ciudad" type="text" />
</fieldset>
```

## Select / Dropdown

```tsx
// ✅ Select nativo (preferido)
<label htmlFor="rol">Rol</label>
<select id="rol">
  <option value="">Seleccionar...</option>
  <option value="staff">Staff</option>
  <option value="familia">Familia</option>
</select>

// ✅ Custom combobox con aria
<div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
  <input
    role="searchbox"
    aria-autocomplete="list"
    aria-controls="listbox-options"
    aria-activedescendant={activeOptionId}
  />
  <ul id="listbox-options" role="listbox">
    <li role="option" aria-selected="true" id="opt-1">Opción 1</li>
    <li role="option" aria-selected="false" id="opt-2">Opción 2</li>
  </ul>
</div>
```

## Modal / Dialog

```tsx
// ✅ Modal con focus trap
function Modal({ isOpen, onClose, title, children }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button ref={closeButtonRef} onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
}
```

## Tabs

```tsx
// ✅ Tabs con keyboard navigation
function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <div role="tablist" aria-label="Secciones">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={i === activeIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') setActiveIndex(Math.min(i + 1, tabs.length - 1));
              if (e.key === 'ArrowLeft') setActiveIndex(Math.max(i - 1, 0));
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={i !== activeIndex}
        >
          {tab.content}
        </div>
      ))}
    </>
  );
}
```

## Accordion

```tsx
// ✅ Accordion
function AccordionItem({ title, children, id, isOpen, onToggle }) {
  return (
    <div>
      <h3>
        <button
          aria-expanded={isOpen}
          aria-controls={`content-${id}`}
          onClick={onToggle}
        >
          {title}
        </button>
      </h3>
      <div
        id={`content-${id}`}
        role="region"
        aria-labelledby={`heading-${id}`}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}
```

## Alert / Toast

```tsx
// ✅ Alerta inline
<div role="alert" aria-live="assertive">
  Se guardaron los cambios correctamente.
</div>

// ✅ Status message (no urgente)
<div role="status" aria-live="polite">
  Cargando más resultados...
</div>

// ✅ Toast con dismiss
<div role="status" aria-live="polite" aria-atomic="true">
  <p>Perfil actualizado</p>
  <button aria-label="Cerrar notificación" onClick={onDismiss}>
    ✕
  </button>
</div>
```

## Tooltip

```tsx
// ✅ Tooltip con hover y focus
function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span role="tooltip" id="tooltip-1">
          {content}
        </span>
      )}
    </span>
  );
}
```

## Live Regions

```tsx
// ✅ Contenido que se actualiza dinámicamente
// Solo lectura — screen reader anuncia el cambio
<div aria-live="polite" aria-atomic="true">
  {notifications.length} notificaciones nuevas
</div>

// ✅ Región off-screen para anuncios programáticos
<div className="sr-only" aria-live="assertive" id="announcer">
  {announcement}
</div>

// CSS para sr-only:
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border-width: 0;
// }
```

## Skip Navigation

```tsx
// ✅ Skip link — primer elemento focuseable
<a href="#main-content" className="skip-link">
  Saltar al contenido principal
</a>

// CSS:
// .skip-link {
//   position: absolute;
//   top: -40px;
//   left: 0;
//   padding: 8px;
//   z-index: 100;
// }
// .skip-link:focus {
//   top: 0;
// }
```

## Touch Targets

```tsx
// ✅ Mínimo 24x24 CSS pixels para interactivos
<button
  style={{ minWidth: '44px', minHeight: '44px' }}
  aria-label="Cerrar"
>
  ✕
</button>

// ✅ Separación entre targets interactivos
<div style={{ display: 'flex', gap: '8px' }}>
  <button>Aceptar</button>
  <button>Cancelar</button>
</div>
```
