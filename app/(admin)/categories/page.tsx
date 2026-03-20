'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faFolder } from '@fortawesome/free-solid-svg-icons'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data-table'
import { fetcher } from '@/lib/api'
import type { Category } from '@/lib/types'

function getIcon(iconName: string | null): IconDefinition {
  if (!iconName) return faFolder
  const icon = (Icons as Record<string, IconDefinition>)[iconName]
  return icon || faFolder
}

export default function CategoriesPage() {
  const router = useRouter()
  const { data: categories, isLoading } = useSWR<Category[]>('/categories', fetcher)

  const columns: Column<Category>[] = [
    {
      key: 'icon',
      header: '',
      cell: (category) => (
        <FontAwesomeIcon
          icon={getIcon(category.icon)}
          className="h-4 w-4"
          style={{ color: category.color || undefined }}
        />
      ),
    },
    {
      key: 'name',
      header: 'Name',
      cell: (category) => (
        <span className="font-medium">{category.name}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (category) => (
        <span className="text-muted-foreground">
          {category.description || 'No description'}
        </span>
      ),
    },
    {
      key: 'color',
      header: 'Color',
      cell: (category) => category.color ? (
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded border"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-mono text-xs">{category.color}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
    },
    {
      key: 'sort_order',
      header: 'Order',
      cell: (category) => category.sort_order,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage navigation categories
          </p>
        </div>
        <Button asChild>
          <Link href="/categories/new">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            New Category
          </Link>
        </Button>
      </div>

      <DataTable
        data={categories || []}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search categories..."
        onRowClick={(category) => router.push(`/categories/${category.cid}`)}
        getRowKey={(category) => category.cid}
        emptyMessage="No categories found"
      />
    </div>
  )
}
