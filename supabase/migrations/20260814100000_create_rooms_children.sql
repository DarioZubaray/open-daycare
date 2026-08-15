-- ============================================
-- ENUM: child_status
-- ============================================

CREATE TYPE child_status AS ENUM ('active', 'archived');

-- ============================================
-- TABLE: rooms
-- ============================================

CREATE TABLE rooms (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES daycares(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE: children
-- ============================================

CREATE TABLE children (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id        uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  full_name      text NOT NULL,
  birth_date     date NOT NULL,
  enrolled_at    date NOT NULL DEFAULT CURRENT_DATE,
  medical_notes  text,
  allergy_tags   text[] DEFAULT '{}',
  photo_consent  boolean NOT NULL DEFAULT true,
  status         child_status NOT NULL DEFAULT 'active',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY: rooms
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on rooms"
  ON rooms FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view rooms in their daycare"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    daycare_id IN (
      SELECT users.daycare_id
      FROM users
      WHERE users.id = auth.uid()
    )
  );

-- ============================================
-- ROW LEVEL SECURITY: children
-- ============================================

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on children"
  ON children FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view children in their daycare"
  ON children FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT rooms.id
      FROM rooms
      WHERE rooms.daycare_id IN (
        SELECT users.daycare_id
        FROM users
        WHERE users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can insert children in their daycare"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (
    room_id IN (
      SELECT rooms.id
      FROM rooms
      WHERE rooms.daycare_id IN (
        SELECT users.daycare_id
        FROM users
        WHERE users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can update children in their daycare"
  ON children FOR UPDATE
  TO authenticated
  USING (
    room_id IN (
      SELECT rooms.id
      FROM rooms
      WHERE rooms.daycare_id IN (
        SELECT users.daycare_id
        FROM users
        WHERE users.id = auth.uid()
      )
    )
  )
  WITH CHECK (
    room_id IN (
      SELECT rooms.id
      FROM rooms
      WHERE rooms.daycare_id IN (
        SELECT users.daycare_id
        FROM users
        WHERE users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can delete children in their daycare"
  ON children FOR DELETE
  TO authenticated
  USING (
    room_id IN (
      SELECT rooms.id
      FROM rooms
      WHERE rooms.daycare_id IN (
        SELECT users.daycare_id
        FROM users
        WHERE users.id = auth.uid()
      )
    )
  );

-- ============================================
-- SEED: 3 salas iniciales
-- ============================================

INSERT INTO rooms (daycare_id, name)
SELECT id, 'Soles' FROM daycares LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO rooms (daycare_id, name)
SELECT id, 'Lunas' FROM daycares LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO rooms (daycare_id, name)
SELECT id, 'Estrellas' FROM daycares LIMIT 1
ON CONFLICT DO NOTHING;
