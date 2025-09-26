import { useState, useEffect } from 'react'
import { Sprint } from '../types'
import { X } from 'lucide-react'

interface SprintFormProps {
  sprint?: Sprint | null
  onSubmit: (sprint: Omit<Sprint, 'id' | 'created_at'>) => void
  onClose: () => void
}

export function SprintForm({ sprint, onSubmit, onClose }: SprintFormProps) {
  const [formData, setFormData] = useState({
    team_id: '',
    sprint_name: '',
    start_date: '',
    end_date: '',
    story_points_committed: 0,
    story_points_completed: 0,
    blockers: 0,
    team_size: 1,
    notes: '',
  })

  useEffect(() => {
    if (sprint) {
      setFormData({
        team_id: sprint.team_id,
        sprint_name: sprint.sprint_name,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        story_points_committed: sprint.story_points_committed,
        story_points_completed: sprint.story_points_completed,
        blockers: sprint.blockers,
        team_size: sprint.team_size,
        notes: sprint.notes || '',
      })
    }
  }, [sprint])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('story_points') || name.includes('blockers') || name.includes('team_size') 
        ? parseInt(value) || 0 
        : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {sprint ? 'Edit Sprint' : 'Create New Sprint'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sprint_name" className="block text-sm font-medium text-gray-700">
              Sprint Name
            </label>
            <input
              type="text"
              id="sprint_name"
              name="sprint_name"
              required
              value={formData.sprint_name}
              onChange={handleChange}
              className="input mt-1"
              placeholder="e.g., Sprint 1, Q1 Planning"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                required
                value={formData.end_date}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="story_points_committed" className="block text-sm font-medium text-gray-700">
                Story Points Committed
              </label>
              <input
                type="number"
                id="story_points_committed"
                name="story_points_committed"
                min="0"
                value={formData.story_points_committed}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
            <div>
              <label htmlFor="story_points_completed" className="block text-sm font-medium text-gray-700">
                Story Points Completed
              </label>
              <input
                type="number"
                id="story_points_completed"
                name="story_points_completed"
                min="0"
                value={formData.story_points_completed}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="team_size" className="block text-sm font-medium text-gray-700">
                Team Size
              </label>
              <input
                type="number"
                id="team_size"
                name="team_size"
                min="1"
                required
                value={formData.team_size}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
            <div>
              <label htmlFor="blockers" className="block text-sm font-medium text-gray-700">
                Blockers
              </label>
              <input
                type="number"
                id="blockers"
                name="blockers"
                min="0"
                value={formData.blockers}
                onChange={handleChange}
                className="input mt-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="input mt-1"
              placeholder="Any observations, risks, or notes about this sprint..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {sprint ? 'Update Sprint' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
