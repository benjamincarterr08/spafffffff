// User types
export interface User {
  uid: number
  username: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserFull extends User {
  roles: Role[]
  accessible_pages: Page[]
  accessible_categories: Category[]
}

// Role types
export interface Role {
  rid: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

// Category types
export interface Category {
  cid: number
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CategoryWithPages extends Category {
  pages: Page[]
}

// Page types
export interface Page {
  pid: number
  title: string
  page_url: string
  description: string | null
  icon: string | null
  category_id: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PageWithCategory extends Page {
  category: Category | null
}

// Customer types
export interface Customer {
  customer_id: number
  username: string
  email: string
  status: CustomerStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'pending'

export interface CustomerFull extends Customer {
  files: File[]
  purchases: Purchase[]
}

// Purchase types
export interface Purchase {
  purchase_id: number
  customer_id: number
  assigned_user_id: number | null
  status: PurchaseStatus
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export type PurchaseStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface PurchaseFull extends Purchase {
  customer: Customer
  assigned_user: User | null
  updates: PurchaseUpdate[]
  files: File[]
}

// Purchase Update types
export interface PurchaseUpdate {
  update_id: number
  purchase_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  user?: User
}

// File types
export interface File {
  file_id: number
  filename: string
  file_type: string | null
  file_size: number | null
  file_path: string
  customer_id: number | null
  purchase_id: number | null
  uploaded_by: number | null
  created_at: string
  updated_at: string
}

export interface FileWithRelations extends File {
  customer: Customer | null
  purchase: Purchase | null
  uploaded_by_user: User | null
}

// Auth types
export interface LoginResponse {
  access_token: string
  token_type: string
  user: UserFull
}

export interface AccessCheckResponse {
  can_access: boolean
  page: Page | null
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
