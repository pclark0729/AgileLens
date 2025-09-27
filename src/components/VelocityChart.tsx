import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Sprint } from '../types'
import { memo, useMemo } from 'react'

interface VelocityChartProps {
  sprints: Sprint[]
}

export const VelocityChart = memo(function VelocityChart({ sprints }: VelocityChartProps) {
  const chartData = useMemo(() => 
    sprints
      .slice()
      .reverse()
      .map((sprint, index) => ({
        name: `Sprint ${sprints.length - index}`,
        committed: sprint.story_points_committed,
        completed: sprint.story_points_completed,
        velocity: sprint.story_points_completed,
      })), [sprints])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 w-full">
        <p className="text-center">No sprint data available. Create your first sprint to see velocity trends.</p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full overflow-hidden flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === 'committed' ? 'Committed' : name === 'completed' ? 'Completed' : 'Velocity'
            ]}
            labelFormatter={(label) => `Sprint: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="committed"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})
