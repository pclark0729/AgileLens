import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SprintsPage } from './pages/SprintsPage'
import { ForecastPage } from './pages/ForecastPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
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
  )
}

export default App
