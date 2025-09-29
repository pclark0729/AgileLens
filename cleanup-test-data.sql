-- Clean up all existing test data from AgileLens
-- Run this in your Supabase SQL Editor to delete all test data

-- WARNING: This will delete ALL data from the application
-- Make sure you have backups if needed

-- First, let's see what data exists
SELECT 'Current data counts:' as info;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Sprints' as table_name, COUNT(*) as count FROM sprints
UNION ALL
SELECT 'Forecasts' as table_name, COUNT(*) as count FROM forecasts;

-- Delete in reverse order of dependencies to avoid foreign key constraints
-- 1. Delete forecasts first (they reference sprints)
DELETE FROM forecasts;

-- 2. Delete sprints (they reference teams)
DELETE FROM sprints;

-- 3. Delete users (they reference teams)
DELETE FROM users;

-- 4. Delete teams
DELETE FROM teams;

-- Verify cleanup
SELECT 'After cleanup:' as info;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Sprints' as table_name, COUNT(*) as count FROM sprints
UNION ALL
SELECT 'Forecasts' as table_name, COUNT(*) as count FROM forecasts;

-- Reset any auto-increment sequences if they exist
-- (PostgreSQL doesn't have auto-increment, but this is here for completeness)
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS teams_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS sprints_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS forecasts_id_seq RESTART WITH 1;

SELECT 'Cleanup completed successfully!' as result;

