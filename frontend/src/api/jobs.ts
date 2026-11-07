import type { CreateJobInput, Job, JobFilters } from '../types/job'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as unknown as T
  }

  let errorData: any = null
  try {
    errorData = await response.json()
  } catch {
    // Response had no JSON body
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred.'

    if (response.status === 404) {
      message = errorData?.detail || 'Job not found'
    } else if (response.status === 422) {
      if (Array.isArray(errorData?.detail)) {
        message = errorData.detail.map((err: any) => err.msg || 'Invalid field').join(', ')
      } else {
        message = errorData?.detail || 'Validation error'
      }
    } else if (response.status === 500) {
      message = 'Something went wrong on our end.'
    } else if (errorData?.detail) {
      message = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
    }

    throw new ApiError(message, response.status, errorData)
  }

  return errorData as T
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  try {
    const response = await fetch(url, options)
    return await handleResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Network failure (server down, DNS failure, offline)
    throw new ApiError('Unable to connect. Please try again.', 0)
  }
}

export async function fetchJobs(filters?: JobFilters): Promise<Job[]> {
  const params = new URLSearchParams()
  if (filters?.department?.trim()) {
    params.append('department', filters.department.trim())
  }
  if (filters?.location?.trim()) {
    params.append('location', filters.location.trim())
  }

  const query = params.toString() ? `?${params.toString()}` : ''
  return request<Job[]>(`/jobs${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function fetchJobById(id: string): Promise<Job> {
  return request<Job>(`/jobs/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function createJob(data: CreateJobInput): Promise<Job> {
  return request<Job>('/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function closeJob(id: string): Promise<Job> {
  return request<Job>(`/jobs/${encodeURIComponent(id)}/close`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
    },
  })
}

export async function deleteJob(id: string): Promise<void> {
  return request<void>(`/jobs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
