---
name: accessibility-checker
description: "Revisa accesibilidad WCAG 2.2 AA en componentes React/TSX. Use when: auditing accessibility, checking WCAG compliance, reviewing ARIA usage, checking keyboard navigation, contrast, screen reader compatibility, or when user says 'check accessibility', 'a11y', 'WCAG', 'accessibility review'."
metadata:
  author: opencode
  version: "1.0.0"
---

# /a11y — Accessibility Checker (WCAG 2.2 AA)

## Session context

Today's date (use this for the report header):
!`date +%F`

React TSX files in the project:
!`Get-ChildItem -Recurse -Include *.tsx -Path app,components,src -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName | Select-Object -First 30`

---

This skill **audits** React/TSX files for WCAG 2.2 AA compliance and reports findings. It does **not** modify files. The user decides what to change based on the report.

## Workflow

### Phase 1 — Identify files to review

1. Parse `$ARGUMENTS` for file paths, glob patterns, or directory names.
2. If no arguments given, ask the user which files or directories to review.
3. Resolve all paths to concrete `.tsx` files. Exclude `node_modules`, `.next`, `dist`, and `references/`.

### Phase 2 — Fetch current accessibility documentation

Before analyzing any code, fetch the latest WCAG and accessibility documentation from Context7:

1. Call `resolve-library-id` with library name `"WCAG"` or `"WAI"` and query about WCAG 2.2 AA criteria.
2. Call `resolve-library-id` with library name `"React"` and query about accessibility patterns.
3. Call `query-docs` for each verification category:

```
Category 1: "WCAG 2.2 AA success criteria for web applications, text alternatives, keyboard access"
Category 2: "ARIA roles properties states, accessible names, live regions, focus management"
Category 3: "React accessibility patterns, semantic HTML, form labels, error handling"
```

4. Use the retrieved documentation as the source of truth for all findings. **Do not rely on training data** — WCAG and ARIA best practices evolve and Context7 provides current docs.

### Phase 3 — Analyze each file

Read each file and verify against the categories below. For each finding, record:
- **File path and line number**
- **WCAG Criterion** (number and name, e.g. `1.1.1 Non-text Content`)
- **Category** (one of: Text Alternatives, Keyboard, Semantics, ARIA, Forms, Media, Contrast, Focus, Names & Labels, Error Prevention, Motion)
- **Severity**: `✅ Pass` | `⚠️ Suggestion` | `❌ Violation`
- **Description** of the issue
- **Suggested fix** with code example

#### Verification categories

**1. Text Alternatives (WCAG 1.1.1)**
- All `<img>` tags have meaningful `alt` attributes
- Decorative images use `alt=""` or `role="presentation"`
- `<svg>` elements have accessible names (`aria-label`, `<title>`, or `aria-labelledby`)
- Icon-only buttons have accessible text (aria-label or visually hidden text)
- Canvas elements have alternative content

**2. Keyboard Access (WCAG 2.1.1, 2.1.2, 2.1.4)**
- All interactive elements are focusable and operable via keyboard
- No keyboard traps (user can always Tab away)
- Custom keyboard shortcuts can be turned off or remapped
- `tabIndex` values are 0 or -1 (no positive values)
- Interactive elements use semantic tags (`<button>`, `<a>`, `<input>`) not `<div onClick>`

**3. Semantics & Structure (WCAG 1.3.1, 1.3.2, 1.3.3)**
- HTML uses proper heading hierarchy (h1 → h2 → h3, no skipping)
- Lists use `<ul>`, `<ol>`, `<li>` (not divs styled as lists)
- Tables use `<thead>`, `<th>`, `scope` or `headers` attributes
- Landmarks use semantic elements (`<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`)
- Content does not rely solely on color, size, or visual position to convey meaning

**4. ARIA Usage (WCAG 4.1.2)**
- ARIA roles are valid and match the element's behavior
- `aria-*` attributes are used on correct elements (e.g. `aria-expanded` on buttons)
- No redundant ARIA (e.g. `<button>` with `role="button"`)
- Interactive ARIA widgets have required ARIA properties
- `role="alert"` or `aria-live` used for dynamic content updates

**5. Forms & Inputs (WCAG 1.3.5, 3.3.2, 3.3.3, 3.3.4)**
- All form inputs have associated `<label>` elements (via `htmlFor`/`id` or wrapping)
- Related inputs are grouped with `<fieldset>` and `<legend>`
- Required fields indicated with `aria-required="true"` or `required`
- Input purposes declared with `autocomplete` attribute where applicable
- Error messages are associated with inputs via `aria-describedby`
- Error messages are descriptive and actionable

**6. Names & Labels (WCAG 2.4.6, 4.1.2)**
- All interactive elements have accessible names
- Buttons without visible text have `aria-label`
- Links have descriptive text (not "click here" or "read more")
- Form controls have visible AND accessible labels
- Grouped controls have group labels (`aria-labelledby`)

**7. Focus Management (WCAG 2.4.3, 2.4.7, 2.4.11)**
- Focus order follows logical reading/content order
- Focus is visible on all interactive elements (check `:focus-visible` styles)
- Skip navigation link is provided for repeated content blocks
- Modal/dialog traps focus appropriately
- Focus returns to trigger element when modal closes
- No `outline: none` without replacement focus style

