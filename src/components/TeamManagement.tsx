import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Team, User } from '../types'
import { Users, Plus, Settings, Trash2, UserPlus, Mail, X } from 'lucide-react'

interface TeamManagementProps {
  onClose: () => void
}

export function TeamManagement({ onClose }: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTeams(data || [])
      
      if (data && data.length > 0) {
        setSelectedTeam(data[0])
        fetchTeamMembers(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('team_id', teamId)

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name: newTeamName }])
        .select()

      if (error) throw error
      
      setTeams([data[0], ...teams])
      setNewTeamName('')
      setShowCreateTeam(false)
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !selectedTeam) return

    try {
      // In a real app, you'd send an invitation email
      // For now, we'll just show a success message
      alert(`Invitation sent to ${inviteEmail} for team ${selectedTeam.name}`)
      setInviteEmail('')
      setShowInviteMember(false)
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error
      
      setTeams(teams.filter(team => team.id !== teamId))
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(teams.length > 1 ? teams[1] : null)
      }
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-900">Team Management</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Teams</h4>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="btn-primary flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Team
              </button>
            </div>

            <div className="space-y-2">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTeam?.id === team.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTeam(team)
                    fetchTeamMembers(team.id)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{team.name}</h5>
                      <p className="text-sm text-gray-500">
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTeam(team.id)
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showCreateTeam && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                <form onSubmit={createTeam} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="input w-full"
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="btn-primary text-sm"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateTeam(false)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedTeam.name} Members
                  </h4>
                  <button
                    onClick={() => setShowInviteMember(true)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite Member
                  </button>
                </div>

                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        member.role === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : member.role === 'member'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>

                {showInviteMember && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                    <form onSubmit={inviteMember} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="input pl-10 w-full"
                            placeholder="Enter email address"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="btn-primary text-sm"
                        >
                          Send Invitation
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInviteMember(false)}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No team selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a team to view members.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
