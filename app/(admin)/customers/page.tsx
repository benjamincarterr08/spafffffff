"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEye, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/data-table"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { api, fetcher } from "@/lib/api"
import type { Customer } from "@/lib/types"

export default function CustomersPage() {
  const { data: customers, error, isLoading, mutate } = useSWR<Customer[]>("/customers", fetcher)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await api.delete(`/customers/${deleteId}`)
      mutate()
      setDeleteId(null)
    } catch (err) {
      console.error("Failed to delete customer:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<Customer>[] = [
    {
      key: "customer_id",
      header: "ID",
      sortable: true,
    },
    {
      key: "username",
      header: "Username",
      sortable: true,
      render: (customer) => (
        <div>
          <div className="font-medium">{customer.username}</div>
          {customer.email && (
            <div className="text-sm text-muted-foreground">{customer.email}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (customer) => (
        <StatusBadge status={customer.status} />
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (customer) =>
        customer.created_at
          ? new Date(customer.created_at).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      header: "Actions",
      render: (customer) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/customers/${customer.customer_id}`}>
              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/customers/${customer.customer_id}/edit`}>
              <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(customer.customer_id)}
          >
            <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load customers</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and statuses</p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers || []}
        isLoading={isLoading}
        searchKey="username"
        searchPlaceholder="Search customers..."
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
