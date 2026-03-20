'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrash, faPen, faFolder } from '@fortawesome/free-solid-svg-icons'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { RoleSelector } from '@/components/role-selector'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { api, fetcher } from '@/lib/api'
import type { Category, Role, Page } from '@/lib/types'
import { toast } from 'sonner'

interface CategoryFull extends Category {
  roles?: Role[]
  pages?: Page[]
}

function getIcon(iconName: string | null): IconDefinition {
  if (!iconName) return faFolder
  const icon = (Icons as Record<string, IconDefinition>)[iconName]
  return icon || faFolder
}

export default function CategoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const cid = params.cid as string

  const { data: category, isLoading, mutate } = useSWR<CategoryFull>(`/categories/${cid}/full`, fetcher)
  const { data: allRoles } = useSWR<Role[]>('/roles', fetcher)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/categories/${cid}`)
      toast.success('Category deleted successfully')
      router.push('/categories')
    } catch (error) {
      toast.error('Failed to delete category')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  const handleAssignRole = async (roleId: number) => {
    try {
      await api.post(`/categories/${cid}/roles/${roleId}`)
      await mutate()
      toast.success('Role assigned')
    } catch (error) {
      toast.error('Failed to assign role')
      throw error
    }
  }

  const handleRemoveRole = async (roleId: number) => {
    try {
      await api.delete(`/categories/${cid}/roles/${roleId}`)
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

  if (!category) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/categories">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
        <p className="text-muted-foreground">Category not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/categories">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={getIcon(category.icon)}
              className="h-8 w-8"
              style={{ color: category.color || undefined }}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
              <p className="text-muted-foreground">
                {category.description || 'No description'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/categories/${cid}/edit`}>
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
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Basic category details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category ID</p>
                <p className="font-medium">{category.cid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{category.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Icon</p>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={getIcon(category.icon)}
                    className="h-4 w-4"
                    style={{ color: category.color || undefined }}
                  />
                  <span className="font-mono text-sm">{category.icon || 'None'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                {category.color ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-mono text-sm">{category.color}</span>
                  </div>
                ) : (
                  <span className="font-medium">None</span>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sort Order</p>
                <p className="font-medium">{category.sort_order}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Roles</CardTitle>
            <CardDescription>Roles that grant access to this category</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleSelector
              assignedRoles={category.roles || []}
              availableRoles={allRoles || []}
              onAssign={handleAssignRole}
              onRemove={handleRemoveRole}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pages in this Category</CardTitle>
            <CardDescription>Navigation pages under this category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {category.pages && category.pages.length > 0 ? (
                category.pages.map((page) => (
                  <Link key={page.pid} href={`/pages/${page.pid}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      <FontAwesomeIcon
                        icon={getIcon(page.icon)}
                        className="mr-2 h-3 w-3"
                      />
                      {page.title}
                    </Badge>
                  </Link>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">No pages in this category</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${category.name}"? Pages in this category will be uncategorized.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
