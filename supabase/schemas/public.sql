-- OpenDayCare: public schema
-- Declarative schema definition

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active');
CREATE TYPE child_status AS ENUM ('active', 'archived');
CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
CREATE TYPE post_type AS ENUM ('meal', 'nap', 'activity', 'achievement', 'photo', 'announcement');

-- ============================================
-- TABLES
-- ============================================

-- daycares
CREATE TABLE daycares (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  address    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- users
CREATE TABLE users (
  id                     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daycare_id             uuid REFERENCES daycares(id),
  role                   user_role NOT NULL,
  status                 user_status NOT NULL DEFAULT 'active',
  full_name              text NOT NULL,
  avatar_url             text,
  notify_on_post         boolean NOT NULL DEFAULT true,
  daily_summary_enabled  boolean NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_daycare_id ON users(daycare_id);

-- rooms
CREATE TABLE rooms (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daycare_id uuid NOT NULL REFERENCES daycares(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- children
CREATE TABLE children (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id        uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  full_name      text NOT NULL,
  birth_date     date NOT NULL,
  enrolled_at    date NOT NULL DEFAULT current_date,
  medical_notes  text,
  allergy_tags   text[] DEFAULT '{}',
  photo_consent  boolean NOT NULL DEFAULT true,
  status         child_status NOT NULL DEFAULT 'active',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- parent_children
CREATE TABLE parent_children (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id     uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  relationship relationship_type NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, child_id)
);

CREATE INDEX idx_parent_children_parent_id ON parent_children(parent_id);
CREATE INDEX idx_parent_children_child_id ON parent_children(child_id);

-- invitations
CREATE TABLE invitations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  invited_by   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name    text NOT NULL,
  email        text NOT NULL,
  relationship relationship_type NOT NULL,
  code         text UNIQUE NOT NULL,
  status       invitation_status NOT NULL DEFAULT 'pending',
  expires_at   timestamptz NOT NULL,
  accepted_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_child_id ON invitations(child_id);
CREATE INDEX idx_invitations_code ON invitations(code);

-- posts
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

-- post_children
CREATE TABLE post_children (
  post_id  uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, child_id)
);

CREATE INDEX idx_post_children_child_id ON post_children(child_id);

-- post_photos
CREATE TABLE post_photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  url        text NOT NULL,
  width      int,
  height     int,
  position   int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_photos_post_id ON post_photos(post_id);

-- reactions
CREATE TABLE reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       text NOT NULL DEFAULT 'love',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);

-- comments
CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- daily_summaries
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

-- devices
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
-- ROW LEVEL SECURITY
-- ============================================

-- daycares RLS
ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on daycares"
  ON daycares FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid() AS uid) = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid() AS uid) = id)
  WITH CHECK ((SELECT auth.uid() AS uid) = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid() AS uid) = id);

-- rooms RLS
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

-- children RLS
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

-- parent_children RLS
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on parent_children"
  ON parent_children FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own parent_children links"
  ON parent_children FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Staff can insert parent_children in their daycare"
  ON parent_children FOR INSERT
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

CREATE POLICY "Staff can delete parent_children in their daycare"
  ON parent_children FOR DELETE
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

-- invitations RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invitations"
  ON invitations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Staff can view invitations in their daycare"
  ON invitations FOR SELECT
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

CREATE POLICY "Staff can insert invitations in their daycare"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND child_id IN (
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

CREATE POLICY "Staff can update invitations in their daycare"
  ON invitations FOR UPDATE
  TO authenticated
  USING (
    invited_by = auth.uid()
    AND child_id IN (
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
    invited_by = auth.uid()
    AND child_id IN (
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

CREATE POLICY "Anyone can view invitation by code"
  ON invitations FOR SELECT
  TO authenticated
  USING (true);

-- posts RLS
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

-- post_children RLS
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

-- post_photos RLS
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

-- reactions RLS
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on reactions"
  ON reactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view reactions on visible posts"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on comments"
  ON comments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view comments on visible posts"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- daily_summaries RLS
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

-- devices RLS
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

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, daycare_id, role, full_name)
  VALUES (
    new.id,
    (new.raw_user_meta_data ->> 'daycare_id')::uuid,
    (new.raw_user_meta_data ->> 'role')::user_role,
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
