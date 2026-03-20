'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrash, faPen } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { RoleSelector } from '@/components/role-selector'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { api, fetcher } from '@/lib/api'
import type { UserFull, Role } from '@/lib/types'
import { toast } from 'sonner'

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const uid = params.uid as string

  const { data: user, isLoading, mutate } = useSWR<UserFull>(`/users/${uid}/full`, fetcher)
  const { data: allRoles } = useSWR<Role[]>('/roles', fetcher)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/users/${uid}`)
      toast.success('User deleted successfully')
      router.push('/users')
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  const handleAssignRole = async (roleId: number) => {
    try {
      await api.post(`/users/${uid}/roles/${roleId}`)
      await mutate()
      toast.success('Role assigned')
    } catch (error) {
      toast.error('Failed to assign role')
      throw error
    }
  }

  const handleRemoveRole = async (roleId: number) => {
    try {
      await api.delete(`/users/${uid}/roles/${roleId}`)
      await mutate()
      toast.success('Role removed')
    } catch (error) {
      toast.error('Failed to remove role')
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/users">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/users">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/users/${uid}/edit`}>
              <FontAwesomeIcon icon={faPen} className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium">{user.uid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(user.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Manage user role assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleSelector
              assignedRoles={user.roles || []}
              availableRoles={allRoles || []}
              onAssign={handleAssignRole}
              onRemove={handleRemoveRole}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${user.username}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
