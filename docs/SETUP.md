# 🚀 AgileLens Setup Guide

This guide will help you set up AgileLens for development and deployment.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account
- An OpenRouter API account (for AI features)

## 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API (for AI forecasting)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

## 2. Supabase Database Setup

### Create Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create sprints table
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) NOT NULL,
  sprint_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  story_points_committed INTEGER DEFAULT 0,
  story_points_completed INTEGER DEFAULT 0,
  blockers INTEGER DEFAULT 0,
  team_size INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create forecasts table
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID REFERENCES sprints(id),
  team_id UUID REFERENCES teams(id) NOT NULL,
  recommended_capacity INTEGER NOT NULL,
  risk_summary TEXT,
  recommendation_text TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

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
```

### Create Edge Function

Create a new Edge Function called `generate-forecast` in your Supabase dashboard:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sprints } = await req.json()
    
    if (!sprints || sprints.length < 3) {
      return new Response(
        JSON.stringify({ error: 'At least 3 sprints required for forecasting' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate basic metrics
    const avgVelocity = sprints.reduce((sum: number, s: any) => sum + s.story_points_completed, 0) / sprints.length
    const avgCompletionRate = sprints.reduce((sum: number, s: any) => 
      sum + (s.story_points_completed / s.story_points_committed), 0
    ) / sprints.length
    const totalBlockers = sprints.reduce((sum: number, s: any) => sum + s.blockers, 0)
    
    // Generate AI-powered forecast using OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an AI sprint planning assistant. Analyze sprint data and provide recommendations for future sprint capacity.'
          },
          {
            role: 'user',
            content: `Analyze this sprint data and provide a forecast for the next sprint:

Sprint Data:
${sprints.map((s: any, i: number) => 
  `Sprint ${i + 1}: ${s.sprint_name} - Committed: ${s.story_points_committed}, Completed: ${s.story_points_completed}, Blockers: ${s.blockers}, Team Size: ${s.team_size}`
).join('\n')}

Average Velocity: ${avgVelocity.toFixed(1)}
Average Completion Rate: ${(avgCompletionRate * 100).toFixed(1)}%
Total Blockers: ${totalBlockers}

Provide a JSON response with:
- recommended_capacity: number (story points for next sprint)
- risk_summary: string (key risks to consider)
- recommendation_text: string (detailed explanation)
- confidence_score: number (0-1, confidence in the recommendation)`
          }
        ]
      })
    })

    const aiResponse = await openRouterResponse.json()
    const aiContent = aiResponse.choices[0]?.message?.content

    // Parse AI response or fallback to basic calculation
    let forecast
    try {
      forecast = JSON.parse(aiContent)
    } catch {
      // Fallback calculation
      const recommendedCapacity = Math.round(avgVelocity * 0.9) // 10% buffer
      forecast = {
        recommended_capacity: recommendedCapacity,
        risk_summary: `Based on ${sprints.length} sprints, consider reducing scope by 10% to account for potential blockers.`,
        recommendation_text: `Your team's average velocity is ${avgVelocity.toFixed(1)} story points. For the next sprint, we recommend committing to ${recommendedCapacity} story points to maintain a sustainable pace.`,
        confidence_score: Math.min(0.8, 0.5 + (sprints.length * 0.1))
      }
    }

    return new Response(
      JSON.stringify(forecast),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating forecast:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate forecast' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

## 3. OpenRouter API Setup

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Create an account and get your API key
3. Add the key to your `.env.local` file

## 4. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 5. Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Add these to your Vercel environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENROUTER_API_KEY`

## 6. Email Verification Setup

### Configure Supabase Authentication

1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Enable Email Confirmations**:
   - Set "Enable email confirmations" to `true`
   - Configure your site URL (e.g., `http://localhost:5173` for development)
   - Set up redirect URLs if needed
3. **Email Templates** (Optional):
   - Customize the confirmation email template
   - Add your branding and messaging

### How Email Verification Works

1. **User signs up** → Supabase sends verification email
2. **User clicks link** → Email is verified, account is activated
3. **User signs in** → Profile is automatically created in database
4. **User can access app** → Full functionality available

### Important Notes

- Users **cannot sign in** until email is verified
- User profiles are created **after** email verification
- Verification links expire in 24 hours
- Users can resend verification emails if needed

## 7. Features

- ✅ User authentication with Supabase
- ✅ Email verification flow
- ✅ Sprint management (CRUD)
- ✅ CSV import/export
- ✅ Velocity charts and analytics
- ✅ AI-powered sprint forecasting
- ✅ Team-based data isolation
- ✅ Responsive design
- ✅ Real-time updates

## 8. Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your environment variables
2. **AI forecasting not working**: Verify OpenRouter API key
3. **Database permission errors**: Check RLS policies
4. **Build errors**: Ensure all dependencies are installed

### Support

For issues and questions, please check the GitHub repository or create an issue.
