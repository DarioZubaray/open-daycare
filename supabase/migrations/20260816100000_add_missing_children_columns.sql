-- ============================================
-- ALTER TABLE: children — add missing columns
-- ============================================

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
