# AgileLens Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with the following setup:

### Prerequisites

1. **Supabase Project**: You need a Supabase project with the following tables:
   - `users` (with RLS policies)
   - `teams` (with RLS policies)
   - `sprints` (with RLS policies)
   - `forecasts` (with RLS policies)

2. **Environment Variables**: Set up the following environment variables in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Deployment Steps

1. **Connect to Vercel**:
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to Vercel
   - Vercel will automatically detect this as a Vite project

2. **Set Environment Variables**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Deploy**:
   - Vercel will automatically build and deploy your project
   - The build process runs: `npm run build:vercel`
   - This includes TypeScript type checking and Vite build

### Build Configuration

- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Node Version**: 18.x (recommended)

### File Structure

```
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore during deployment
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

### Environment Variables

Create a `.env.local` file for local development:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Make sure your Supabase database has the following tables with proper RLS policies:

1. **users** - User profiles
2. **teams** - Team management
3. **sprints** - Sprint data
4. **forecasts** - AI-generated forecasts

### Troubleshooting

1. **Build Failures**: Check that all environment variables are set correctly
2. **Type Errors**: Run `npm run type-check` locally to verify TypeScript compilation
3. **Supabase Connection**: Verify your Supabase URL and key are correct
4. **RLS Policies**: Ensure your Supabase RLS policies allow the necessary operations

### Local Testing

Before deploying, test the build locally:

```bash
npm run build:vercel
npm run preview
```

This will build the project and serve it locally to verify everything works correctly.