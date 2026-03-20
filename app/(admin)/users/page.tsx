'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/data-table'
import { fetcher } from '@/lib/api'
import type { UserFull } from '@/lib/types'

export default function UsersPage() {
  const router = useRouter()
  const { data: users, isLoading } = useSWR<UserFull[]>('/users', fetcher)

  const columns: Column<UserFull>[] = [
    {
      key: 'username',
      header: 'Username',
      cell: (user) => (
        <span className="font-medium">{user.username}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (user) => user.email,
    },
    {
      key: 'roles',
      header: 'Roles',
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles?.length > 0 ? (
            user.roles.slice(0, 3).map((role) => (
              <Badge key={role.rid} variant="secondary" className="text-xs">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No roles</span>
          )}
          {user.roles?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{user.roles.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (user) => new Date(user.created_at).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage staff accounts and their roles
          </p>
        </div>
        <Button asChild>
          <Link href="/users/new">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            New User
          </Link>
        </Button>
      </div>

      <DataTable
        data={users || []}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search users..."
        onRowClick={(user) => router.push(`/users/${user.uid}`)}
        getRowKey={(user) => user.uid}
        emptyMessage="No users found"
      />
    </div>
  )
}
