# RLS Checklist — Daycare App

Checklist de verificación RLS específica para la app de daycare OpenDayCare.

## 1. Aislamiento por daycare

Cada tabla que contiene datos de un daycare debe verificar que el usuario pertenece a ese daycare.

**Patrón correcto:**
```sql
CREATE POLICY "staff_select" ON posts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.daycare_id = (
      SELECT daycare_id FROM rooms WHERE rooms.id = posts.room_id
    )
    AND users.role = 'staff'
  )
);
```

**Errores comunes:**
- Usar `USING (true)` en tablas sensibles
- No encadenar la relación `users → rooms → children`
- Olvidar el check de `role = 'staff'` en operaciones de escritura

## 2. Separación staff/parent

| Operación | Staff | Parent |
|-----------|-------|--------|
| Ver posts de su daycare | ✅ | ❌ (solo de sus hijos) |
| Crear posts | ✅ | ❌ |
| Modificar children | ✅ | ❌ |
| Crear invitaciones | ✅ | ❌ |
| Ver daily_summaries | ✅ (su daycare) | ✅ (sus hijos) |
| Crear daily_summaries | ✅ | ❌ |
| Reaccionar a posts | ✅ | ✅ |
| Comentar posts | ✅ | ✅ |

## 3. Protección de datos de niños

- `children.name` solo visible para users del mismo daycare
- `children.room_id` no expone información de otros daycares
- `parent_children` solo visible para el parent dueño y staff del daycare
- `daily_summaries` solo visible para staff del daycare y parent vinculado

## 4. UPDATE requiere USING + WITH CHECK

```sql
-- CORRECTO
CREATE POLICY "staff_update_children" ON children
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'staff')
  AND EXISTS (SELECT 1 FROM rooms WHERE rooms.id = children.room_id AND rooms.daycare_id = users.daycare_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'staff')
  AND EXISTS (SELECT 1 FROM rooms WHERE rooms.id = children.room_id AND rooms.daycare_id = users.daycare_id)
);

-- INCORRECTO (sin WITH CHECK — permite reassinar row a otro daycare)
CREATE POLICY "bad_update" ON children
FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL);
```

## 5. Subqueries en RLS y PostgREST

**Problema conocido (migración 20260814000000):** Las policies que hacen self-join en la misma tabla causan errores 500 de PostgREST.

```sql
-- PROHIBIDO (causa 500)
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid()
    AND users.daycare_id = (SELECT daycare_id FROM users WHERE id = auth.uid())
  )
)

-- CORRECTO (evita el self-join problemático)
USING (auth.uid() = id)
```

## 6. Invitaciones — SELECT abierto

La tabla `invitations` tiene `USING (true)` en SELECT para permitir el flujo de activación. Esto es **intencional** pero debe documentarse:

- Cualquier usuario autenticado puede ver invitaciones por código
- Solo staff puede crear/modificar invitaciones
- El código de invitación es de un solo uso y expira

## 7. SECURITY DEFINER

- **Nunca** usar `SECURITY DEFINER` para resolver errores de permisos
- Si una función lo necesita, debe estar en schema no público o tener check de `auth.uid()`
- Las funciones en `public` con `SECURITY DEFINER` son callable por cualquier rol

## 8. Datos sensibles en users

Las columnas `email` y `phone` en `users` deben ser visibles solo para:
- El propio usuario (`auth.uid() = id`)
- Staff del mismo daycare (para gestión)

No deben ser visibles para otros parents.
