'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/lib/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [hasHydrated, setHasHydrated] = useState(false)
  const hasRefreshed = useRef(false)

  // Wait for zustand persist to hydrate
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      console.log('[v0] Zustand hydration finished')
      setHasHydrated(true)
    })
    
    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      console.log('[v0] Zustand already hydrated')
      setHasHydrated(true)
    }
    
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!hasHydrated || hasRefreshed.current) {
      return
    }
    
    const state = useAuthStore.getState()
    console.log('[v0] AuthProvider state after hydration:', {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      hasToken: !!state.token,
      accessiblePagesCount: state.accessiblePages?.length,
      accessibleCategoriesCount: state.accessibleCategories?.length,
    })
    
    // Check if we have a stored token
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    console.log('[v0] Stored token exists:', !!storedToken)
    
    if (storedToken && state.isAuthenticated && state.user) {
      hasRefreshed.current = true
      console.log('[v0] Refreshing user data...')
      // Refresh user data to ensure it's still valid
      state.refreshUserData()
        .then(() => {
          console.log('[v0] User data refreshed successfully')
        })
        .catch((err) => {
          console.log('[v0] User data refresh failed:', err)
        })
        .finally(() => {
          state.setLoading(false)
        })
    } else {
      hasRefreshed.current = true
      console.log('[v0] No token or not authenticated, setting loading to false')
      state.setLoading(false)
    }
  }, [hasHydrated])

  return <>{children}</>
}
