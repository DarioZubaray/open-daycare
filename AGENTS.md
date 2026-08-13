<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

"OpenDayCare": a daycare communication app — staff post about kids, families follow along. The app is still create-next-app boilerplate; the product is built against the design mockups in `references/`.

## Stack

- Next.js 16 App Router (`app/`), React 19, TypeScript strict, Tailwind v4 (`@tailwindcss/postcss`), ESLint flat config
- Path alias `@/*` → repo root
- No test framework installed; verify with typecheck + lint + `next build`

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npx tsc --noEmit` — typecheck (no script for this)
- `npm run lint` — ESLint. It currently fails on `references/pantallas/support.js`, a vendored mockup helper, not app code — ignore `references/` errors.
- `npm run build` / `npm start`

## Design source of truth

- `references/pantallas/*.dc.html` are the interactive UI mockups — open them in a browser (`references/pantallas/support.js` powers them). Match them exactly, including Argentine-Spanish (voseo) copy.
- Design system: Fredoka headings + Nunito body; bg `#FBF4EC`, text `#3F362E`, primary gradient `#F4977E→#EE8164`, accent `#C5503A`.
- Two roles with separate views: staff (`feed.dc.html`) and family (`familia-feed.dc.html`).
- `references/screenshots/*.png` — rendered captures of the same mockups.

## Workflow

- Spec features with the `spec` skill, implement with `spec-impl` (`.agents/skills/`).
- MCPs: Playwright screenshots and artifacts go in `.playwright-mcp/` (gitignored); use Context7 for current framework docs — Next 16 differs from most training data.

## Gotchas

- App code uses Next 16 typing e.g. `LayoutProps<"/">` in `app/layout.tsx` — check `node_modules/next/dist/docs/` before writing Next APIs.

## MCPs

- Playwright: Screenshots y cualquier cosa relacionada a Playwirght tiene que estar enla carpeta .playwirght-mcp/
- Context7: utilziaremos este MCP para traer información actualizada de algún framework.
- Supabase: integración activa para lectura/escritura de la base de datos en desarrollo y producción.

## Supabase - Integración

- Conectado vía MCP Server (lectura + escritura verificada)
- **Tabla existente:** `daycares` (columns: id, name, address, created_at)
- **Pruebas realizadas (12 ago 2026):** CREATE, INSERT, SELECT, DROP exitosos

### Paquetes instalados

- `@supabase/supabase-js` — cliente JS oficial de Supabase
- `@supabase/ssr` — helpers para SSR en Next.js (cookies, middleware)

### Archivos de utilidad (`utils/supabase/`)

| Archivo | Uso |
|---|---|
| `server.ts` | `createClient(cookieStore)` — para Server Components y Route Handlers |
| `client.ts` | `createClient()` — para Client Components (browser) |
| `middleware.ts` | `createClient(request)` — refresca sesiones en middleware |

### Variables de entorno (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

### Uso básico

**Server Component:**
```ts
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createClient(cookieStore)
const { data } = await supabase.from('table_name').select()
```

**Client Component:**
```ts
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('table_name').select()
```

## Spec Driven Development - Skills

- /spec utilizaremos esta habilidad para crear las especificaciones.
- /spec-impl usaremos esta habilidad para hacer las implementaciones de las especificaciones.