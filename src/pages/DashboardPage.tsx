import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Sprint } from '../types'
import { Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { VelocityChart } from '../components/VelocityChart'

export function DashboardPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSprints: 0,
    averageVelocity: 0,
    completionRate: 0,
    activeBlockers: 0,
  })

  useEffect(() => {
    fetchSprints()
  }, [])

  const fetchSprints = async () => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setSprints(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching sprints:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (sprintData: Sprint[]) => {
    if (sprintData.length === 0) return

    const totalSprints = sprintData.length
    const totalCommitted = sprintData.reduce((sum, sprint) => sum + sprint.story_points_committed, 0)
    const totalCompleted = sprintData.reduce((sum, sprint) => sum + sprint.story_points_completed, 0)
    const averageVelocity = totalCompleted / totalSprints
    const completionRate = totalCommitted > 0 ? (totalCompleted / totalCommitted) * 100 : 0
    const activeBlockers = sprintData.reduce((sum, sprint) => sum + sprint.blockers, 0)

    setStats({
      totalSprints,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
      activeBlockers,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your team's sprint performance and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Sprints</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalSprints}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Velocity</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.averageVelocity}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.completionRate}%</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Blockers</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.activeBlockers}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Velocity Trend</h3>
          <VelocityChart sprints={sprints} />
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sprints</h3>
          <div className="space-y-3">
            {sprints.slice(0, 5).map((sprint) => (
              <div key={sprint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sprint.sprint_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {sprint.story_points_completed}/{sprint.story_points_committed}
                  </p>
                  <p className="text-xs text-gray-500">story points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <Calendar className="h-5 w-5 mr-2" />
            Create New Sprint
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Generate Forecast
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            View Recommendations
          </button>
        </div>
      </div>
    </div>
  )
}
