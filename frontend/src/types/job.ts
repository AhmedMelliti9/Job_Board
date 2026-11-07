export interface Job {
  id: string
  title: string
  department: string
  location: string
  description: string
  salary_range: string
  is_open: boolean
}

export interface CreateJobInput {
  title: string
  department: string
  location: string
  description: string
  salary_range: string
}

export interface JobFilters {
  department?: string
  location?: string
}

export interface ValidationErrorItem {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface ApiErrorResponse {
  detail?: string | ValidationErrorItem[]
}
