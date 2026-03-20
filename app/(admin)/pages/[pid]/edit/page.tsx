'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { IconPicker } from '@/components/icon-picker'
import { api, fetcher } from '@/lib/api'
import type { Page, Category } from '@/lib/types'
import { toast } from 'sonner'

export default function EditPagePage() {
  const router = useRouter()
  const params = useParams()
  const pid = params.pid as string

  const { data: page, isLoading } = useSWR<Page>(`/pages/${pid}`, fetcher)
  const { data: categories } = useSWR<Category[]>('/categories', fetcher)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    page_url: '',
    description: '',
    icon: null as string | null,
    category_id: null as number | null,
    sort_order: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        page_url: page.page_url,
        description: page.description || '',
        icon: page.icon,
        category_id: page.category_id,
        sort_order: page.sort_order,
      })
    }
  }, [page])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.page_url.trim()) {
      newErrors.page_url = 'URL is required'
    } else if (!formData.page_url.startsWith('/')) {
      newErrors.page_url = 'URL must start with /'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await api.put(`/pages/${pid}`, {
        title: formData.title,
        page_url: formData.page_url,
        description: formData.description || null,
        icon: formData.icon,
        category_id: formData.category_id,
        sort_order: formData.sort_order,
      })
      toast.success('Page updated successfully')
      router.push(`/pages/${pid}`)
    } catch (error) {
      toast.error('Failed to update page')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/pages">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Pages
          </Link>
        </Button>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/pages/${pid}`}>
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Page</h1>
          <p className="text-muted-foreground">Update {page.title}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <CardDescription>Update the page information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., User Management"
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="page_url">URL</FieldLabel>
                <Input
                  id="page_url"
                  value={formData.page_url}
                  onChange={(e) => updateField('page_url', e.target.value)}
                  placeholder="/users"
                  disabled={isSubmitting}
                />
                {errors.page_url && (
                  <p className="text-sm text-destructive">{errors.page_url}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe this page..."
                  disabled={isSubmitting}
                  rows={3}
                />
              </Field>

              <Field>
                <FieldLabel>Icon</FieldLabel>
                <IconPicker
                  value={formData.icon}
                  onChange={(value) => updateField('icon', value)}
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select
                  value={formData.category_id?.toString() || ''}
                  onValueChange={(value) => updateField('category_id', value ? parseInt(value) : null)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Uncategorized</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.cid} value={category.cid.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="sort_order">Sort Order</FieldLabel>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/pages/${pid}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
