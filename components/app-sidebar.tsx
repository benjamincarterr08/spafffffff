'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from '@fortawesome/free-solid-svg-icons'
import { faFolder, faGauge } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/lib/auth'
import type { Category, Page } from '@/lib/types'

// Helper to get Font Awesome icon by name
function getIcon(iconName: string | null): IconDefinition {
  if (!iconName) return faFolder
  
  // Handle different naming conventions
  const normalizedName = iconName.startsWith('fa') ? iconName : `fa${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`
  const icon = (Icons as Record<string, IconDefinition>)[normalizedName]
  return icon || faFolder
}

// Group pages by category
function groupPagesByCategory(
  pages: Page[] | undefined | null,
  categories: Category[] | undefined | null
): { category: Category | null; pages: Page[] }[] {
  // Handle undefined/null/non-array inputs
  const safePages = Array.isArray(pages) ? pages : []
  const safeCategories = Array.isArray(categories) ? categories : []
  
  const categoryMap = new Map<number | null, Page[]>()
  
  // Initialize with empty arrays for each category
  safeCategories.forEach((cat) => {
    categoryMap.set(cat.cid, [])
  })
  categoryMap.set(null, []) // For uncategorized pages
  
  // Assign pages to categories
  safePages.forEach((page) => {
    const catId = page.category_id
    if (categoryMap.has(catId)) {
      categoryMap.get(catId)!.push(page)
    } else {
      categoryMap.get(null)!.push(page)
    }
  })
  
  // Build result array
  const result: { category: Category | null; pages: Page[] }[] = []
  
  // Add categorized pages (sorted by category sort_order)
  const sortedCategories = [...safeCategories].sort((a, b) => a.sort_order - b.sort_order)
  sortedCategories.forEach((cat) => {
    const categoryPages = categoryMap.get(cat.cid) || []
    if (categoryPages.length > 0) {
      result.push({
        category: cat,
        pages: categoryPages.sort((a, b) => a.sort_order - b.sort_order),
      })
    }
  })
  
  // Add uncategorized pages at the end
  const uncategorized = categoryMap.get(null) || []
  if (uncategorized.length > 0) {
    result.push({
      category: null,
      pages: uncategorized.sort((a, b) => a.sort_order - b.sort_order),
    })
  }
  
  return result
}

export function AppSidebar() {
  const pathname = usePathname()
  const { accessiblePages, accessibleCategories, user } = useAuthStore()
  
  const groupedPages = groupPagesByCategory(accessiblePages, accessibleCategories)

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/5/52/OMSI_2.png"
            alt="OmsiDev"
            width={32}
            height={32}
            className="rounded"
            loading="eager"
            style={{ width: 32, height: 'auto' }}
          />
          <span className="text-lg font-semibold">OmsiDev Admin</span>
        </Link>
      </SidebarHeader>
      
      <SidebarSeparator />
      
      <SidebarContent>
        {/* Dashboard link - always visible */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                <Link href="/dashboard">
                  <FontAwesomeIcon icon={faGauge} className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        {/* Grouped navigation */}
        {groupedPages.map(({ category, pages }) => (
          <SidebarGroup key={category?.cid ?? 'uncategorized'}>
            <SidebarGroupLabel>
              {category ? (
                <span 
                  className="flex items-center gap-2"
                  style={{ color: category.color || undefined }}
                >
                  <FontAwesomeIcon 
                    icon={getIcon(category.icon)} 
                    className="h-3 w-3" 
                  />
                  {category.name}
                </span>
              ) : (
                'Other'
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages.map((page) => (
                  <SidebarMenuItem key={page.pid}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === page.page_url || pathname.startsWith(`${page.page_url}/`)}
                    >
                      <Link href={page.page_url}>
                        <FontAwesomeIcon 
                          icon={getIcon(page.icon)} 
                          className="h-4 w-4" 
                        />
                        <span>{page.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground">
          <p>Signed in as</p>
          <p className="font-medium text-foreground">{user?.username || 'Unknown'}</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
