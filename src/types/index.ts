export interface User {
  id: string
  email: string
  name: string
  team_id?: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
}

export interface Team {
  id: string
  name: string
  created_at: string
}

export interface Sprint {
  id: string
  team_id: string
  sprint_name: string
  start_date: string
  end_date: string
  story_points_committed: number
  story_points_completed: number
  blockers: number
  team_size: number
  notes?: string
  created_at: string
}

export interface Forecast {
  id: string
  sprint_id: string
  recommended_capacity: number
  risk_summary: string
  recommendation_text: string
  confidence_score: number
  created_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
}
