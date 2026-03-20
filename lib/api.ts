const API_BASE = 'https://api.omsidev.co.uk'

class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(errorText || response.statusText, response.status)
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }
  
  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => fetchWithAuth<T>(path, { method: 'GET' }),
  
  post: <T>(path: string, data?: unknown) =>
    fetchWithAuth<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(path: string, data: unknown) =>
    fetchWithAuth<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: <T>(path: string, data: unknown) =>
    fetchWithAuth<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (path: string) =>
    fetchWithAuth<void>(path, { method: 'DELETE' }),
  
  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const token = await getAuthToken()
    
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new ApiError(errorText || response.statusText, response.status)
    }
    
    return response.json() as Promise<T>
  },
}

// SWR fetcher
export const fetcher = <T>(path: string): Promise<T> => api.get<T>(path)

export { ApiError }
