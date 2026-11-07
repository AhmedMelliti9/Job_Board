import React, { useState } from 'react'
import type { CreateJobInput } from '../types/job'

interface AddJobFormProps {
  onSubmit: (jobData: CreateJobInput) => Promise<any>
}

interface FormErrors {
  title?: string
  department?: string
  location?: string
  description?: string
  salary_range?: string
  general?: string
}

export const AddJobForm: React.FC<AddJobFormProps> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<CreateJobInput>({
    title: '',
    department: '',
    location: '',
    description: '',
    salary_range: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required.'
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or less.'
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required.'
    } else if (formData.department.trim().length > 50) {
      newErrors.department = 'Department must be 50 characters or less.'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required.'
    } else if (formData.location.trim().length > 50) {
      newErrors.location = 'Location must be 50 characters or less.'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.'
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less.'
    }

    if (!formData.salary_range.trim()) {
      newErrors.salary_range = 'Salary range is required.'
    } else if (formData.salary_range.trim().length > 50) {
      newErrors.salary_range = 'Salary range must be 50 characters or less.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field-specific error as user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)

    // Client-side validation
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await onSubmit({
        title: formData.title.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        salary_range: formData.salary_range.trim(),
      })

      // Reset form on success
      setFormData({
        title: '',
        department: '',
        location: '',
        description: '',
        salary_range: '',
      })
      setSuccessMessage('Job position posted successfully!')
      setTimeout(() => {
        setSuccessMessage(null)
        setIsOpen(false)
      }, 1500)
    } catch (err: any) {
      // Check for backend 422 field errors
      if (err.data && Array.isArray(err.data.detail)) {
        const backendErrors: FormErrors = {}
        for (const detail of err.data.detail) {
          const field = detail.loc?.[detail.loc.length - 1] as keyof FormErrors
          if (field) {
            backendErrors[field] = detail.msg
          }
        }
        setErrors(backendErrors)
      } else {
        setErrors({ general: err.message || 'Failed to post job position.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recruiter Actions</h2>
          <p className="text-sm text-gray-500">
            Post a new open position to the firm's job board.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {isOpen ? 'Close Form' : 'Post New Job'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-6 border-t border-gray-100 pt-6 space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm font-medium">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 ${
                  errors.title ? 'border-rose-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-xs font-semibold text-gray-700 mb-1">
                Department *
              </label>
              <input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. Engineering, Product, Marketing"
                value={formData.department}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 ${
                  errors.department ? 'border-rose-500' : 'border-gray-300'
                }`}
              />
              {errors.department && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.department}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-xs font-semibold text-gray-700 mb-1">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Remote, San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 ${
                  errors.location ? 'border-rose-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.location}</p>
              )}
            </div>

            <div>
              <label htmlFor="salary_range" className="block text-xs font-semibold text-gray-700 mb-1">
                Salary Range *
              </label>
              <input
                id="salary_range"
                name="salary_range"
                type="text"
                placeholder="e.g. $120,000 - $140,000"
                value={formData.salary_range}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 ${
                  errors.salary_range ? 'border-rose-500' : 'border-gray-300'
                }`}
              />
              {errors.salary_range && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.salary_range}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide a detailed description of the role, responsibilities, and qualifications..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 ${
                errors.description ? 'border-rose-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Posting Job...
                </>
              ) : (
                'Publish Position'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
