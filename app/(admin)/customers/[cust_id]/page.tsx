"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faPencil,
  faTrash,
  faUser,
  faEnvelope,
  faPhone,
  faCalendar,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { api, fetcher } from "@/lib/api"
import type { Customer, Purchase } from "@/lib/types"
import { useState } from "react"

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ cust_id: string }>
}) {
  const { cust_id } = use(params)
  const router = useRouter()
  const { data: customer, error, isLoading } = useSWR<Customer>(
    `/customers/${cust_id}`,
    fetcher
  )
  const { data: purchases } = useSWR<Purchase[]>(
    `/customers/${cust_id}/purchases`,
    fetcher
  )
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/customers/${cust_id}`)
      router.push("/customers")
    } catch (err) {
      console.error("Failed to delete customer:", err)
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

  if (error || !customer) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load customer</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/customers">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Customers
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
            <Link href="/customers">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">Customer #{customer.cust_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/customers/${cust_id}/edit`}>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-muted-foreground" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={customer.status} color={customer.status_color} />
            </div>
            {customer.email && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                  Email
                </span>
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="h-3 w-3" />
                  Phone
                </span>
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right max-w-[200px]">{customer.address}</span>
              </div>
            )}
            {customer.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                  Created
                </span>
                <span>{new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-muted-foreground" />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases && purchases.length > 0 ? (
              <div className="space-y-3">
                {purchases.slice(0, 5).map((purchase) => (
                  <Link
                    key={purchase.pur_id}
                    href={`/purchases/${purchase.pur_id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <div className="font-medium">Purchase #{purchase.pur_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {purchase.created_at
                          ? new Date(purchase.created_at).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                    <StatusBadge status={purchase.status} color={purchase.status_color} />
                  </Link>
                ))}
                {purchases.length > 5 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/purchases?customer=${cust_id}`}>
                      View All ({purchases.length})
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No purchases yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete "${customer.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
