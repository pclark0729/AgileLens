-- Selective cleanup script for AgileLens
-- Choose one of the options below based on your needs

-- OPTION 1: Complete cleanup (delete everything)
-- Uncomment the lines below if you want to delete ALL data

/*
-- Delete in reverse order of dependencies
DELETE FROM forecasts;
DELETE FROM sprints;
DELETE FROM users;
DELETE FROM teams;
*/

-- OPTION 2: Keep users but clean their data (recommended)
-- This keeps user accounts but removes all their sprint data
-- Uncomment the lines below to clean user data while keeping accounts


-- Delete forecasts and sprints but keep users and teams
DELETE FROM forecasts;
DELETE FROM sprints;

-- Optional: Reset users to have no team (they'll get new teams when they log in)
UPDATE users SET team_id = NULL;


-- OPTION 3: Clean only shared/default team data
-- This removes data from the shared "Default Team" but keeps individual user data
-- Uncomment the lines below to clean only shared data

/*
-- Delete data from the default team (00000000-0000-0000-0000-000000000000)
DELETE FROM forecasts WHERE team_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM sprints WHERE team_id = '00000000-0000-0000-0000-000000000000';

-- Remove users from the default team
UPDATE users SET team_id = NULL WHERE team_id = '00000000-0000-0000-0000-000000000000';

-- Delete the default team itself
DELETE FROM teams WHERE id = '00000000-0000-0000-0000-000000000000';
*/

-- Check current data before cleanup
SELECT 'BEFORE CLEANUP:' as status;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Sprints' as table_name, COUNT(*) as count FROM sprints
UNION ALL
SELECT 'Forecasts' as table_name, COUNT(*) as count FROM forecasts;

-- Show teams and their data
SELECT 'Teams and their data:' as info;
SELECT 
    t.name as team_name,
    t.id as team_id,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT s.id) as sprint_count,
    COUNT(DISTINCT f.id) as forecast_count
FROM teams t
LEFT JOIN users u ON t.id = u.team_id
LEFT JOIN sprints s ON t.id = s.team_id
LEFT JOIN forecasts f ON t.id = f.team_id
GROUP BY t.id, t.name
ORDER BY t.created_at;

-- After running your chosen cleanup option, run this to verify:
/*
SELECT 'AFTER CLEANUP:' as status;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Sprints' as table_name, COUNT(*) as count FROM sprints
UNION ALL
SELECT 'Forecasts' as table_name, COUNT(*) as count FROM forecasts;
*/

