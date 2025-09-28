import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Sprint, Team } from '../types'
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Users, Upload } from 'lucide-react'
import { InfoTooltip } from '../components/InfoTooltip'
import { VelocityChart } from '../components/VelocityChart'
import { BurndownChart } from '../components/BurndownChart'
import { TeamManagement } from '../components/TeamManagement'
import { TeamSwitcher } from '../components/TeamSwitcher'
import { PageLoading, DashboardLoading } from '../components/LoadingSpinner'
import { WelcomeMessage } from '../components/WelcomeMessage'
import { UserTutorial } from '../components/UserTutorial'
import { CSVImport } from '../components/CSVImport'
import { useAuth } from '../lib/auth-context'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [showTeamManagement, setShowTeamManagement] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [stats, setStats] = useState({
    totalSprints: 0,
    averageVelocity: 0,
    completionRate: 0,
    activeBlockers: 0,
  })

  const fetchSprints = useCallback(async () => {
    if (!selectedTeam) {
      console.log('No team selected, skipping fetch')
      return
    }
    
    console.log('Fetching sprints for team:', selectedTeam.id)
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('team_id', selectedTeam.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      console.log('Fetched sprints:', data)
      setSprints(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching sprints:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    // Check if user should see tutorial or welcome message
    // Use user-specific keys to make it persistent across sessions
    const hasSeenTutorial = user ? localStorage.getItem(`hasSeenTutorial_${user.id}`) : null
    const hasSeenWelcome = user ? localStorage.getItem(`hasSeenWelcome_${user.id}`) : null
    
    if (user && !hasSeenTutorial) {
      setShowTutorial(true)
    } else if (user && !hasSeenWelcome) {
      setShowWelcome(true)
    }
    
    // Set loading to false initially since we need a team selected first
    setLoading(false)
  }, [user])

  // Refetch sprints when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      setLoading(true)
      fetchSprints()
    }
  }, [selectedTeam, fetchSprints])

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

  // Calculate totals for Recent Sprints section
  const totalCommitted = sprints.reduce((sum, sprint) => sum + sprint.story_points_committed, 0)
  const totalCompleted = sprints.reduce((sum, sprint) => sum + sprint.story_points_completed, 0)

  if (loading && selectedTeam) {
    return <DashboardLoading />
  }

  const handleWelcomeDismiss = () => {
    setShowWelcome(false)
    if (user) {
      localStorage.setItem(`hasSeenWelcome_${user.id}`, 'true')
    }
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    if (user) {
      localStorage.setItem(`hasSeenTutorial_${user.id}`, 'true')
    }
  }

  const handleCreateSprint = () => {
    navigate('/sprints')
  }

  const handleImportData = () => {
    setShowImport(true)
  }

  const handleGenerateForecast = () => {
    navigate('/forecast')
  }

  const handleViewRecommendations = () => {
    navigate('/forecast')
  }

  const handleImportComplete = () => {
    setShowImport(false)
    fetchSprints() // Refresh data after import
  }

  const handleTeamChange = (team: Team | null) => {
    console.log('Team changed to:', team)
    setSelectedTeam(team)
  }

  const handleManageTeams = () => {
    setShowTeamManagement(true)
  }

  return (
    <div className="space-y-6">
      {showTutorial && user && (
        <UserTutorial 
          userName={user.name} 
          onComplete={handleTutorialComplete}
        />
      )}
      
      {showWelcome && user && !showTutorial && (
        <WelcomeMessage 
          userName={user.name} 
          onDismiss={handleWelcomeDismiss}
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your team's sprint performance and insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <TeamSwitcher
            selectedTeam={selectedTeam}
            onTeamChange={handleTeamChange}
            onManageTeams={handleManageTeams}
          />
        </div>
      </div>

      {/* No Team Selected Message */}
      {!selectedTeam && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a team to view sprint data and analytics.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      {selectedTeam && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sprints
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalSprints}</dd>
                </dl>
              </div>
            </div>
            <InfoTooltip content="The total number of sprints completed by your team. More sprints provide better data for forecasting." />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Velocity
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.averageVelocity}</dd>
                </dl>
              </div>
            </div>
            <InfoTooltip content="The average number of story points your team completes per sprint. This is a key metric for sprint planning." />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completion Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completionRate}%</dd>
                </dl>
              </div>
            </div>
            <InfoTooltip content="The percentage of committed story points that were actually completed. Higher rates indicate better sprint planning accuracy." />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Blockers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeBlockers}</dd>
                </dl>
              </div>
            </div>
            <InfoTooltip content="The total number of blockers encountered across all sprints. Fewer blockers indicate better team efficiency and planning." />
          </div>
        </div>
      </div>
      )}

      {/* Charts */}
      {selectedTeam && (
        <>
        {sprints.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Velocity Trend</h3>
            <VelocityChart sprints={sprints} />
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Sprint Burndown</h3>
            <BurndownChart sprints={sprints} currentSprint={sprints[0]} />
          </div>
        </div>
      ) : (
        <div className="card mb-12">
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sprint data yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first sprint or importing historical data.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button 
                onClick={handleCreateSprint}
                className="btn-primary flex items-center justify-center min-w-[140px]"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Create Sprint
              </button>
              <button 
                onClick={handleImportData}
                className="btn-secondary flex items-center justify-center min-w-[120px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sprints */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sprints</h3>
        {sprints.length > 0 ? (
          <>
            {/* Sprint Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Committed</p>
                    <p className="text-2xl font-bold text-blue-900">{totalCommitted}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Completed</p>
                    <p className="text-2xl font-bold text-green-900">{totalCompleted}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600">Remaining</p>
                    <p className="text-2xl font-bold text-orange-900">{Math.max(0, totalCommitted - totalCompleted)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Progress</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {totalCommitted > 0 ? Math.round((totalCompleted / totalCommitted) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>
            
            {/* Recent Sprints List */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Individual Sprints</h4>
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
          </>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No sprints created yet</p>
            <div className="mt-4">
              <button 
                onClick={handleCreateSprint}
                className="btn-primary flex items-center justify-center min-w-[180px] mx-auto"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Create New Sprint
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={handleCreateSprint}
            className="btn-primary flex items-center justify-center min-w-[160px]"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Create New Sprint
          </button>
          <button 
            onClick={handleGenerateForecast}
            className="btn-secondary flex items-center justify-center min-w-[160px]"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Generate Forecast
          </button>
          <button 
            onClick={handleViewRecommendations}
            className="btn-secondary flex items-center justify-center min-w-[160px]"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            View Recommendations
          </button>
          <button 
            onClick={() => setShowTeamManagement(true)}
            className="btn-secondary flex items-center justify-center min-w-[160px]"
          >
            <Users className="h-5 w-5 mr-2" />
            Manage Teams
          </button>
        </div>
      </div>
        </>
      )}

      {/* Team Management Modal */}
      {showTeamManagement && (
        <TeamManagement onClose={() => setShowTeamManagement(false)} />
      )}

      {/* CSV Import Modal */}
      {showImport && (
        <CSVImport onComplete={handleImportComplete} onCancel={() => setShowImport(false)} />
      )}
    </div>
  )
}
