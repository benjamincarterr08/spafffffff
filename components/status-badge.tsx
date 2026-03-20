"use client"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  color?: string
}

// Map status strings to Tailwind color classes
const getStatusColorClass = (status: string, color?: string): string => {
  // If a color is provided, use it directly
  if (color) {
    // Convert hex/named colors to Tailwind-compatible classes
    const colorMap: Record<string, string> = {
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    }
    const lowerColor = color.toLowerCase()
    if (colorMap[lowerColor]) {
      return colorMap[lowerColor]
    }
  }

  // Default status-based colors
  const statusLower = status.toLowerCase()
  if (statusLower.includes("active") || statusLower.includes("approved") || statusLower.includes("complete")) {
    return "bg-green-500/20 text-green-400 border-green-500/30"
  }
  if (statusLower.includes("pending") || statusLower.includes("waiting")) {
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  }
  if (statusLower.includes("inactive") || statusLower.includes("disabled") || statusLower.includes("blocked")) {
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }
  if (statusLower.includes("suspend")) {
    return "bg-orange-500/20 text-orange-400 border-orange-500/30"
  }

  return "bg-gray-500/20 text-gray-400 border-gray-500/30"
}

export function StatusBadge({ status, color }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${getStatusColorClass(status, color)} border`}
    >
      {status}
    </Badge>
  )
}
