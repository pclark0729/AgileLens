import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Sprint, Team } from '../types'
import { Plus, Calendar, Edit, Trash2, Upload } from 'lucide-react'
import { SprintForm } from '../components/SprintForm'
import { CSVImport } from '../components/CSVImport'
import { TeamSwitcher } from '../components/TeamSwitcher'
import { PageLoading, TableLoading } from '../components/LoadingSpinner'

export function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const fetchSprints = useCallback(async () => {
    if (!selectedTeam) return
    
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('team_id', selectedTeam.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSprints(data || [])
    } catch (error) {
      console.error('Error fetching sprints:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    // Set loading to false initially since we need a team selected first
    setLoading(false)
  }, [])

  // Refetch sprints when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      setLoading(true)
      fetchSprints()
    }
  }, [selectedTeam, fetchSprints])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sprint?')) return

    try {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSprints(sprints.filter(sprint => sprint.id !== id))
    } catch (error) {
      console.error('Error deleting sprint:', error)
    }
  }

  const handleFormSubmit = async (sprintData: Omit<Sprint, 'id' | 'created_at'>) => {
    try {
      if (editingSprint) {
        const { error } = await supabase
          .from('sprints')
          .update(sprintData)
          .eq('id', editingSprint.id)

        if (error) throw error
        setSprints(sprints.map(sprint => 
          sprint.id === editingSprint.id ? { ...sprint, ...sprintData } : sprint
        ))
      } else {
        const { data, error } = await supabase
          .from('sprints')
          .insert([sprintData])
          .select()

        if (error) throw error
        setSprints([data[0], ...sprints])
      }

      setShowForm(false)
      setEditingSprint(null)
    } catch (error) {
      console.error('Error saving sprint:', error)
    }
  }

  const handleEdit = (sprint: Sprint) => {
    setEditingSprint(sprint)
    setShowForm(true)
  }

  const handleImportComplete = () => {
    setShowImport(false)
    fetchSprints()
  }

  const handleTeamChange = (team: Team | null) => {
    setSelectedTeam(team)
  }

  const handleManageTeams = () => {
    // This could open a team management modal or navigate to a team management page
    console.log('Manage teams clicked')
  }

  if (loading && selectedTeam) {
    return <TableLoading />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team's sprint data and track performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <TeamSwitcher
            selectedTeam={selectedTeam}
            onTeamChange={handleTeamChange}
            onManageTeams={handleManageTeams}
          />
          <div className="flex space-x-3">
          <button
            onClick={() => setShowImport(true)}
            className="btn-secondary flex items-center justify-center min-w-[120px]"
          >
            <Upload className="h-5 w-5 mr-2" />
            Import CSV
          </button>
          <button
            onClick={() => {
              setEditingSprint(null)
              setShowForm(true)
            }}
            className="btn-primary flex items-center justify-center min-w-[160px]"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Sprint
          </button>
          </div>
        </div>
      </div>

      {/* No Team Selected Message */}
      {!selectedTeam && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a team to view and manage sprints.
          </p>
        </div>
      )}

      {/* Sprint List */}
      {selectedTeam && (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sprints.map((sprint) => (
            <li key={sprint.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{sprint.sprint_name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {sprint.story_points_completed}/{sprint.story_points_committed} story points
                    </p>
                    <p className="text-xs text-gray-500">
                      Team size: {sprint.team_size} • Blockers: {sprint.blockers}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(sprint)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sprint.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              {sprint.notes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{sprint.notes}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
        {sprints.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sprints</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new sprint.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center justify-center min-w-[160px] mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Sprint
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Sprint Form Modal */}
      {showForm && (
        <SprintForm
          sprint={editingSprint}
          selectedTeam={selectedTeam}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingSprint(null)
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showImport && (
        <CSVImport
          onComplete={handleImportComplete}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}
