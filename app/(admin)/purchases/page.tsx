"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEye, faPencil, faTrash, faUser } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/data-table"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { api, fetcher } from "@/lib/api"
import type { Purchase } from "@/lib/types"

export default function PurchasesPage() {
  const searchParams = useSearchParams()
  const customerId = searchParams.get("customer")

  const endpoint = customerId
    ? `/customers/${customerId}/purchases`
    : "/purchases"

  const { data: purchases, error, isLoading, mutate } = useSWR<Purchase[]>(
    endpoint,
    fetcher
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await api.delete(`/purchases/${deleteId}`)
      mutate()
      setDeleteId(null)
    } catch (err) {
      console.error("Failed to delete purchase:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<Purchase>[] = [
    {
      key: "pur_id",
      header: "ID",
      sortable: true,
    },
    {
      key: "customer_name",
      header: "Customer",
      sortable: true,
      render: (purchase) => (
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="h-3 w-3 text-muted-foreground" />
          {purchase.customer_name ? (
            <Link
              href={`/customers/${purchase.cust_id}`}
              className="hover:underline"
            >
              {purchase.customer_name}
            </Link>
          ) : (
            <span className="text-muted-foreground">Unknown</span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (purchase) => (
        <div className="max-w-[300px] truncate">
          {purchase.description || "-"}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (purchase) =>
        purchase.amount !== undefined
          ? `$${purchase.amount.toLocaleString()}`
          : "-",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (purchase) => (
        <StatusBadge status={purchase.status} color={purchase.status_color} />
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (purchase) =>
        purchase.created_at
          ? new Date(purchase.created_at).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      header: "Actions",
      render: (purchase) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/purchases/${purchase.pur_id}`}>
              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/purchases/${purchase.pur_id}/edit`}>
              <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(purchase.pur_id)}
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
        <p className="text-destructive">Failed to load purchases</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchases</h1>
          <p className="text-muted-foreground">
            {customerId
              ? "Customer purchases"
              : "Manage all purchase records"}
          </p>
        </div>
        <Button asChild>
          <Link
            href={
              customerId
                ? `/purchases/new?customer=${customerId}`
                : "/purchases/new"
            }
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            New Purchase
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={purchases || []}
        isLoading={isLoading}
        searchKey="customer_name"
        searchPlaceholder="Search by customer..."
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Purchase"
        description="Are you sure you want to delete this purchase? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
