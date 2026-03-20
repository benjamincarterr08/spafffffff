"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { api, fetcher } from "@/lib/api"
import type { Customer } from "@/lib/types"

const STATUS_OPTIONS = [
  { value: "Pending", color: "yellow" },
  { value: "Processing", color: "blue" },
  { value: "Completed", color: "green" },
  { value: "Cancelled", color: "red" },
  { value: "Refunded", color: "orange" },
]

export default function NewPurchasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomer = searchParams.get("customer")

  const { data: customers } = useSWR<Customer[]>("/customers", fetcher)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    cust_id: preselectedCustomer || "",
    description: "",
    amount: "",
    status: "Pending",
    status_color: "yellow",
  })

  const handleStatusChange = (status: string) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status)
    setFormData({
      ...formData,
      status,
      status_color: option?.color || "gray",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        cust_id: parseInt(formData.cust_id),
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
      }
      const response = await api.post<{ pur_id: number }>("/purchases", payload)
      router.push(`/purchases/${response.pur_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create purchase")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/purchases">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Purchase</h1>
          <p className="text-muted-foreground">Create a new purchase record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.cust_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cust_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem
                        key={customer.cust_id}
                        value={customer.cust_id.toString()}
                      >
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Purchase details..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/purchases">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.cust_id}>
                {isSubmitting ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                )}
                Create Purchase
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
