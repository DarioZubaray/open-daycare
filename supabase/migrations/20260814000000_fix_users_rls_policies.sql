-- Fix: Replace self-referential RLS policies on users that caused 500 errors
-- The previous policies queried the users table from within RLS policies on the
-- same users table, which PostgREST cannot evaluate correctly.
--
-- Solution: Use only auth.uid() = id comparisons (no self-referential subqueries).

-- Drop all existing policies on users
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can view same daycare" ON public.users;
DROP POLICY IF EXISTS "Users can update same daycare" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Recreate with simple, non-self-referential policies
CREATE POLICY "Service role full access"
  ON public.users FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (( SELECT auth.uid() AS uid) = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (( SELECT auth.uid() AS uid) = id)
  WITH CHECK (( SELECT auth.uid() AS uid) = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (( SELECT auth.uid() AS uid) = id);
