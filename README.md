# 🧠 AgileLens - AI-Powered Sprint Planning Dashboard

> *Data-driven sprint forecasting and capacity planning for Agile teams.*

AgileLens is a lightweight, full-stack web app that helps Agile teams **plan sprints more intelligently** using AI. It predicts sprint capacity, visualizes team velocity trends, and provides actionable recommendations to prevent overcommitment or idle time.

## 🚀 Features

- **AI Forecasting Engine** - Predict sprint capacity using historical velocity data
- **Recommendation Panel** - AI-suggested sprint goals and risk flags
- **Analytics Dashboard** - Interactive charts for velocity, burndown, and workload
- **Data Import** - Upload CSV of past sprint data
- **Team Authentication** - Secure user management with Supabase Auth
- **Zero Cost Hosting** - Built entirely on free-tier infrastructure

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Vercel

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AgileLens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

4. **Set up Supabase database**
   
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create teams table
   CREATE TABLE teams (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     team_id UUID REFERENCES teams(id),
     role TEXT DEFAULT 'member',
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create sprints table
   CREATE TABLE sprints (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     team_id UUID REFERENCES teams(id),
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
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     sprint_id UUID REFERENCES sprints(id),
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

   -- Create policies
   CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can view team sprints" ON sprints FOR SELECT USING (team_id IN (SELECT team_id FROM users WHERE id = auth.uid()));
   CREATE POLICY "Users can insert team sprints" ON sprints FOR INSERT WITH CHECK (team_id IN (SELECT team_id FROM users WHERE id = auth.uid()));
   CREATE POLICY "Users can update team sprints" ON sprints FOR UPDATE USING (team_id IN (SELECT team_id FROM users WHERE id = auth.uid()));
   CREATE POLICY "Users can delete team sprints" ON sprints FOR DELETE USING (team_id IN (SELECT team_id FROM users WHERE id = auth.uid()));
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Usage

### Getting Started

1. **Sign up** for a new account or sign in with existing credentials
2. **Import historical data** using the CSV import feature or manually add sprints
3. **View your dashboard** to see velocity trends and team performance
4. **Generate AI forecasts** for your next sprint planning session

### CSV Import

Download the template CSV file and fill it with your historical sprint data:

```csv
Sprint Name,Start Date,End Date,Story Points Committed,Story Points Completed,Team Size,Blockers,Notes
Sprint 1,2024-01-01,2024-01-15,20,18,5,2,Great sprint with good velocity
Sprint 2,2024-01-16,2024-01-30,25,22,5,1,Some scope creep but managed well
```

### AI Forecasting

The AI forecasting engine analyzes your historical data to provide:
- Recommended story point capacity for upcoming sprints
- Risk analysis and potential blockers
- Confidence scores based on data quality
- Actionable recommendations for sprint planning

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout with navigation
│   ├── SprintForm.tsx  # Sprint creation/editing form
│   ├── CSVImport.tsx   # CSV data import component
│   └── VelocityChart.tsx # Velocity trend visualization
├── pages/              # Page components
│   ├── LoginPage.tsx   # Authentication page
│   ├── DashboardPage.tsx # Main dashboard
│   ├── SprintsPage.tsx # Sprint management
│   └── ForecastPage.tsx # AI forecasting
├── lib/                # Utilities and configurations
│   ├── supabase.ts     # Supabase client
│   └── auth-context.tsx # Authentication context
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
└── App.tsx             # Main app component
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update types in `src/types/index.ts`
4. Add new routes in `src/App.tsx`

## 📈 Roadmap

### MVP Features ✅
- [x] User authentication
- [x] Sprint CRUD operations
- [x] CSV import functionality
- [x] Basic velocity chart
- [x] AI forecasting (mock implementation)

### Upcoming Features
- [ ] Real AI integration with OpenRouter
- [ ] Advanced analytics dashboard
- [ ] Team workspace management
- [ ] Mobile responsiveness
- [ ] Data export features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** Check the [PRD](docs/PRD.md) for detailed requirements
- **Issues:** Report bugs and feature requests via GitHub Issues
- **Discussions:** Join the community discussions

---

**Built with ❤️ for Agile teams everywhere**