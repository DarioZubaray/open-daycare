---
name: react-best-practices
description: "Reviews React files for best practices compliance. Use when: auditing React components, reviewing hooks usage, checking for anti-patterns, verifying React 19 patterns, validating component purity, performance optimization review, or when user says 'review React', 'check best practices', 'audit component', 'react-best-practices'."
metadata:
  author: opencode
  version: "1.0.0"
---

# /react-review — React Best Practices Auditor

## Session context

Today's date (use this for the report header):
!`date +%F`

React files in the project:
!`Get-ChildItem -Recurse -Include *.tsx,*.ts -Path app,components,src -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName | Select-Object -First 30`

---

This skill **audits** React files and reports findings. It does **not** modify files. The user decides what to change based on the report.

## Workflow

### Phase 1 — Identify files to review

1. Parse `$ARGUMENTS` for file paths, glob patterns, or directory names.
2. If no arguments given, ask the user which files or directories to review.
3. Resolve all paths to concrete `.tsx` / `.ts` files. Exclude `node_modules`, `.next`, `dist`, and `references/`.

### Phase 2 — Fetch current React documentation

Before analyzing any code, fetch the latest React best practices from Context7:

1. Call `resolve-library-id` with library name `"React"` and query about best practices.
2. Select the library ID `/reactjs/react.dev` (highest authority).
3. Call `query-docs` for each verification category:

```
Category 1: "Rules of Hooks, hooks ordering, conditional hooks, useCallback useMemo rules"
Category 2: "Component purity, side effects, immutable props and state, avoiding anti-patterns"
Category 3: "React 19 new features, useActionState, useOptimistic, use hook, Server Functions, ref as prop"
Category 4: "Performance optimization, memo, useMemo, useCallback, avoiding unnecessary re-renders"
```

4. Use the retrieved documentation as the source of truth for all findings. **Do not rely on training data** — React evolves and Context7 provides current docs.

### Phase 3 — Analyze each file

Read each file and verify against the categories below. For each finding, record:
- **File path and line number**
- **Category** (one of: Hooks, Purity, Anti-pattern, Performance, React 19, TypeScript, Next.js)
- **Severity**: `✅ Pass` | `⚠️ Suggestion` | `❌ Violation`
- **Description** of the issue
- **Suggested fix** with code example

#### Verification categories

**1. Rules of Hooks**
- Hooks called only at the top level (not inside loops, conditions, nested functions)
- Hooks called only from React functions (components or custom hooks)
- Dependency arrays are complete and correct
- No missing dependencies in useEffect, useMemo, useCallback
- No unnecessary dependencies

**2. Component Purity**
- Components are pure functions (same input → same output)
- No side effects during render (side effects belong in useEffect/useTransition)
- Props and state are not mutated directly
- Return values and hook arguments are not modified after use

**3. Anti-patterns**
- No `useState` + `useEffect` to derive state from props (use `useMemo` or compute during render)
- No creating new objects/arrays in render that cause unnecessary re-renders
- No inline function definitions in JSX that defeat `memo` (when `memo` is used)
- No `useEffect` for event handlers (use event handlers directly)
- No `useEffect` for data transformation (compute during render or use `useMemo`)
- No boolean sprawl (multiple booleans that could be one state variable or derived)
- No magic numbers or strings without constants

**4. Performance**
- `memo` used only when there is a measurable re-render problem
- `useMemo` used for expensive calculations, not trivial ones
- `useCallback` used only when passing callbacks to memoized children
- No unnecessary `memo`, `useMemo`, or `useCallback` (they have a cost too)
- Large lists use virtualization
- Images use `next/image` optimization (Next.js projects)

**5. React 19 Features**
- Server Components used where possible (no unnecessary `'use client'`)
- `use()` used instead of `useEffect` + `useState` for data fetching in Client Components
- `useActionState` used instead of manual form state management
- `useOptimistic` used for immediate UI feedback on async operations
- `'use server'` directive used for Server Functions
- `ref` passed as prop instead of `forwardRef` (React 19 pattern)

**6. TypeScript**
- Props interface is properly typed
- Event handlers have correct types
- No `any` types where specific types exist
- Generic components use proper type parameters

**7. Next.js App Router**
- Server Components are the default (no unnecessary `'use client'`)
- Client Components are at the leaves of the component tree
- `loading.tsx` / `error.tsx` / `not-found.tsx` used where appropriate
- Route Handlers follow correct patterns

### Phase 4 — Generate report

Output a structured report in this format:

```markdown
# React Best Practices Report — {date}

**Files reviewed:** {count}
**Violations:** {count}
**Suggestions:** {count}
**Passed:** {count}

---

## {file_path}

| Line | Category | Severity | Finding | Suggestion |
|------|----------|----------|---------|------------|
| 42 | Hooks | ❌ Violation | useEffect missing dependency `user.id` | Add `user.id` to dependency array |
| 67 | Performance | ⚠️ Suggestion | Inline function in JSX defeats memo | Wrap with useCallback |
| 89 | React 19 | ⚠️ Suggestion | Using forwardRef (deprecated in React 19) | Pass ref as regular prop |

---

## Summary by Category

| Category | ✅ Pass | ⚠️ Suggestion | ❌ Violation |
|----------|---------|---------------|-------------|
| Hooks | 12 | 2 | 1 |
| Purity | 8 | 0 | 0 |
| Anti-pattern | 5 | 3 | 0 |
| Performance | 10 | 1 | 0 |
| React 19 | 6 | 4 | 0 |
| TypeScript | 15 | 0 | 0 |
| Next.js | 7 | 1 | 0 |
```

### Phase 5 — Offer next steps

After the report:
1. Offer to explain any finding in more detail.
2. Offer to create a prioritized fix list.
3. **Do not offer to auto-fix** — the user decides what to change.

## Hard rules

- **Never modify files.** This skill is audit-only.
- **Always use Context7** to fetch current React documentation before analyzing. Do not rely on training data.
- **Report with file paths and line numbers** so the user can navigate directly to findings.
- **Provide code examples** for every suggestion and violation — show the "before" and "after".
- **Severity levels must be accurate:**
  - `❌ Violation` — breaks Rules of Hooks, causes bugs, or is a clear anti-pattern
  - `⚠️ Suggestion` — could be improved for performance, readability, or modern patterns
  - `✅ Pass` — follows best practices
- **If no issues found** in a file, report it as fully passing with a brief note on what was checked.
- **Language**: The report must be in the same language as the initial prompt. E.g., Spanish prompt → Spanish report.

## Arguments

`$ARGUMENTS` contains the **file paths, glob patterns, or directories** to review. Examples:

- `/react-review app/page.tsx` — review a single file
- `/react-review app/**/*.tsx` — review all TSX files under app/
- `/react-review components/` — review all React files in components/
- `/react-review app/page.tsx app/layout.tsx` — review multiple specific files

If no arguments are provided, ask the user which files to review.

## Reference files

The `references/` directory contains detailed checklists for each category:
- `references/rules-of-hooks.md` — Complete hooks rules and dependency array guidance
- `references/component-patterns.md` — Purity rules, anti-patterns, and composition patterns
- `references/react-19-features.md` — React 19 new APIs and migration patterns
- `references/performance.md` — When and how to use memo, useMemo, useCallback
