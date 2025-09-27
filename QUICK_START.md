# 🚀 Quick Start Guide

## The Issue: Blank Screen

If you're seeing a blank screen when running `npm run dev`, it's because the required environment variables are not configured.

## ✅ Solution

### 1. Create Environment File

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API (for AI forecasting)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon public** key
5. Replace the placeholder values in your `.env.local` file

### 3. Set up Database

Run the SQL commands from `SETUP.md` in your Supabase SQL editor to create the required tables.

### 4. Restart Development Server

```bash
npm run dev
```

## 🎉 Result

After completing these steps, you should see:
- A beautiful setup guide (if environment variables are missing)
- The full AgileLens application (once properly configured)

## 📚 Next Steps

1. Follow the detailed `SETUP.md` guide for complete database setup
2. Check `DEPLOYMENT.md` for production deployment
3. Read `README.md` for feature overview

## 🆘 Need Help?

- Check the browser console for any error messages
- Ensure all environment variables are correctly set
- Verify your Supabase project is active
- Make sure the database schema is properly set up

The app now gracefully handles missing configuration and provides clear instructions! 🚀
