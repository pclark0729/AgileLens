-- Simple RLS fix for AgileLens
-- This creates a basic setup that works without teams

-- First, create a default team for all users
INSERT INTO teams (id, name, created_at) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Team', NOW())
ON CONFLICT (id) DO NOTHING;

-- Update all users to be in the default team
UPDATE users SET team_id = '00000000-0000-0000-0000-000000000000' WHERE team_id IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own sprints" ON sprints;
DROP POLICY IF EXISTS "Users can insert their own sprints" ON sprints;
DROP POLICY IF EXISTS "Users can update their own sprints" ON sprints;
DROP POLICY IF EXISTS "Users can delete their own sprints" ON sprints;
DROP POLICY IF EXISTS "Users can view their own forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can insert their own forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can update their own forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can delete their own forecasts" ON forecasts;

-- Create simple RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create simple RLS policies for sprints table (allow all authenticated users for now)
CREATE POLICY "Authenticated users can view sprints" ON sprints
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sprints" ON sprints
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sprints" ON sprints
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete sprints" ON sprints
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create simple RLS policies for forecasts table
CREATE POLICY "Authenticated users can view forecasts" ON forecasts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert forecasts" ON forecasts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update forecasts" ON forecasts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete forecasts" ON forecasts
  FOR DELETE USING (auth.uid() IS NOT NULL);
