'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { IconPicker } from '@/components/icon-picker'
import { ColorPicker } from '@/components/color-picker'
import { api } from '@/lib/api'
import type { Category } from '@/lib/types'
import { toast } from 'sonner'

export default function NewCategoryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: null as string | null,
    color: null as string | null,
    sort_order: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const category = await api.post<Category>('/categories', {
        name: formData.name,
        description: formData.description || null,
        icon: formData.icon,
        color: formData.color,
        sort_order: formData.sort_order,
      })
      toast.success('Category created successfully')
      router.push(`/categories/${category.cid}`)
    } catch (error) {
      toast.error('Failed to create category')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/categories">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Category</h1>
          <p className="text-muted-foreground">Create a new navigation category</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Enter the information for the new category</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Administration"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe this category..."
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
                <FieldLabel>Color</FieldLabel>
                <ColorPicker
                  value={formData.color}
                  onChange={(value) => updateField('color', value)}
                  disabled={isSubmitting}
                />
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
                    Creating...
                  </>
                ) : (
                  'Create Category'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
