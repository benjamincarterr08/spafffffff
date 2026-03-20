'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faFile, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/data-table'
import { fetcher } from '@/lib/api'
import type { PageWithCategory } from '@/lib/types'

function getIcon(iconName: string | null): IconDefinition {
  if (!iconName) return faFile
  const icon = (Icons as Record<string, IconDefinition>)[iconName]
  return icon || faFile
}

export default function PagesPage() {
  const router = useRouter()
  const { data: pages, isLoading } = useSWR<PageWithCategory[]>('/pages', fetcher)

  const columns: Column<PageWithCategory>[] = [
    {
      key: 'icon',
      header: '',
      cell: (page) => (
        <FontAwesomeIcon
          icon={getIcon(page.icon)}
          className="h-4 w-4 text-muted-foreground"
        />
      ),
    },
    {
      key: 'title',
      header: 'Title',
      cell: (page) => (
        <span className="font-medium">{page.title}</span>
      ),
    },
    {
      key: 'page_url',
      header: 'URL',
      cell: (page) => (
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-1 text-xs">
            {page.page_url}
          </code>
          <Link
            href={page.page_url}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3" />
          </Link>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (page) => page.category ? (
        <Badge
          variant="outline"
          style={{ borderColor: page.category.color || undefined }}
        >
          {page.category.name}
        </Badge>
      ) : (
        <span className="text-muted-foreground">Uncategorized</span>
      ),
    },
    {
      key: 'sort_order',
      header: 'Order',
      cell: (page) => page.sort_order,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">
            Manage navigation pages
          </p>
        </div>
        <Button asChild>
          <Link href="/pages/new">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      <DataTable
        data={pages || []}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search pages..."
        onRowClick={(page) => router.push(`/pages/${page.pid}`)}
        getRowKey={(page) => page.pid}
        emptyMessage="No pages found"
      />
    </div>
  )
}
