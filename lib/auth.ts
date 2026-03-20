'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserFull, Role, Page, Category, LoginResponse, AccessCheckResponse } from './types'
import { api } from './api'

interface AuthState {
  user: UserFull | null
  token: string | null
  roles: Role[]
  accessiblePages: Page[]
  accessibleCategories: Category[]
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAccess: (url: string) => Promise<boolean>
  refreshUserData: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      roles: [],
      accessiblePages: [],
      accessibleCategories: [],
      isAuthenticated: false,
      isLoading: true,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true })
        console.log('[v0] Login started for:', username)
        
        try {
          // Call the login endpoint
          const response = await api.post<LoginResponse>('/auth/login', {
            identifier: username,
            password,
          })
          
          console.log('[v0] Login response:', response)
          
          if (!response.success || !response.data?.user) {
            throw new Error(response.message || 'Login failed')
          }
          
          const { user: loginUser, access_token } = response.data
          console.log('[v0] Login user:', loginUser, 'token:', !!access_token)
          
          // Store token in localStorage for API client
          if (typeof window !== 'undefined' && access_token) {
            localStorage.setItem('auth_token', access_token)
          }
          
          // Load full user data
          console.log('[v0] Fetching user full data for uid:', loginUser.uid)
          const userFull = await api.get<UserFull>(`/users/${loginUser.uid}/full`)
          console.log('[v0] userFull:', userFull)
          const accessiblePages = await api.get<Page[]>(`/users/${loginUser.uid}/accessible-pages`)
          console.log('[v0] accessiblePages:', accessiblePages)
          const accessibleCategories = await api.get<Category[]>(`/users/${loginUser.uid}/accessible-categories`)
          console.log('[v0] accessibleCategories:', accessibleCategories)
          
          set({
            user: userFull,
            token: access_token || null,
            roles: userFull.roles,
            accessiblePages,
            accessibleCategories,
            isAuthenticated: true,
            isLoading: false,
          })
          console.log('[v0] Login state set successfully')
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
        
        set({
          user: null,
          token: null,
          roles: [],
          accessiblePages: [],
          accessibleCategories: [],
          isAuthenticated: false,
          isLoading: false,
        })
      },
      
      checkAccess: async (url: string) => {
        const { user } = get()
        if (!user) return false
        
        try {
          const response = await api.get<AccessCheckResponse>(
            `/users/${user.uid}/can-access-url?page_url=${encodeURIComponent(url)}`
          )
          return response.can_access
        } catch {
          return false
        }
      },
      
      refreshUserData: async () => {
        const { user, token } = get()
        console.log('[v0] refreshUserData called:', { hasUser: !!user, uid: user?.uid, hasToken: !!token })
        if (!user || !token) {
          console.log('[v0] refreshUserData: no user or token, returning early')
          return
        }
        
        try {
          console.log('[v0] refreshUserData: fetching user data...')
          const userFull = await api.get<UserFull>(`/users/${user.uid}/full`)
          console.log('[v0] refreshUserData: got userFull:', userFull?.username)
          const accessiblePages = await api.get<Page[]>(`/users/${user.uid}/accessible-pages`)
          console.log('[v0] refreshUserData: got accessiblePages:', accessiblePages?.length)
          const accessibleCategories = await api.get<Category[]>(`/users/${user.uid}/accessible-categories`)
          console.log('[v0] refreshUserData: got accessibleCategories:', accessibleCategories?.length)
          
          set({
            user: userFull,
            roles: userFull.roles,
            accessiblePages,
            accessibleCategories,
          })
          console.log('[v0] refreshUserData: state updated successfully')
        } catch (error) {
          console.log('[v0] refreshUserData error:', error)
          // If refresh fails, logout
          get().logout()
        }
      },
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'omsidev-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        roles: state.roles,
        accessiblePages: state.accessiblePages,
        accessibleCategories: state.accessibleCategories,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[v0] onRehydrateStorage called, state:', {
          hasState: !!state,
          user: state?.user?.username,
          isAuthenticated: state?.isAuthenticated,
          accessiblePagesCount: state?.accessiblePages?.length,
        })
        // After rehydration, set loading to false
        if (state) {
          state.setLoading(false)
        }
      },
    }
  )
)

// Helper hook to get current user
export function useUser() {
  return useAuthStore((state) => state.user)
}

// Helper hook to check if user has a specific role
export function useHasRole(roleName: string) {
  return useAuthStore((state) => 
    state.roles.some((role) => role.name === roleName)
  )
}

// Helper hook to check if user can access a page
export function useCanAccessPage(pageUrl: string) {
  return useAuthStore((state) =>
    state.accessiblePages.some((page) => page.page_url === pageUrl)
  )
}
