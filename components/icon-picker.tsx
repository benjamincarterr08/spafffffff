'use client'

import { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

// Common icons for admin panels
const COMMON_ICONS = [
  'faUsers', 'faUser', 'faUserGroup', 'faUserPlus', 'faUserMinus',
  'faGear', 'faGears', 'faCog', 'faWrench', 'faSliders',
  'faFolder', 'faFolderOpen', 'faFile', 'faFileLines', 'faFiles',
  'faHome', 'faHouse', 'faDashboard', 'faGauge', 'faChartLine',
  'faShoppingCart', 'faCartShopping', 'faBagShopping', 'faStore',
  'faEnvelope', 'faMessage', 'faComments', 'faBell', 'faInbox',
  'faLock', 'faUnlock', 'faShield', 'faKey', 'faFingerprint',
  'faDatabase', 'faServer', 'faCloud', 'faCode', 'faTerminal',
  'faImage', 'faImages', 'faCamera', 'faVideo', 'faMusic',
  'faCalendar', 'faClock', 'faHourglass', 'faStopwatch',
  'faTag', 'faTags', 'faBookmark', 'faStar', 'faHeart',
  'faCheck', 'faXmark', 'faPlus', 'faMinus', 'faCircle',
  'faList', 'faTable', 'faGrid', 'faTh', 'faBars',
  'faSearch', 'faMagnifyingGlass', 'faFilter', 'faSort',
  'faDownload', 'faUpload', 'faCloudArrowUp', 'faCloudArrowDown',
  'faLink', 'faExternalLink', 'faShare', 'faCopy', 'faPaste',
  'faPen', 'faPencil', 'faEdit', 'faTrash', 'faTrashCan',
  'faEye', 'faEyeSlash', 'faExpand', 'faCompress',
  'faChevronRight', 'faChevronLeft', 'faChevronUp', 'faChevronDown',
  'faArrowRight', 'faArrowLeft', 'faArrowUp', 'faArrowDown',
  'faCircleInfo', 'faCircleQuestion', 'faCircleExclamation', 'faTriangleExclamation',
  'faDollarSign', 'faEuroSign', 'faCreditCard', 'faMoneyBill',
  'faGlobe', 'faMapMarker', 'faLocationDot', 'faMapPin',
  'faPhone', 'faMobile', 'faDesktop', 'faLaptop', 'faTablet',
]

interface IconPickerProps {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const allIcons = useMemo(() => {
    const iconEntries = Object.entries(Icons).filter(
      ([name, icon]) => 
        name.startsWith('fa') && 
        typeof icon === 'object' && 
        'icon' in icon
    ) as [string, IconDefinition][]
    return iconEntries
  }, [])

  const filteredIcons = useMemo(() => {
    const searchLower = search.toLowerCase()
    if (!search) {
      // Show common icons when no search
      return COMMON_ICONS.map((name) => {
        const icon = (Icons as Record<string, IconDefinition>)[name]
        return icon ? [name, icon] as [string, IconDefinition] : null
      }).filter(Boolean) as [string, IconDefinition][]
    }
    return allIcons.filter(([name]) => 
      name.toLowerCase().includes(searchLower)
    ).slice(0, 50)
  }, [search, allIcons])

  const selectedIcon = value ? (Icons as Record<string, IconDefinition>)[value] : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={disabled}
        >
          {selectedIcon ? (
            <>
              <FontAwesomeIcon icon={selectedIcon} className="mr-2 h-4 w-4" />
              {value}
            </>
          ) : (
            <span className="text-muted-foreground">Select an icon...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-2">
            {filteredIcons.map(([name, icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name)
                  setOpen(false)
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent ${
                  value === name ? 'bg-primary text-primary-foreground' : ''
                }`}
                title={name}
              >
                <FontAwesomeIcon icon={icon} className="h-4 w-4" />
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No icons found
            </p>
          )}
        </ScrollArea>
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
