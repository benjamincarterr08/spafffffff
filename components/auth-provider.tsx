'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, refreshUserData, setLoading } = useAuthStore()

  useEffect(() => {
    // On mount, check if we have a stored token and refresh user data
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    
    if (token && isAuthenticated) {
      // Refresh user data to ensure it's still valid
      refreshUserData().finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, refreshUserData, setLoading])

  return <>{children}</>
}
