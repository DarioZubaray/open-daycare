-- ============================================
-- ENUM: post_type
-- ============================================

CREATE TYPE post_type AS ENUM ('meal', 'nap', 'activity', 'achievement', 'photo', 'announcement');

-- ============================================
-- TABLE: posts
-- ============================================

CREATE TABLE posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id      uuid REFERENCES rooms(id) ON DELETE SET NULL,
  type         post_type NOT NULL,
  title        text,
  body         text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_room_id ON posts(room_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);

-- ============================================
-- TABLE: post_children
-- ============================================

CREATE TABLE post_children (
  post_id  uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, child_id)
);

CREATE INDEX idx_post_children_child_id ON post_children(child_id);

-- ============================================
-- TABLE: post_photos
-- ============================================

CREATE TABLE post_photos (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url       text NOT NULL,
  width     int,
  height    int,
  position  int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_photos_post_id ON post_photos(post_id);

-- ============================================
-- ROW LEVEL SECURITY: posts
-- ============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on posts"
  ON posts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Staff can view posts in their daycare"
  ON posts FOR SELECT
  TO authenticated
  USING (
    author_id IN (
      SELECT users.id
      FROM users
      WHERE users.daycare_id IN (
        SELECT users2.daycare_id
        FROM users users2
        WHERE users2.id = auth.uid()
          AND users2.role = 'staff'
      )
    )
      OR room_id IN (
        SELECT rooms.id
        FROM rooms
        WHERE rooms.daycare_id IN (
          SELECT users.daycare_id
          FROM users
          WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
      )
  );

CREATE POLICY "Parents can view posts tagging their children"
  ON posts FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT post_children.post_id
      FROM post_children
      WHERE post_children.child_id IN (
        SELECT parent_children.child_id
        FROM parent_children
        WHERE parent_children.parent_id = auth.uid()
      )
    )
      OR (
        type = 'announcement'
        AND room_id IN (
          SELECT children.room_id
          FROM children
          WHERE children.id IN (
            SELECT parent_children.child_id
            FROM parent_children
            WHERE parent_children.parent_id = auth.uid()
          )
        )
      )
  );

CREATE POLICY "Staff can insert posts in their daycare"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
      AND (
        room_id IS NULL
        OR room_id IN (
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

CREATE POLICY "Staff can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Staff can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ============================================
-- ROW LEVEL SECURITY: post_children
-- ============================================

ALTER TABLE post_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on post_children"
  ON post_children FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view post_children for visible posts"
  ON post_children FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert post_children for their posts"
  ON post_children FOR INSERT
  TO authenticated
  WITH CHECK (
    post_id IN (
      SELECT posts.id
      FROM posts
      WHERE posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Staff can delete post_children for their posts"
  ON post_children FOR DELETE
  TO authenticated
  USING (
    post_id IN (
      SELECT posts.id
      FROM posts
      WHERE posts.author_id = auth.uid()
    )
  );

-- ============================================
-- ROW LEVEL SECURITY: post_photos
-- ============================================

ALTER TABLE post_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on post_photos"
  ON post_photos FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view post_photos for visible posts"
  ON post_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert post_photos for their posts"
  ON post_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    post_id IN (
      SELECT posts.id
      FROM posts
      WHERE posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Staff can delete post_photos for their posts"
  ON post_photos FOR DELETE
  TO authenticated
  USING (
    post_id IN (
      SELECT posts.id
      FROM posts
      WHERE posts.author_id = auth.uid()
    )
  );
