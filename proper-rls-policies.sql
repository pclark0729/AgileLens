-- Proper RLS policies for AgileLens - Ensures complete data isolation between users/teams
-- Run this in your Supabase SQL Editor

-- First, ensure all tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
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
DROP POLICY IF EXISTS "Authenticated users can view sprints" ON sprints;
DROP POLICY IF EXISTS "Authenticated users can insert sprints" ON sprints;
DROP POLICY IF EXISTS "Authenticated users can update sprints" ON sprints;
DROP POLICY IF EXISTS "Authenticated users can delete sprints" ON sprints;
DROP POLICY IF EXISTS "Authenticated users can view forecasts" ON forecasts;
DROP POLICY IF EXISTS "Authenticated users can insert forecasts" ON forecasts;
DROP POLICY IF EXISTS "Authenticated users can update forecasts" ON forecasts;
DROP POLICY IF EXISTS "Authenticated users can delete forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can view team sprints" ON sprints;
DROP POLICY IF EXISTS "Users can insert team sprints" ON sprints;
DROP POLICY IF EXISTS "Users can update team sprints" ON sprints;
DROP POLICY IF EXISTS "Users can delete team sprints" ON sprints;
DROP POLICY IF EXISTS "Users can view team forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can insert team forecasts" ON forecasts;

-- Users table policies - users can only see and modify their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams table policies - users can only see teams they belong to
CREATE POLICY "Users can view their own team" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

-- Sprints table policies - users can only see/modify sprints from their team
CREATE POLICY "Users can view team sprints" ON sprints
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert team sprints" ON sprints
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update team sprints" ON sprints
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete team sprints" ON sprints
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

-- Forecasts table policies - users can only see/modify forecasts for their team's sprints
CREATE POLICY "Users can view team forecasts" ON forecasts
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert team forecasts" ON forecasts
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update team forecasts" ON forecasts
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete team forecasts" ON forecasts
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM users WHERE id = auth.uid()
    )
  );

-- Create a function to automatically assign users to teams when they sign up
-- This ensures every user gets their own team
CREATE OR REPLACE FUNCTION create_user_team()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a new team for the user
  INSERT INTO teams (id, name, created_at)
  VALUES (
    gen_random_uuid(),
    COALESCE(NEW.name || '''s Team', 'My Team'),
    NOW()
  );
  
  -- Update the user's team_id to the newly created team
  UPDATE users 
  SET team_id = (
    SELECT id FROM teams 
    WHERE name = COALESCE(NEW.name || '''s Team', 'My Team')
    ORDER BY created_at DESC 
    LIMIT 1
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create a team for new users
DROP TRIGGER IF EXISTS create_user_team_trigger ON users;
CREATE TRIGGER create_user_team_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_team();

-- Update existing users who don't have a team_id
-- This will create individual teams for existing users
DO $$
DECLARE
  user_record RECORD;
  new_team_id UUID;
BEGIN
  FOR user_record IN 
    SELECT id, name FROM users WHERE team_id IS NULL
  LOOP
    -- Create a new team for this user
    new_team_id := gen_random_uuid();
    
    INSERT INTO teams (id, name, created_at)
    VALUES (
      new_team_id,
      COALESCE(user_record.name || '''s Team', 'My Team'),
      NOW()
    );
    
    -- Update the user's team_id
    UPDATE users 
    SET team_id = new_team_id
    WHERE id = user_record.id;
  END LOOP;
END $$;

