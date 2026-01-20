-- Resume Data Persistence Schema
-- Execute this in Supabase SQL Editor

-- 1. Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. User Skills with Categories
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT NOT NULL CHECK (skill_category IN ('technical', 'tool', 'framework', 'soft_skill', 'language')),
  proficiency_level TEXT CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  years_of_experience DECIMAL(3,1),
  source TEXT DEFAULT 'resume' CHECK (source IN ('resume', 'manual', 'skill-gap')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- 3. User Education
CREATE TABLE IF NOT EXISTS user_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. User Certifications
CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. User Work Experience
CREATE TABLE IF NOT EXISTS user_work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  achievements TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Resume Analysis History
CREATE TABLE IF NOT EXISTS resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  file_type TEXT,
  score INTEGER,
  strengths TEXT[],
  weaknesses TEXT[],
  suggestions TEXT[],
  keywords TEXT[],
  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_education_user_id ON user_education(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_work_experience_user_id ON user_work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own skills" ON user_skills
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skills" ON user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON user_skills
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON user_skills
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own education" ON user_education
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own education" ON user_education
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON user_education
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON user_education
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certifications" ON user_certifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certifications" ON user_certifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certifications" ON user_certifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own certifications" ON user_certifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own work experience" ON user_work_experience
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own work experience" ON user_work_experience
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work experience" ON user_work_experience
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own work experience" ON user_work_experience
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume analyses" ON resume_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resume analyses" ON resume_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
