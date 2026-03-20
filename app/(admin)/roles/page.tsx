'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data-table'
import { fetcher } from '@/lib/api'
import type { Role } from '@/lib/types'

export default function RolesPage() {
  const router = useRouter()
  const { data: roles, isLoading } = useSWR<Role[]>('/roles', fetcher)

  const columns: Column<Role>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (role) => (
        <span className="font-medium">{role.name}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (role) => (
        <span className="text-muted-foreground">
          {role.description || 'No description'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (role) => new Date(role.created_at).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions
          </p>
        </div>
        <Button asChild>
          <Link href="/roles/new">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            New Role
          </Link>
        </Button>
      </div>

      <DataTable
        data={roles || []}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search roles..."
        onRowClick={(role) => router.push(`/roles/${role.rid}`)}
        getRowKey={(role) => role.rid}
        emptyMessage="No roles found"
      />
    </div>
  )
}
