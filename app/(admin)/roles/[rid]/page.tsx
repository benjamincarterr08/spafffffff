'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrash, faPen } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { api, fetcher } from '@/lib/api'
import type { Role, User, Category, Page } from '@/lib/types'
import { toast } from 'sonner'

interface RoleFull extends Role {
  users?: User[]
  categories?: Category[]
  pages?: Page[]
}

export default function RoleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const rid = params.rid as string

  const { data: role, isLoading } = useSWR<RoleFull>(`/roles/${rid}/full`, fetcher)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/roles/${rid}`)
      toast.success('Role deleted successfully')
      router.push('/roles')
    } catch (error) {
      toast.error('Failed to delete role')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/roles">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Roles
          </Link>
        </Button>
        <p className="text-muted-foreground">Role not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/roles">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
            <p className="text-muted-foreground">
              {role.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/roles/${rid}/edit`}>
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
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Basic role details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Role ID</p>
                <p className="font-medium">{role.rid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{role.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{role.description || 'No description'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(role.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(role.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users with this Role</CardTitle>
            <CardDescription>Staff accounts assigned this role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {role.users && role.users.length > 0 ? (
                role.users.map((user) => (
                  <Link key={user.uid} href={`/users/${user.uid}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {user.username}
                    </Badge>
                  </Link>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No users have this role</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessible Categories</CardTitle>
            <CardDescription>Categories this role grants access to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {role.categories && role.categories.length > 0 ? (
                role.categories.map((category) => (
                  <Link key={category.cid} href={`/categories/${category.cid}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      style={{ borderColor: category.color || undefined }}
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No categories assigned</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessible Pages</CardTitle>
            <CardDescription>Pages this role grants access to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {role.pages && role.pages.length > 0 ? (
                role.pages.map((page) => (
                  <Link key={page.pid} href={`/pages/${page.pid}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      {page.title}
                    </Badge>
                  </Link>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No pages assigned</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the "${role.name}" role? This will remove the role from all users.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
