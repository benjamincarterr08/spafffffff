'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faShoppingCart, faUserGroup, faFile } from '@fortawesome/free-solid-svg-icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/auth'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'

interface DashboardStats {
  users: number
  customers: number
  purchases: number
  files: number
}

export default function DashboardPage() {
  const { user, roles } = useAuthStore()
  const { data: stats } = useSWR<DashboardStats>('/stats/dashboard', fetcher)

  const statCards = [
    {
      title: 'Users',
      value: stats?.users ?? '-',
      icon: faUsers,
      description: 'Total staff accounts',
      href: '/users',
    },
    {
      title: 'Customers',
      value: stats?.customers ?? '-',
      icon: faUserGroup,
      description: 'Registered customers',
      href: '/customers',
    },
    {
      title: 'Purchases',
      value: stats?.purchases ?? '-',
      icon: faShoppingCart,
      description: 'Total purchases',
      href: '/purchases',
    },
    {
      title: 'Files',
      value: stats?.files ?? '-',
      icon: faFile,
      description: 'Uploaded files',
      href: '/files',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <FontAwesomeIcon icon={stat.icon} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Roles</CardTitle>
            <CardDescription>Assigned permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <span
                    key={role.rid}
                    className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {role.name}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">No roles assigned</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
