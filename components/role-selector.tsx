'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import type { Role } from '@/lib/types'

interface RoleSelectorProps {
  assignedRoles: Role[]
  availableRoles: Role[]
  onAssign: (roleId: number) => Promise<void>
  onRemove: (roleId: number) => Promise<void>
  isLoading?: boolean
}

export function RoleSelector({
  assignedRoles,
  availableRoles,
  onAssign,
  onRemove,
  isLoading,
}: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const unassignedRoles = availableRoles.filter(
    (role) => !assignedRoles.some((assigned) => assigned.rid === role.rid)
  )

  const handleAssign = async () => {
    if (!selectedRole) return
    setIsAssigning(true)
    try {
      await onAssign(parseInt(selectedRole))
      setSelectedRole('')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemove = async (roleId: number) => {
    setRemovingId(roleId)
    try {
      await onRemove(roleId)
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner size="sm" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {assignedRoles.length === 0 ? (
          <span className="text-sm text-muted-foreground">No roles assigned</span>
        ) : (
          assignedRoles.map((role) => (
            <Badge
              key={role.rid}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {role.name}
              <button
                onClick={() => handleRemove(role.rid)}
                disabled={removingId === role.rid}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 disabled:opacity-50"
              >
                {removingId === role.rid ? (
                  <Spinner size="sm" className="h-3 w-3" />
                ) : (
                  <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                )}
              </button>
            </Badge>
          ))
        )}
      </div>

      {unassignedRoles.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              {unassignedRoles.map((role) => (
                <SelectItem key={role.rid} value={role.rid.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedRole || isAssigning}
          >
            {isAssigning ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <FontAwesomeIcon icon={faPlus} className="mr-1 h-3 w-3" />
            )}
            Add
          </Button>
        </div>
      )}
    </div>
  )
}
