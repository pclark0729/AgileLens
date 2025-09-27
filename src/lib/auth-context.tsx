import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { User, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Starting auth check...')
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthProvider: Timeout reached, setting loading to false')
      setLoading(false)
    }, 5000) // 5 second timeout
    
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        // Try a simple query to test connection (use a different approach)
        const { error } = await supabase.from('users').select('id').limit(1)
        if (error && error.code !== 'PGRST116' && error.code !== '42501') {
          console.error('Supabase connection test failed:', error)
          clearTimeout(timeout)
          setLoading(false)
          return
        }
        console.log('Supabase connection test passed')
      } catch (err) {
        console.error('Supabase connection test error:', err)
        clearTimeout(timeout)
        setLoading(false)
        return
      }
      
      // If connection test passes, proceed with auth check
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('AuthProvider: Session check result:', { session: !!session, user: !!session?.user })
        clearTimeout(timeout) // Clear timeout since we got a response
        if (session?.user) {
          fetchUserProfile(session.user)
        } else {
          console.log('AuthProvider: No session, setting loading to false')
          setLoading(false)
        }
      }).catch(error => {
        console.error('AuthProvider: Error getting session:', error)
        clearTimeout(timeout) // Clear timeout on error
        setLoading(false)
      })
    }
    
    testConnection()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('fetchUserProfile: Starting for user:', supabaseUser.id)
    
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // 10 second timeout
    })
    
    try {
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any
      
      console.log('fetchUserProfile: Query result:', { profile: !!profile, error })

      if (error) {
        console.error('Error fetching user profile:', error)
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('User profile not found, creating one...')
          
          // Get the stored name from sign-up or use fallbacks
          const storedName = localStorage.getItem('pendingUserName')
          const userName = storedName || 
                          supabaseUser.user_metadata?.name || 
                          supabaseUser.email?.split('@')[0] || 
                          'User'
          
          // Clear the stored name after use
          if (storedName) {
            localStorage.removeItem('pendingUserName')
          }
          
          // Try to create user profile with proper RLS handling
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email!,
              name: userName,
              role: 'member',
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating user profile:', createError)
            
            // If RLS policy violation, create a temporary user and try again later
            if (createError.code === '42501') {
              console.log('RLS policy violation - creating temporary user profile')
              const tempUser = {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: userName,
                role: 'member' as const,
                team_id: undefined,
                created_at: new Date().toISOString()
              }
              setUser(tempUser)
              
              // Try to create profile again after a short delay (user might be fully authenticated by then)
              setTimeout(async () => {
                try {
                  const { data: retryProfile, error: retryError } = await supabase
                    .from('users')
                    .insert({
                      id: supabaseUser.id,
                      email: supabaseUser.email!,
                      name: userName,
                      role: 'member',
                    })
                    .select()
                    .single()
                  
                  if (!retryError && retryProfile) {
                    console.log('Successfully created user profile on retry')
                    setUser(retryProfile)
                  }
                } catch (retryErr) {
                  console.log('Retry profile creation failed, keeping temporary user')
                }
              }, 2000)
            } else {
              // For other errors, just create temporary user
              const tempUser = {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: userName,
                role: 'member' as const,
                team_id: undefined,
                created_at: new Date().toISOString()
              }
              setUser(tempUser)
            }
          } else {
            setUser(newProfile)
          }
          setLoading(false)
        } else {
          setLoading(false)
          return
        }
      } else {
        setUser(profile)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    })
    if (error) throw error

    // Store the name for later use when creating the profile
    if (data.user) {
      // Store the name in localStorage so we can use it after email verification
      localStorage.setItem('pendingUserName', name)
    }

    // Note: User profile will be created after email verification
    // The user is not fully authenticated until they verify their email
    return {
      user: data.user,
      needsEmailVerification: !data.session,
      message: data.user && !data.session 
        ? 'Please check your email and click the verification link to complete your registration.'
        : 'Account created successfully!'
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    })
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithMagicLink,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
