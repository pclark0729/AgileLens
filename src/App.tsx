import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SprintsPage } from './pages/SprintsPage'
import { ForecastPage } from './pages/ForecastPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SetupGuide } from './components/SetupGuide'

function App() {
  // Check if environment variables are configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('Environment check:', {
    supabaseUrl,
    supabaseKey,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    isPlaceholderUrl: supabaseUrl === 'https://placeholder.supabase.co',
    isPlaceholderKey: supabaseKey === 'placeholder-key'
  })
  
  const isConfigured = supabaseUrl && 
                      supabaseUrl !== 'https://placeholder.supabase.co' &&
                      supabaseKey && 
                      supabaseKey !== 'placeholder-key'

  if (!isConfigured) {
    return <SetupGuide />
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="sprints" element={<SprintsPage />} />
            <Route path="forecast" element={<ForecastPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
