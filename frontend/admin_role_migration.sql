-- =============================================
-- Admin Role Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add role column to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
  CHECK (role IN ('user', 'admin'));

-- =============================================
-- 2. Skills Library table (for Admin AI Config tab)
-- =============================================
CREATE TABLE IF NOT EXISTS skills_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'tool', 'framework', 'soft_skill', 'language')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE skills_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills library is publicly viewable" ON skills_library
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage skills library" ON skills_library
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- 3. Admin profile policies (non-recursive)
-- =============================================

-- Drop old recursive policies if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;

-- Admins can update any profile (using JWT, not recursion)
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = id 
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- Admins can delete any profile
CREATE POLICY "Admins can delete any profile" ON profiles
  FOR DELETE USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- =============================================
-- 4. Set yourself as admin (replace email below)
-- =============================================
-- UPDATE profiles SET role = 'admin'
-- WHERE email = 'your-admin-email@example.com';
