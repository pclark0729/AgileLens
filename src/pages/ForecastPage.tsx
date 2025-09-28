import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Sprint, Forecast, Team } from '../types'
import { TrendingUp, Brain, AlertTriangle, CheckCircle, RefreshCw, Plus } from 'lucide-react'
import { InfoTooltip } from '../components/InfoTooltip'
import { PageLoading, CardLoading } from '../components/LoadingSpinner'
import { TeamSwitcher } from '../components/TeamSwitcher'
import { ForecastHistory } from '../components/ForecastHistory'

export function ForecastPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const fetchSprints = useCallback(async () => {
    if (!selectedTeam) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('team_id', selectedTeam.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSprints(data || [])
    } catch (error) {
      console.error('Error fetching sprints:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    setLoading(false)
  }, [])

  // Refetch sprints when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      setLoading(true)
      fetchSprints()
    }
  }, [selectedTeam, fetchSprints])

  const generateForecast = async () => {
    if (!selectedTeam) {
      alert('Please select a team first')
      return
    }

    if (sprints.length < 3) {
      alert('You need at least 3 sprints to generate a forecast')
      return
    }

    setGenerating(true)
    try {
      let forecastData: any = null

      // Try to call the AI forecasting function first
      try {
        const { data, error } = await supabase.functions.invoke('generate-forecast', {
          body: { sprints: sprints.slice(0, 5) } // Use last 5 sprints
        })

        if (error) throw error

        if (data) {
          forecastData = data
        }
      } catch (aiError) {
        console.warn('AI forecasting not available, using fallback calculation:', aiError)
      }

      // Fallback to enhanced calculation if AI is not available
      if (!forecastData) {
        const avgVelocity = sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.length
        const avgCompletionRate = sprints.reduce((sum, s) => 
          sum + (s.story_points_completed / s.story_points_committed), 0
        ) / sprints.length
        const totalBlockers = sprints.reduce((sum, s) => sum + s.blockers, 0)
        const avgBlockers = totalBlockers / sprints.length
        
        // Enhanced calculation with more factors
        const velocityTrend = calculateVelocityTrend(sprints)
        const riskFactor = Math.max(0.1, Math.min(0.3, avgBlockers / 5)) // Risk based on blockers
        const completionRisk = avgCompletionRate < 0.8 ? 0.15 : 0.05 // Risk based on completion rate
        
        const recommendedCapacity = Math.round(avgVelocity * (1 - riskFactor - completionRisk))
        const confidenceScore = Math.min(0.9, 0.5 + (sprints.length * 0.08) + (avgCompletionRate * 0.2))

        forecastData = {
          recommended_capacity: recommendedCapacity,
          risk_summary: generateRiskSummary(avgBlockers, avgCompletionRate, velocityTrend),
          recommendation_text: generateRecommendationText(avgVelocity, recommendedCapacity, avgCompletionRate, velocityTrend),
          confidence_score: confidenceScore
        }
      }

      // Save forecast to database
      const { data: savedForecast, error: saveError } = await supabase
        .from('forecasts')
        .insert([{
          team_id: selectedTeam.id,
          sprint_id: sprints[0]?.id || 'current-sprint', // Use most recent sprint ID
          recommended_capacity: forecastData.recommended_capacity,
          risk_summary: forecastData.risk_summary,
          recommendation_text: forecastData.recommendation_text,
          confidence_score: forecastData.confidence_score
        }])
        .select()
        .single()

      if (saveError) throw saveError

      // Set the forecast for display
      setForecast(savedForecast)
    } catch (error) {
      console.error('Error generating forecast:', error)
      alert('Failed to generate forecast. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const calculateVelocityTrend = (sprintData: Sprint[]) => {
    if (sprintData.length < 2) return 'stable'
    
    const recent = sprintData.slice(0, 3).reduce((sum, s) => sum + s.story_points_completed, 0) / 3
    const older = sprintData.slice(3, 6).reduce((sum, s) => sum + s.story_points_completed, 0) / 3
    
    if (recent > older * 1.1) return 'increasing'
    if (recent < older * 0.9) return 'decreasing'
    return 'stable'
  }

  const generateRiskSummary = (avgBlockers: number, completionRate: number, trend: string) => {
    const risks = []
    
    if (avgBlockers > 2) risks.push('High blocker frequency')
    if (completionRate < 0.8) risks.push('Low completion rate')
    if (trend === 'decreasing') risks.push('Declining velocity trend')
    
    if (risks.length === 0) return 'Low risk - team performing well'
    return `Key risks: ${risks.join(', ')}. Consider reducing scope by 10-15%.`
  }

  const generateRecommendationText = (avgVelocity: number, recommended: number, completionRate: number, trend: string) => {
    let text = `Your team's average velocity is ${avgVelocity.toFixed(1)} story points. `
    
    if (trend === 'increasing') {
      text += 'Great job! Your velocity is trending upward. '
    } else if (trend === 'decreasing') {
      text += 'Your velocity has been declining recently. '
    }
    
    text += `For the next sprint, we recommend committing to ${recommended} story points `
    
    if (completionRate < 0.8) {
      text += 'to improve completion rates and build confidence. '
    } else {
      text += 'to maintain a sustainable pace. '
    }
    
    text += 'This accounts for potential blockers and maintains team momentum.'
    
    return text
  }

  const handleTeamChange = (team: Team | null) => {
    setSelectedTeam(team)
    setForecast(null) // Clear current forecast when switching teams
  }

  const handleManageTeams = () => {
    // This could open a team management modal or navigate to a team management page
    console.log('Manage teams clicked')
  }

  const handleForecastSelect = (forecast: Forecast) => {
    setForecast(forecast)
  }

  const averageVelocity = sprints.length > 0 
    ? Math.round(sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.length)
    : 0

  const completionRate = sprints.length > 0
    ? Math.round((sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.reduce((sum, s) => sum + s.story_points_committed, 0)) * 100)
    : 0

  if (loading && selectedTeam) {
    return <PageLoading />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Forecast</h1>
          <p className="mt-1 text-sm text-gray-500">
            Get AI-powered recommendations for your next sprint
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <TeamSwitcher
            selectedTeam={selectedTeam}
            onTeamChange={handleTeamChange}
            onManageTeams={handleManageTeams}
          />
          <button
            onClick={generateForecast}
            disabled={generating || sprints.length < 3 || !selectedTeam}
            className="btn-primary flex items-center"
          >
            {generating ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Brain className="h-5 w-5 mr-2" />
            )}
            {generating ? 'Generating...' : 'Generate Forecast'}
          </button>
        </div>
      </div>

      {/* No Team Selected Message */}
      {!selectedTeam && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a team to generate forecasts and view forecast history.
          </p>
        </div>
      )}

      {/* Forecast History Toggle */}
      {selectedTeam && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            {showHistory ? 'Hide' : 'Show'} Forecast History
          </button>
        </div>
      )}

      {/* Forecast History */}
      {selectedTeam && showHistory && (
        <ForecastHistory
          teamId={selectedTeam.id}
        />
      )}

      {/* Stats Overview */}
      {selectedTeam && (
        <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Velocity
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{averageVelocity}</dd>
                </dl>
              </div>
            </div>
            <InfoTooltip content="The average number of story points your team completes per sprint. This is used as the baseline for AI forecasting." />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completion Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{completionRate}%</dd>
                </dl>
              </div>
            </div>
            <InfoTooltip content="The percentage of committed story points that were actually completed. This helps the AI assess team reliability for forecasting." />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Data Points
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{sprints.length}</dd>
                </dl>
              </div>
            </div>
            <InfoTooltip content="The number of historical sprints used for forecasting. More data points lead to more accurate AI predictions." />
          </div>
        </div>
      </div>

      {/* Forecast Results */}
      {forecast ? (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendation</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Brain className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Recommended Capacity</h4>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{forecast.recommended_capacity} story points</p>
                  <p className="text-sm text-blue-700 mt-2">{forecast.recommendation_text}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Analysis</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Risk Summary</h4>
                  <p className="text-sm text-yellow-700 mt-1">{forecast.risk_summary}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confidence Score</h3>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: `${forecast.confidence_score * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(forecast.confidence_score * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on {sprints.length} historical sprints
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forecast available</h3>
            <p className="mt-1 text-sm text-gray-500">
              {sprints.length < 3 
                ? 'You need at least 3 sprints to generate a forecast. Add more sprint data to get started.'
                : 'Generate an AI-powered forecast for your next sprint.'
              }
            </p>
            {sprints.length >= 3 && (
              <div className="mt-6">
                <button
                  onClick={generateForecast}
                  disabled={generating}
                  className="btn-primary"
                >
                  {generating ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      Generate Forecast
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Data */}
      {sprints.length > 0 ? (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Historical Sprint Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sprint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Committed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blockers
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sprints.slice(0, 10).map((sprint) => {
                  const completion = sprint.story_points_committed > 0 
                    ? Math.round((sprint.story_points_completed / sprint.story_points_committed) * 100)
                    : 0
                  
                  return (
                    <tr key={sprint.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sprint.sprint_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sprint.story_points_committed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sprint.story_points_completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          completion >= 90 ? 'bg-green-100 text-green-800' :
                          completion >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {completion}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sprint.blockers}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sprint data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create at least 3 sprints to generate AI forecasts and insights.
            </p>
            <div className="mt-6">
              <button className="btn-primary flex items-center justify-center min-w-[140px]">
                <Plus className="h-4 w-4 mr-2" />
                Create Sprint
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
