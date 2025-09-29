# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. "new row violates row-level security policy for table 'users'"

**Problem**: This error occurs when trying to sign up a new user.

**Root Cause**: The Row Level Security (RLS) policies don't allow inserting new user records.

**Solution**:

1. **Run the RLS fix script**:
   ```sql
   -- Run this in your Supabase SQL Editor
   DROP POLICY IF EXISTS "Users can view their own data" ON users;
   DROP POLICY IF EXISTS "Users can update their own data" ON users;

   CREATE POLICY "Users can view their own data" ON users
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can insert their own data" ON users
     FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update their own data" ON users
     FOR UPDATE USING (auth.uid() = id);
   ```

2. **Alternative**: Use the complete setup from `SETUP.md` which includes the correct RLS policies.

### 2. Blank Screen on Load

**Problem**: The app shows a blank screen when running `npm run dev`.

**Root Cause**: Missing environment variables.

**Solution**:
1. Create `.env.local` file with Supabase credentials
2. Restart the development server
3. The app will show a setup guide if configuration is missing

### 3. Authentication Issues

**Problem**: Users can't sign in or sign up.

**Solutions**:
- Check Supabase project is active
- Verify environment variables are correct
- Ensure RLS policies are properly configured
- Check Supabase Auth settings

### 4. Database Connection Issues

**Problem**: Can't connect to Supabase database.

**Solutions**:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project status
- Ensure database is not paused
- Verify network connectivity

### 5. AI Features Not Working

**Problem**: AI forecasting doesn't work.

**Solutions**:
- Check `VITE_OPENROUTER_API_KEY` is set
- Verify OpenRouter API key is valid
- Check Edge Function is deployed
- Monitor API usage limits

### 6. Email Verification Issues

**Problem**: Users can't complete sign-up or don't receive verification emails.

**Solutions**:
- Check Supabase Auth settings → Enable email confirmations
- Verify site URL is configured correctly
- Check spam/junk folders
- Ensure email templates are properly configured
- Check Supabase email delivery logs

### 7. User Profile Not Created

**Problem**: User can sign in but profile doesn't exist in database.

**Solutions**:
- This is normal - profiles are created after email verification
- Check RLS policies allow user creation
- Verify user is properly authenticated
- Check browser console for errors

## Debug Steps

### 1. Check Browser Console
Open browser DevTools (F12) and look for error messages in the Console tab.

### 2. Check Network Tab
Look for failed API requests in the Network tab.

### 3. Check Supabase Logs
Go to your Supabase dashboard → Logs to see server-side errors.

### 4. Enable Debug Mode
Add this to your `.env.local`:
```env
VITE_DEBUG=true
```

## Quick Fixes

### Reset Database
If you need to start fresh:
1. Go to Supabase dashboard
2. Delete the project
3. Create a new project
4. Run the setup from `SETUP.md`

### Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

## Getting Help

1. **Check the logs**: Browser console and Supabase logs
2. **Verify configuration**: Environment variables and database setup
3. **Test step by step**: Start with basic auth, then add features
4. **Check documentation**: README.md, SETUP.md, DEPLOYMENT.md

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing Supabase environment variables" | No .env.local file | Create .env.local with credentials |
| "RLS policy violation" | Incorrect database policies | Run RLS fix script |
| "Invalid API key" | Wrong Supabase key | Check environment variables |
| "Network error" | Connection issue | Check Supabase project status |
| "Function not found" | Edge Function not deployed | Deploy Edge Functions |

## Still Having Issues?

1. Check the GitHub issues
2. Review the setup documentation
3. Verify all steps were completed correctly
4. Test with a fresh Supabase project
