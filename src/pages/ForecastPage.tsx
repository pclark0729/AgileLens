import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Sprint, Forecast } from '../types'
import { TrendingUp, Brain, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'

export function ForecastPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

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
    } catch (error) {
      console.error('Error fetching sprints:', error)
    }
  }

  const generateForecast = async () => {
    if (sprints.length < 3) {
      alert('You need at least 3 sprints to generate a forecast')
      return
    }

    setGenerating(true)
    try {
      // Call the AI forecasting function
      const { data, error } = await supabase.functions.invoke('generate-forecast', {
        body: { sprints: sprints.slice(0, 5) } // Use last 5 sprints
      })

      if (error) throw error

      // For now, create a mock forecast since we haven't set up the Edge Function yet
      const mockForecast: Forecast = {
        id: 'mock-forecast',
        sprint_id: 'current-sprint',
        recommended_capacity: Math.round(sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.length),
        risk_summary: 'Based on your velocity trend, consider reducing scope by 10-15% to account for potential blockers.',
        recommendation_text: `Your team's average velocity is ${Math.round(sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.length)} story points. For the next sprint, we recommend committing to ${Math.round(sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.length * 0.9)} story points to account for potential blockers and maintain a sustainable pace.`,
        confidence_score: 0.85,
        created_at: new Date().toISOString()
      }

      setForecast(mockForecast)
    } catch (error) {
      console.error('Error generating forecast:', error)
    } finally {
      setGenerating(false)
    }
  }

  const averageVelocity = sprints.length > 0 
    ? Math.round(sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.length)
    : 0

  const completionRate = sprints.length > 0
    ? Math.round((sprints.reduce((sum, s) => sum + s.story_points_completed, 0) / sprints.reduce((sum, s) => sum + s.story_points_committed, 0)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Forecast</h1>
          <p className="mt-1 text-sm text-gray-500">
            Get AI-powered recommendations for your next sprint
          </p>
        </div>
        <button
          onClick={generateForecast}
          disabled={generating || sprints.length < 3}
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Average Velocity</dt>
                <dd className="text-lg font-medium text-gray-900">{averageVelocity}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                <dd className="text-lg font-medium text-gray-900">{completionRate}%</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Data Points</dt>
                <dd className="text-lg font-medium text-gray-900">{sprints.length}</dd>
              </dl>
            </div>
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
      {sprints.length > 0 && (
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
      )}
    </div>
  )
}