**8. Contrast (WCAG 1.4.3, 1.4.11)**
- Normal text has contrast ratio ≥ 4.5:1 against background
- Large text (≥18pt or ≥14pt bold) has contrast ratio ≥ 3:1
- UI components and graphical objects have contrast ratio ≥ 3:1
- Placeholder text in inputs meets contrast requirements
- Links are distinguishable from surrounding text (by color AND underline, or ≥ 3:1)

**9. Motion & Animation (WCAG 2.2.2, 2.3.1, 2.3.3)**
- No content flashes more than 3 times per second
- Auto-playing animations can be paused/stopped
- `prefers-reduced-motion` media query is respected
- Parallax and auto-scrolling effects have alternatives
- Counting or auto-updating can be paused

**10. Reflow & Responsive (WCAG 1.4.4, 1.4.10)**
- Content reflows at 320px width without horizontal scrolling
- No loss of content or functionality when zoomed to 200%
- Touch targets are at least 24x24 CSS pixels
- Spacing between interactive targets is sufficient

**11. Language & Readability (WCAG 3.1.1, 3.1.2)**
- `lang` attribute is set on `<html>` element
- Language changes within content are marked with `lang` attribute on containing element

**12. Predictability (WCAG 3.2.1, 3.2.2, 3.2.3)**
- No automatic context changes on input (e.g. auto-submitting forms)
- Navigation is consistent across pages
- Components that look the same behave the same

**13. Error Prevention (WCAG 3.3.1, 3.3.4)**
- Error identification is clear and specific
- Errors are suggested (when possible) rather than just flagged
- Submissions are reversible, checked, or confirmed

### Phase 4 — Generate report

Output a structured report in this format:

```markdown
# Accessibility Report — WCAG 2.2 AA — {date}

**Archivos revisados:** {count}
**Violaciones:** {count}
**Sugerencias:** {count}
**Pasados:** {count}

---

## {file_path}

| Línea | Criterio | Categoría | Severidad | Hallazgo | Sugerencia |
|-------|----------|-----------|-----------|----------|------------|
| 42 | 1.1.1 Non-text Content | Text Alternatives | ❌ Violación | Imagen sin alt | Agregar `alt="descripción"` |
| 67 | 2.1.1 Keyboard | Keyboard | ⚠️ Suggestion | `<div onClick>` sin role ni tabIndex | Usar `<button>` en su lugar |
| 89 | 4.1.2 Name Role Value | ARIA | ✅ Pass | — | — |

---

## Resumen por Categoría

| Categoría | ✅ Pass | ⚠️ Suggestion | ❌ Violation |
|-----------|---------|---------------|-------------|
| Text Alternatives | 5 | 1 | 0 |
| Keyboard | 8 | 2 | 1 |
| Semantics | 12 | 0 | 0 |
| ARIA | 6 | 3 | 0 |
| Forms | 10 | 1 | 0 |
| Names & Labels | 7 | 2 | 0 |
| Focus | 9 | 1 | 0 |
| Contrast | 4 | 0 | 0 |
| Motion | 3 | 1 | 0 |
| Reflow | 6 | 0 | 0 |
| Language | 2 | 0 | 0 |
| Predictability | 5 | 0 | 0 |
| Error Prevention | 4 | 1 | 0 |
```

### Phase 5 — Offer next steps

After the report:
1. Offer to explain any finding in more detail.
2. Offer to create a prioritized fix list (violations first, then suggestions).
3. Offer to group findings by severity or by WCAG principle.
4. **Do not offer to auto-fix** — the user decides what to change.

## Hard rules

- **Never modify files.** This skill is audit-only.
- **Always use Context7** to fetch current documentation before analyzing. Do not rely on training data.
- **Report with file paths and line numbers** so the user can navigate directly to findings.
- **Provide code examples** for every suggestion and violation — show the "before" and "after".
- **Severity levels must be accurate:**
  - `❌ Violation` — breaks a WCAG 2.2 AA success criterion
  - `⚠️ Suggestion` — could be improved for better accessibility or follows best practices not strictly required by AA
  - `✅ Pass` — meets WCAG 2.2 AA requirements
- **If no issues found** in a file, report it as fully passing with a brief note on what was checked.
- **Language**: The report must be in the same language as the initial prompt. E.g., Spanish prompt → Spanish report.
- **Always reference the WCAG criterion number** (e.g. 1.1.1, 2.1.1) in findings for traceability.

## Arguments

`$ARGUMENTS` contains the **file paths, glob patterns, or directories** to review. Examples:

- `/a11y app/page.tsx` — review a single file
- `/a11y app/**/*.tsx` — review all TSX files under app/
- `/a11y components/` — review all React files in components/
- `/a11y app/page.tsx app/layout.tsx` — review multiple specific files

If no arguments are provided, ask the user which files to review.

## Reference files

The `references/` directory contains detailed checklists for each category:
- `references/wcag-2.2-aa-checklist.md` — Complete WCAG 2.2 AA criteria applicable to React/TSX
- `references/aria-patterns.md` — Common ARIA patterns for React components
- `references/common-violations.md` — Top 20 WCAG violations in React/Next.js apps with examples
