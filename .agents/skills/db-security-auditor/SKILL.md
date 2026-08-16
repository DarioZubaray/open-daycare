---
name: db-security-auditor
description: "Audita RLS y seguridad de la DB Supabase para prevenir fugas de datos entre roles. Use when: 'audit DB security', 'check RLS', 'review database policies', 'security audit', 'fuga de datos', 'revisar permisos', 'db-audit'."
metadata:
  author: opendaycare
  version: 1.0.0
  date: 2026-08-16
  abstract: >
    Audita Row Level Security y permisos de la base de datos Supabase del proyecto.
    Detecta fugas de datos entre niños/padres/staff por RLS mal configurado.
    Genera reportes de seguridad y migraciones de corrección.
---

# DB Security Auditor — Skill

You are a database security auditor. Your job is to audit Supabase RLS policies and database security for the OpenDayCare project to prevent data leaks between children, parents, and staff.

## Context

Daycare communication app with two roles:
- **staff**: creates posts, manages children, sends daily summaries
- **parent**: views posts about their linked children, reacts, comments

Critical security: parents only see their linked children's data; staff only see their daycare's data.

## Arguments

The argument received is: `$ARGUMENTS`

- Empty → audit ALL tables
- Table name (e.g. `posts`, `children`) → audit only that table
- `critical` → audit only tables with cross-family data exposure risk

## Workflow

### Step 1 — Collect current state

1. Read `supabase/schemas/public.sql`
2. Query live RLS policies:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
   FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
   ```
3. Query RLS enabled status:
   ```sql
   SELECT relname, relrowsecurity, relforcerowsecurity
   FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' ORDER BY relname;
   ```
4. Query functions:
   ```sql
   SELECT p.proname, p.prosecdef, n.nspname
   FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
   WHERE n.nspname = 'public' ORDER BY p.proname;
   ```

### Step 2 — Check each table

For every table (or the filtered set), verify:

| # | Check | Severity |
|---|-------|----------|
| 1 | RLS enabled (`relrowsecurity = true`) | CRITICAL if missing |
| 2 | Service role bypass policy exists | HIGH if missing |
| 3 | SELECT has ownership/daycare predicate (not `USING (true)`) | CRITICAL if missing on sensitive tables |
| 4 | UPDATE has both `USING` and `WITH CHECK` | MEDIUM |
| 5 | INSERT has ownership check in `WITH CHECK` | MEDIUM |
| 6 | DELETE has ownership/daycare check | HIGH if missing |
| 7 | No deprecated `auth.role()` usage | MEDIUM |
| 8 | No bare `auth.uid()` in subqueries (use `(select auth.uid())`) | LOW |
| 9 | Write ops check `role = 'staff'` where appropriate | HIGH if missing |

### Step 3 — Cross-role leak analysis

Verify these specific scenarios are blocked:

1. **Parent A cannot see Parent B's children's posts** (unless announcement)
2. **Parent cannot modify children, invitations, or daily_summaries**
3. **Staff of Daycare A cannot access Daycare B's data**
4. **Parent cannot see other parents' reactions/comments** (reactions are visible, but that's by design — verify)
5. **Daily summaries are scoped to linked children only** for parents
6. **Invitations** — the open SELECT is intentional for activation flow, but document it

### Step 4 — Generate fixes

For each vulnerability, create a migration file:
- Name: `YYYYMMDDHHMMSS_security_fix_<table>.sql`
- Follow project SQL conventions
- Include `USING` + `WITH CHECK` for UPDATE
- Use `(select auth.uid())` for performance
- Add role checks where missing

**Do NOT apply.** Generate and report only.

### Step 5 — Report

```
🔒 DB SECURITY AUDIT REPORT

Tablas auditadas:          N
Políticas RLS revisadas:   N
Vulnerabilidades:          N
  - Críticas:  N
  - Medias:    N
  - Bajas:     N

Status: [CLEAN ✅ / ISSUES ⚠️ / CRITICAL ❌]

---
Detalle:
1. ❌ table — vulnerability description
2. ⚠️ table — issue description
3. 💡 table — improvement suggestion
...

Migraciones generadas: N
(solo archivos, no aplicadas)
```

## Hard rules

- **Never apply migrations.** Generate files only.
- **Always query live data** via SQL, not just migration files.
- **Every finding needs evidence**: exact table, policy name, and why it's a problem.
- **Use Spanish** for the report.
- **Severity = data leak between families → CRITICAL.**
