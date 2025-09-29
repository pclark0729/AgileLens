import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Team } from '../types'
import { ChevronDown, Users, Plus, Settings } from 'lucide-react'

interface TeamSwitcherProps {
  selectedTeam: Team | null
  onTeamChange: (team: Team | null) => void
  onManageTeams: () => void
}

export function TeamSwitcher({ selectedTeam, onTeamChange, onManageTeams }: TeamSwitcherProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      // First get the current user's team_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get user's profile to get their team_id
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('team_id')
        .eq('id', user.id)
        .single()

      if (userError || !userProfile?.team_id) {
        console.error('User not assigned to any team:', userError)
        setTeams([])
        setLoading(false)
        return
      }

      // Get the team the user belongs to
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', userProfile.team_id)
        .order('name', { ascending: true })

      if (error) throw error
      
      setTeams(data || [])
      
      // If no team is selected and we have teams, select the first one
      if (!selectedTeam && data && data.length > 0) {
        onTeamChange(data[0])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamSelect = (team: Team) => {
    onTeamChange(team)
    setIsOpen(false)
  }

  const handleCreateTeam = () => {
    // This will be handled by the parent component
    onManageTeams()
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        <span className="text-sm text-gray-600">Loading teams...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <Users className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-900">
          {selectedTeam ? selectedTeam.name : 'Select Team'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {teams.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No teams found
              </div>
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                    selectedTeam?.id === team.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>{team.name}</span>
                </button>
              ))
            )}
            
            <div className="border-t border-gray-200 mt-1 pt-1">
              <button
                onClick={handleCreateTeam}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Team</span>
              </button>
              <button
                onClick={() => {
                  onManageTeams()
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Teams</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
