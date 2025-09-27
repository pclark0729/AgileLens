import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { Sprint } from '../types'
import { memo, useMemo } from 'react'

interface BurndownChartProps {
  sprints: Sprint[]
  currentSprint?: Sprint
}

export const BurndownChart = memo(function BurndownChart({ sprints, currentSprint }: BurndownChartProps) {
  // Generate burndown data for the current sprint or most recent sprint
  const targetSprint = currentSprint || sprints[0]
  
  const { idealBurndown, isOnTrack } = useMemo(() => {
    if (!targetSprint) {
      return { idealBurndown: [], isOnTrack: false }
    }

    // Calculate sprint duration in days
    const startDate = new Date(targetSprint.start_date)
    const endDate = new Date(targetSprint.end_date)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generate ideal burndown line (linear decrease from committed to 0)
    const burndownData = []
    
    for (let day = 0; day <= days; day++) {
      const idealRemaining = Math.max(0, targetSprint.story_points_committed - (targetSprint.story_points_committed * day / days))
      burndownData.push({
        day: `Day ${day}`,
        ideal: Math.round(idealRemaining),
        actual: Math.round(targetSprint.story_points_committed - (targetSprint.story_points_completed * day / days)),
        committed: targetSprint.story_points_committed,
        completed: targetSprint.story_points_completed
      })
    }

    // Calculate if sprint is on track
    const currentDay = Math.min(days, Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const idealAtCurrentDay = Math.max(0, targetSprint.story_points_committed - (targetSprint.story_points_committed * currentDay / days))
    const actualAtCurrentDay = Math.max(0, targetSprint.story_points_committed - targetSprint.story_points_completed)
    const onTrack = actualAtCurrentDay <= idealAtCurrentDay * 1.1 // 10% tolerance

    return { idealBurndown: burndownData, isOnTrack: onTrack }
  }, [targetSprint])
  
  if (!targetSprint) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 w-full">
        <p className="text-center">No sprint data available for burndown chart.</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full overflow-hidden flex flex-col">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900">{targetSprint.sprint_name} Burndown</h4>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Ideal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Actual</span>
          </div>
          <div className={`flex items-center ${isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isOnTrack ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-medium">
              {isOnTrack ? 'On Track' : 'Behind Schedule'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
        <LineChart data={idealBurndown}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === 'ideal' ? 'Ideal' : name === 'actual' ? 'Actual' : name
            ]}
            labelFormatter={(label) => `${label} of Sprint`}
          />
          <ReferenceLine 
            y={targetSprint.story_points_committed} 
            stroke="#6b7280" 
            strokeDasharray="5 5" 
            label="Committed"
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="ideal"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="actual"
          />
        </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Committed:</span>
          <span className="ml-2 font-medium">{targetSprint.story_points_committed} pts</span>
        </div>
        <div>
          <span className="text-gray-500">Completed:</span>
          <span className="ml-2 font-medium">{targetSprint.story_points_completed} pts</span>
        </div>
        <div>
          <span className="text-gray-500">Remaining:</span>
          <span className="ml-2 font-medium">{targetSprint.story_points_committed - targetSprint.story_points_completed} pts</span>
        </div>
        <div>
          <span className="text-gray-500">Progress:</span>
          <span className="ml-2 font-medium">
            {Math.round((targetSprint.story_points_completed / targetSprint.story_points_committed) * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
})
