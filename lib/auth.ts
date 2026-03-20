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
        
        try {
          // Call the login endpoint
          const response = await api.post<LoginResponse>('/auth/login', {
            username,
            password,
          })
          
          // Store token in localStorage for API client
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.access_token)
          }
          
          // Load full user data
          const userFull = await api.get<UserFull>(`/users/${response.user.uid}/full`)
          const accessiblePages = await api.get<Page[]>(`/users/${response.user.uid}/accessible-pages`)
          const accessibleCategories = await api.get<Category[]>(`/users/${response.user.uid}/accessible-categories`)
          
          set({
            user: userFull,
            token: response.access_token,
            roles: userFull.roles,
            accessiblePages,
            accessibleCategories,
            isAuthenticated: true,
            isLoading: false,
          })
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
        if (!user || !token) return
        
        try {
          const userFull = await api.get<UserFull>(`/users/${user.uid}/full`)
          const accessiblePages = await api.get<Page[]>(`/users/${user.uid}/accessible-pages`)
          const accessibleCategories = await api.get<Category[]>(`/users/${user.uid}/accessible-categories`)
          
          set({
            user: userFull,
            roles: userFull.roles,
            accessiblePages,
            accessibleCategories,
          })
        } catch {
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
