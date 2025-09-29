# 🔒 Data Isolation Setup Guide

This guide explains how to implement proper data isolation in AgileLens to ensure that each user's data is completely separated from other users.

## 🚨 Current Issue

The application currently has a data sharing problem where:
- All users can see each other's sprint data
- CSV imports go to a shared "Default Team" 
- RLS policies are too permissive
- Users can see all teams in the system

## ✅ Solution Overview

The fix implements complete data isolation by:
1. **Individual Teams**: Each user gets their own team automatically
2. **Strict RLS Policies**: Users can only see their own team's data
3. **Team-based Access**: All data is filtered by the user's team_id
4. **Automatic Team Creation**: Database triggers create teams for new users

## 🛠️ Implementation Steps

### Step 1: Apply Database Changes

Run the following SQL in your Supabase SQL Editor:

```sql
-- Run the contents of proper-rls-policies.sql
-- This will:
-- 1. Enable RLS on all tables
-- 2. Create strict policies for data isolation
-- 3. Create a trigger to auto-assign users to teams
-- 4. Migrate existing users to individual teams
```

### Step 2: Verify the Changes

After running the SQL, verify that:

1. **Each user has their own team**:
   ```sql
   SELECT u.name, u.email, t.name as team_name 
   FROM users u 
   JOIN teams t ON u.team_id = t.id;
   ```

2. **RLS policies are active**:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

### Step 3: Test Data Isolation

1. **Create two test accounts** with different email addresses
2. **Import different CSV data** for each account
3. **Verify each account only sees their own data**:
   - Sprint data should be completely separate
   - Teams should only show their own team
   - No cross-contamination of data

## 🔧 Code Changes Made

### 1. CSV Import (`src/components/CSVImport.tsx`)
- ✅ Removed fallback to "Default Team"
- ✅ Added validation to ensure user has a team
- ✅ Only imports data to user's assigned team

### 2. Team Switcher (`src/components/TeamSwitcher.tsx`)
- ✅ Only shows teams the user belongs to
- ✅ Fetches user's team_id from their profile
- ✅ No longer shows all teams in the system

### 3. Team Management (`src/components/TeamManagement.tsx`)
- ✅ Only shows teams the user has access to
- ✅ Prevents users from seeing other teams' data

### 4. Authentication (`src/lib/auth-context.tsx`)
- ✅ Updated user creation to work with team assignment
- ✅ Handles the automatic team creation process

## 🗄️ Database Schema

The solution uses this data model:

```
users (id, email, name, team_id, role, created_at)
  ↓
teams (id, name, created_at)
  ↓
sprints (id, team_id, sprint_name, ...)
  ↓
forecasts (id, team_id, sprint_id, ...)
```

**Key Points:**
- Each user belongs to exactly one team
- Each team has its own sprints and forecasts
- RLS policies enforce team-based access
- Database triggers automatically create teams for new users

## 🔒 Security Features

### Row Level Security (RLS)
- **Users table**: Users can only see/modify their own profile
- **Teams table**: Users can only see their own team
- **Sprints table**: Users can only see sprints from their team
- **Forecasts table**: Users can only see forecasts for their team's sprints

### Data Isolation
- **Complete separation**: No data sharing between users
- **Automatic team creation**: Each new user gets their own team
- **Strict access control**: All queries filtered by team_id

## 🧪 Testing Checklist

- [ ] Create two test accounts
- [ ] Import different CSV data for each account
- [ ] Verify each account only sees their own data
- [ ] Test that users cannot see other teams
- [ ] Verify CSV import only works with assigned teams
- [ ] Test that new users automatically get their own team
- [ ] Verify RLS policies are working correctly

## 🚀 Deployment

1. **Run the SQL migration** in your Supabase project
2. **Deploy the updated code** to your hosting platform
3. **Test with multiple accounts** to verify isolation
4. **Monitor for any data leakage** in production

## 🔍 Troubleshooting

### If users still see shared data:
1. Check that RLS policies are active: `SELECT * FROM pg_policies;`
2. Verify user team assignments: `SELECT * FROM users WHERE team_id IS NULL;`
3. Check that the database trigger is working

### If CSV import fails:
1. Ensure user has a team_id assigned
2. Check that the team exists in the database
3. Verify RLS policies allow the user to insert sprints

### If new users don't get teams:
1. Check that the database trigger is installed
2. Verify the trigger function is working
3. Check Supabase logs for trigger errors

## 📊 Expected Results

After implementing this solution:
- ✅ Each user has their own isolated data
- ✅ No data sharing between accounts
- ✅ Automatic team creation for new users
- ✅ Strict access control via RLS
- ✅ CSV imports go to the correct team
- ✅ Complete data privacy and security

This ensures that AgileLens is truly multi-tenant with complete data isolation between users.

