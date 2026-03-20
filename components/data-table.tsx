'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons'
import { Spinner } from '@/components/ui/spinner'
import { Empty } from '@/components/ui/empty'

export interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (item: T) => void
  getRowKey: (item: T) => string | number
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  searchable,
  searchPlaceholder = 'Search...',
  onRowClick,
  getRowKey,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 10

  // Simple client-side filtering (for small datasets)
  const filteredData = searchable && search
    ? data.filter((item) =>
        columns.some((col) => {
          const cellContent = col.cell(item)
          if (typeof cellContent === 'string') {
            return cellContent.toLowerCase().includes(search.toLowerCase())
          }
          return false
        })
      )
    : data

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-10"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Empty>{emptyMessage}</Empty>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow
                  key={getRowKey(item)}
                  onClick={() => onRowClick?.(item)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>{column.cell(item)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filteredData.length)} of{' '}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
