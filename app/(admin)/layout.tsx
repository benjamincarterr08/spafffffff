'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Header } from '@/components/header'
import { AuthGuard } from '@/components/auth-guard'
import { AuthProvider } from '@/components/auth-provider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex flex-1 flex-col p-4 md:p-6">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    </AuthProvider>
  )
}
