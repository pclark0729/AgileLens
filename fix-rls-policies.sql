-- Fix RLS policies for AgileLens
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create proper RLS policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also create policies for sprints table (using team_id)
DROP POLICY IF EXISTS "Users can view their own sprints" ON sprints;
DROP POLICY IF EXISTS "Users can insert their own sprints" ON sprints;
DROP POLICY IF EXISTS "Users can update their own sprints" ON sprints;
DROP POLICY IF EXISTS "Users can delete their own sprints" ON sprints;

CREATE POLICY "Users can view their own sprints" ON sprints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.team_id = sprints.team_id
    )
  );

CREATE POLICY "Users can insert their own sprints" ON sprints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.team_id = sprints.team_id
    )
  );

CREATE POLICY "Users can update their own sprints" ON sprints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.team_id = sprints.team_id
    )
  );

CREATE POLICY "Users can delete their own sprints" ON sprints
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.team_id = sprints.team_id
    )
  );

-- Create policies for forecasts table (using team_id)
DROP POLICY IF EXISTS "Users can view their own forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can insert their own forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can update their own forecasts" ON forecasts;
DROP POLICY IF EXISTS "Users can delete their own forecasts" ON forecasts;

CREATE POLICY "Users can view their own forecasts" ON forecasts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sprints 
      JOIN users ON users.team_id = sprints.team_id
      WHERE sprints.id = forecasts.sprint_id 
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own forecasts" ON forecasts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprints 
      JOIN users ON users.team_id = sprints.team_id
      WHERE sprints.id = forecasts.sprint_id 
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own forecasts" ON forecasts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sprints 
      JOIN users ON users.team_id = sprints.team_id
      WHERE sprints.id = forecasts.sprint_id 
      AND users.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own forecasts" ON forecasts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sprints 
      JOIN users ON users.team_id = sprints.team_id
      WHERE sprints.id = forecasts.sprint_id 
      AND users.id = auth.uid()
    )
  );