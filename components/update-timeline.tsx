"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle, faUser, faCalendar } from "@fortawesome/free-solid-svg-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PurchaseUpdate } from "@/lib/types"

interface UpdateTimelineProps {
  updates: PurchaseUpdate[]
}

export function UpdateTimeline({ updates }: UpdateTimelineProps) {
  if (!updates || updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No updates yet</p>
        </CardContent>
      </Card>
    )
  }

  // Sort by date descending (most recent first)
  const sortedUpdates = [...updates].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

          <div className="space-y-6">
            {sortedUpdates.map((update, index) => (
              <div key={update.upd_id} className="relative pl-8">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-1.5 flex items-center justify-center w-6 h-6 rounded-full ${
                    index === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <FontAwesomeIcon icon={faCircle} className="h-2 w-2" />
                </div>

                {/* Update content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{update.title || "Update"}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                      {update.created_at
                        ? new Date(update.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </div>
                  </div>

                  {update.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {update.description}
                    </p>
                  )}

                  {update.created_by_name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                      <span>{update.created_by_name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
