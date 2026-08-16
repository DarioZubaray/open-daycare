-- ============================================
-- ALTER TABLE: users — add missing columns
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_on_post boolean NOT NULL DEFAULT true;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS daily_summary_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
