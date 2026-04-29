import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { accountSyncUnavailable, isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext({})

const guestUser = { id: 'guest-uid', email: 'guest@example.com' }
const guestProfile = { full_name: 'Guest', avatar_url: null }

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('betatrace_is_guest') === 'true';
  })

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      if (localStorage.getItem('betatrace_is_guest') === 'true') {
        setUser(guestUser)
        setProfile(guestProfile)
      }
      setLoading(false)
      return undefined
    }

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else if (localStorage.getItem('betatrace_is_guest') === 'true') {
          setUser(guestUser)
          setProfile(guestProfile)
          setLoading(false)
        } else {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Supabase session error:', err)
        if (localStorage.getItem('betatrace_is_guest') === 'true') {
          setUser(guestUser)
          setProfile(guestProfile)
        }
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  async function signUp({ email, password, fullName }) {
    if (!supabase) return { data: null, error: accountSyncUnavailable }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    if (!supabase) return { data: null, error: accountSyncUnavailable }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async function signInWithGoogle() {
    if (!supabase) return { data: null, error: accountSyncUnavailable }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  }

  async function signOut() {
    if (typeof window !== 'undefined' && 'caches' in window) {
      await caches.delete('data-reads-v1')
    }

    const { error } = supabase ? await supabase.auth.signOut() : { error: null }
    if (!error) {
      setUser(null)
      setProfile(null)
      setIsGuest(false)
      localStorage.removeItem('betatrace_is_guest')
    }
    return { error }
  }

  function continueAsGuest() {
    setIsGuest(true)
    localStorage.setItem('betatrace_is_guest', 'true')
    setUser(guestUser)
    setProfile(guestProfile)
  }

  async function resetPassword(email) {
    if (!supabase) return { data: null, error: accountSyncUnavailable }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }

  async function updateProfile(updates) {
    if (!supabase || !user?.id) return { data: null, error: accountSyncUnavailable }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    }
    return { data, error }
  }

  const value = {
    user,
    profile,
    loading,
    isGuest,
    isSupabaseConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    continueAsGuest,
    resetPassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
