"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faPencil,
  faTrash,
  faUser,
  faCalendar,
  faDollarSign,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { UpdateTimeline } from "@/components/update-timeline"
import { AddUpdateDialog } from "@/components/add-update-dialog"
import { api, fetcher } from "@/lib/api"
import type { Purchase, PurchaseUpdate, PurchaseFile } from "@/lib/types"

export default function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ pur_id: string }>
}) {
  const { pur_id } = use(params)
  const router = useRouter()

  const {
    data: purchase,
    error,
    isLoading,
  } = useSWR<Purchase>(`/purchases/${pur_id}`, fetcher)

  const {
    data: updates,
    mutate: mutateUpdates,
  } = useSWR<PurchaseUpdate[]>(`/purchases/${pur_id}/updates`, fetcher)

  const { data: files } = useSWR<PurchaseFile[]>(
    `/purchases/${pur_id}/files`,
    fetcher
  )

  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/purchases/${pur_id}`)
      router.push("/purchases")
    } catch (err) {
      console.error("Failed to delete purchase:", err)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load purchase</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/purchases">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Purchases
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/purchases">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Purchase #{purchase.pur_id}</h1>
            <p className="text-muted-foreground">
              {purchase.customer_name || "Unknown Customer"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddUpdateDialog
            purchaseId={parseInt(pur_id)}
            onSuccess={() => mutateUpdates()}
          />
          <Button variant="outline" asChild>
            <Link href={`/purchases/${pur_id}/edit`}>
              <FontAwesomeIcon icon={faPencil} className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge
                  status={purchase.status}
                  color={purchase.status_color}
                />
              </div>

              {purchase.customer_name && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                    Customer
                  </span>
                  <Link
                    href={`/customers/${purchase.cust_id}`}
                    className="hover:underline"
                  >
                    {purchase.customer_name}
                  </Link>
                </div>
              )}

              {purchase.amount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faDollarSign} className="h-3 w-3" />
                    Amount
                  </span>
                  <span className="font-medium">
                    ${purchase.amount.toLocaleString()}
                  </span>
                </div>
              )}

              {purchase.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                    Created
                  </span>
                  <span>
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              {purchase.description && (
                <div className="pt-4 border-t">
                  <p className="text-muted-foreground text-sm mb-2">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap">{purchase.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <UpdateTimeline updates={updates || []} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faFileAlt}
                  className="h-4 w-4 text-muted-foreground"
                />
                Attached Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {files && files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file) => (
                    <Link
                      key={file.file_id}
                      href={`/files/${file.file_id}`}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="h-4 w-4 text-muted-foreground"
                      />
                      <span className="truncate">{file.filename}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No files attached</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Purchase"
        description={`Are you sure you want to delete purchase #${purchase.pur_id}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
