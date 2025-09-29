# 🧹 Data Cleanup Guide

This guide helps you clean up existing test data from AgileLens before implementing proper data isolation.

## 🚨 Important: Choose Your Cleanup Strategy

You have several options depending on your needs:

### Option 1: Complete Cleanup (Recommended for Fresh Start)
**Use this if you want to start completely fresh**

```sql
-- Run the contents of cleanup-test-data.sql
-- This will delete ALL data from the application
```

**What gets deleted:**
- ✅ All user accounts
- ✅ All teams
- ✅ All sprint data
- ✅ All forecast data

**When to use:**
- Starting fresh with the new data isolation system
- No important data to preserve
- Testing the complete user registration flow

### Option 2: Keep Users, Clean Data (Recommended for Existing Users)
**Use this if you want to keep user accounts but clean their data**

```sql
-- Delete forecasts and sprints but keep users and teams
DELETE FROM forecasts;
DELETE FROM sprints;

-- Reset users to have no team (they'll get new teams when they log in)
UPDATE users SET team_id = NULL;
```

**What gets deleted:**
- ✅ All sprint data
- ✅ All forecast data
- ✅ User team assignments (users will get new individual teams)

**What gets kept:**
- ✅ User accounts and profiles
- ✅ Team records (but users will be reassigned)

### Option 3: Clean Only Shared Data (Safest)
**Use this if you want to remove only the problematic shared data**

```sql
-- Delete data from the default team
DELETE FROM forecasts WHERE team_id = '00000000-0000-0000-0000-000000000000';
DELETE FROM sprints WHERE team_id = '00000000-0000-0000-0000-000000000000';

-- Remove users from the default team
UPDATE users SET team_id = NULL WHERE team_id = '00000000-0000-0000-0000-000000000000';

-- Delete the default team itself
DELETE FROM teams WHERE id = '00000000-0000-0000-0000-000000000000';
```

**What gets deleted:**
- ✅ Data from the shared "Default Team"
- ✅ Users assigned to the default team

**What gets kept:**
- ✅ Individual user data (if any)
- ✅ User accounts

## 🛠️ Step-by-Step Cleanup Process

### Step 1: Backup Your Data (Optional but Recommended)
```sql
-- Create backup tables (run this first)
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE teams_backup AS SELECT * FROM teams;
CREATE TABLE sprints_backup AS SELECT * FROM sprints;
CREATE TABLE forecasts_backup AS SELECT * FROM forecasts;
```

### Step 2: Check Current Data
```sql
-- See what data you currently have
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Sprints' as table_name, COUNT(*) as count FROM sprints
UNION ALL
SELECT 'Forecasts' as table_name, COUNT(*) as count FROM forecasts;
```

### Step 3: Choose and Run Your Cleanup Strategy
- **For complete cleanup**: Run `cleanup-test-data.sql`
- **For selective cleanup**: Run `selective-cleanup.sql` and uncomment your chosen option

### Step 4: Verify Cleanup
```sql
-- Check that data has been removed
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Sprints' as table_name, COUNT(*) as count FROM sprints
UNION ALL
SELECT 'Forecasts' as table_name, COUNT(*) as count FROM forecasts;
```

### Step 5: Apply Data Isolation Fixes
After cleanup, run the data isolation setup:
1. Run `proper-rls-policies.sql` in your Supabase SQL Editor
2. Deploy the updated application code
3. Test with new user accounts

## 🔍 Verification Checklist

After running your chosen cleanup strategy, verify:

- [ ] **No shared data remains** - Check that no data is shared between users
- [ ] **Users are properly isolated** - Each user should only see their own data
- [ ] **New users get individual teams** - Test creating new accounts
- [ ] **CSV imports work correctly** - Import data and verify it goes to the right team
- [ ] **RLS policies are active** - Users cannot see other users' data

## 🚀 Recommended Workflow

For a complete fresh start with proper data isolation:

1. **Run complete cleanup** (`cleanup-test-data.sql`)
2. **Apply data isolation fixes** (`proper-rls-policies.sql`)
3. **Deploy updated code**
4. **Test with multiple accounts**
5. **Import test data for each account**
6. **Verify complete data separation**

## ⚠️ Important Notes

- **This action cannot be undone** - Make sure you have backups if needed
- **Test in a development environment first** - Don't run this on production without testing
- **Coordinate with team members** - Let users know their data will be cleaned
- **Verify RLS policies are working** - After cleanup, ensure data isolation is properly implemented

## 🆘 If Something Goes Wrong

If you need to restore data:

```sql
-- Restore from backup tables
INSERT INTO users SELECT * FROM users_backup;
INSERT INTO teams SELECT * FROM teams_backup;
INSERT INTO sprints SELECT * FROM sprints_backup;
INSERT INTO forecasts SELECT * FROM forecasts_backup;
```

This cleanup process ensures you start fresh with proper data isolation, where each user's data is completely separated from others.

