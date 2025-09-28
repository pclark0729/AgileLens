import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Forecast } from '../types'
import { Brain, Calendar, TrendingUp, AlertTriangle, Trash2 } from 'lucide-react'

interface ForecastHistoryProps {
  teamId: string | null
}

export function ForecastHistory({ teamId }: ForecastHistoryProps) {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (teamId) {
      fetchForecasts()
    }
  }, [teamId])

  const fetchForecasts = async () => {
    if (!teamId) return

    try {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setForecasts(data || [])
    } catch (error) {
      console.error('Error fetching forecasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteForecast = async (forecastId: string) => {
    if (!confirm('Are you sure you want to delete this forecast?')) return

    try {
      const { error } = await supabase
        .from('forecasts')
        .delete()
        .eq('id', forecastId)

      if (error) throw error
      setForecasts(forecasts.filter(f => f.id !== forecastId))
    } catch (error) {
      console.error('Error deleting forecast:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading forecast history...</span>
        </div>
      </div>
    )
  }

  if (!teamId) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a team to view forecast history.
          </p>
        </div>
      </div>
    )
  }

  if (forecasts.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Forecast History</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate your first forecast to see it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Forecast History</h3>
        <span className="text-sm text-gray-500">{forecasts.length} forecasts</span>
      </div>

      <div className="space-y-4">
        {forecasts.map((forecast) => (
          <div
            key={forecast.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Brain className="h-5 w-5 text-primary-600" />
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {formatDate(forecast.created_at)}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(forecast.confidence_score)}`}>
                    {Math.round(forecast.confidence_score * 100)}% confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {forecast.recommended_capacity} story points
                      </p>
                      <p className="text-xs text-gray-500">Recommended capacity</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-900 line-clamp-1">
                        {forecast.risk_summary}
                      </p>
                      <p className="text-xs text-gray-500">Risk summary</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">
                  {forecast.recommendation_text}
                </p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => deleteForecast(forecast.id)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete forecast"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
