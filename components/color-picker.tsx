'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#64748b', '#71717a',
]

interface ColorPickerProps {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value || '')

  const handleColorSelect = (color: string) => {
    onChange(color)
    setCustomColor(color)
    setOpen(false)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      onChange(color)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={disabled}
        >
          {value ? (
            <>
              <div
                className="mr-2 h-4 w-4 rounded border"
                style={{ backgroundColor: value }}
              />
              {value}
            </>
          ) : (
            <span className="text-muted-foreground">Select a color...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`h-8 w-8 rounded-md border-2 transition-transform hover:scale-110 ${
                  value === color ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <div
              className="h-9 w-9 shrink-0 rounded-md border"
              style={{ backgroundColor: customColor || 'transparent' }}
            />
            <Input
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#000000"
              className="font-mono"
            />
          </div>

          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange(null)
                setCustomColor('')
                setOpen(false)
              }}
            >
              Clear selection
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
