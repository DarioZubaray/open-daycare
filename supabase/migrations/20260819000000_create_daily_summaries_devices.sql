-- ============================================
-- TABLE: daily_summaries
-- ============================================

CREATE TABLE daily_summaries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id          uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  date              date NOT NULL,
  meals_count       int NOT NULL DEFAULT 0,
  sleep_minutes     int NOT NULL DEFAULT 0,
  activities_count  int NOT NULL DEFAULT 0,
  mood              text,
  highlight         text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, date)
);

CREATE INDEX idx_daily_summaries_child_id ON daily_summaries(child_id);
CREATE INDEX idx_daily_summaries_date ON daily_summaries(date);

-- ============================================
-- TABLE: devices
-- ============================================

CREATE TABLE devices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      text NOT NULL,
  platform   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_token ON devices(token);

-- ============================================
-- ROW LEVEL SECURITY: daily_summaries
-- ============================================

ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on daily_summaries"
  ON daily_summaries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Staff can view daily_summaries in their daycare"
  ON daily_summaries FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT children.id
      FROM children
      WHERE children.room_id IN (
        SELECT rooms.id
        FROM rooms
        WHERE rooms.daycare_id IN (
          SELECT users.daycare_id
          FROM users
          WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
      )
    )
  );

CREATE POLICY "Parents can view daily_summaries of their children"
  ON daily_summaries FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT parent_children.child_id
      FROM parent_children
      WHERE parent_children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert daily_summaries in their daycare"
  ON daily_summaries FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT children.id
      FROM children
      WHERE children.room_id IN (
        SELECT rooms.id
        FROM rooms
        WHERE rooms.daycare_id IN (
          SELECT users.daycare_id
          FROM users
          WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
      )
    )
  );

CREATE POLICY "Staff can update daily_summaries in their daycare"
  ON daily_summaries FOR UPDATE
  TO authenticated
  USING (
    child_id IN (
      SELECT children.id
      FROM children
      WHERE children.room_id IN (
        SELECT rooms.id
        FROM rooms
        WHERE rooms.daycare_id IN (
          SELECT users.daycare_id
          FROM users
          WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
      )
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT children.id
      FROM children
      WHERE children.room_id IN (
        SELECT rooms.id
        FROM rooms
        WHERE rooms.daycare_id IN (
          SELECT users.daycare_id
          FROM users
          WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
      )
    )
  );

-- ============================================
-- ROW LEVEL SECURITY: devices
-- ============================================

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on devices"
  ON devices FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own devices"
  ON devices FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own devices"
  ON devices FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
