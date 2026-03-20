'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrash, faPen, faFile, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { RoleSelector } from '@/components/role-selector'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { api, fetcher } from '@/lib/api'
import type { Page, Role, Category } from '@/lib/types'
import { toast } from 'sonner'

interface PageFull extends Page {
  roles?: Role[]
  category?: Category | null
}

function getIcon(iconName: string | null): IconDefinition {
  if (!iconName) return faFile
  const icon = (Icons as Record<string, IconDefinition>)[iconName]
  return icon || faFile
}

export default function PageDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pid = params.pid as string

  const { data: page, isLoading, mutate } = useSWR<PageFull>(`/pages/${pid}/full`, fetcher)
  const { data: allRoles } = useSWR<Role[]>('/roles', fetcher)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/pages/${pid}`)
      toast.success('Page deleted successfully')
      router.push('/pages')
    } catch (error) {
      toast.error('Failed to delete page')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  const handleAssignRole = async (roleId: number) => {
    try {
      await api.post(`/pages/${pid}/roles/${roleId}`)
      await mutate()
      toast.success('Role assigned')
    } catch (error) {
      toast.error('Failed to assign role')
      throw error
    }
  }

  const handleRemoveRole = async (roleId: number) => {
    try {
      await api.delete(`/pages/${pid}/roles/${roleId}`)
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

  if (!page) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/pages">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Pages
          </Link>
        </Button>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pages">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={getIcon(page.icon)}
              className="h-8 w-8 text-muted-foreground"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
              <p className="text-muted-foreground">
                {page.description || 'No description'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={page.page_url} target="_blank">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 h-4 w-4" />
              Visit Page
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pages/${pid}/edit`}>
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
            <CardTitle>Page Information</CardTitle>
            <CardDescription>Basic page details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Page ID</p>
                <p className="font-medium">{page.pid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{page.title}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">URL</p>
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {page.page_url}
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Icon</p>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={getIcon(page.icon)}
                    className="h-4 w-4"
                  />
                  <span className="font-mono text-sm">{page.icon || 'None'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                {page.category ? (
                  <Link href={`/categories/${page.category.cid}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      style={{ borderColor: page.category.color || undefined }}
                    >
                      {page.category.name}
                    </Badge>
                  </Link>
                ) : (
                  <span className="font-medium">Uncategorized</span>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sort Order</p>
                <p className="font-medium">{page.sort_order}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page-Specific Roles</CardTitle>
            <CardDescription>Additional roles required for this page (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleSelector
              assignedRoles={page.roles || []}
              availableRoles={allRoles || []}
              onAssign={handleAssignRole}
              onRemove={handleRemoveRole}
            />
            <p className="mt-4 text-xs text-muted-foreground">
              These roles are in addition to category-level access. Leave empty to inherit from category.
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Page"
        description={`Are you sure you want to delete "${page.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
