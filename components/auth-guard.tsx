'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { Spinner } from '@/components/ui/spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredPageUrl?: string
}

export function AuthGuard({ children, requiredPageUrl }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, checkAccess, accessiblePages } = useAuthStore()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function verifyAccess() {
      if (isLoading) return

      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // If a specific page URL is required, check access
      if (requiredPageUrl) {
        const canAccess = await checkAccess(requiredPageUrl)
        setHasAccess(canAccess)
        
        if (!canAccess) {
          // Redirect to dashboard or first accessible page
          const firstAccessible = accessiblePages[0]
          router.push(firstAccessible?.page_url || '/dashboard')
        }
      } else {
        // No specific page required, just check authentication
        setHasAccess(true)
      }

      setChecking(false)
    }

    verifyAccess()
  }, [isAuthenticated, isLoading, pathname, requiredPageUrl, router, checkAccess, accessiblePages])

  // Show loading while checking auth
  if (isLoading || checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  // No access to this page
  if (hasAccess === false) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
