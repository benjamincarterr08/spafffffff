'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUser, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/dashboard'
  
  const { login, isLoading } = useAuthStore()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(username, password)
      router.push(redirectUrl)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid username or password')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/5/52/OMSI_2.png"
              alt="OmsiDev Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">OmsiDev Admin</CardTitle>
            <CardDescription>Sign in to your staff account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username or Email</FieldLabel>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" 
                  />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isFormLoading}
                  />
                </div>
              </Field>
              
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faLock} 
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" 
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isFormLoading}
                  />
                </div>
              </Field>
            </FieldGroup>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isFormLoading}
            >
              {isFormLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
