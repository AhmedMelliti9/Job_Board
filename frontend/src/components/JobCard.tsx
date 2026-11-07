import React, { useState } from 'react'
import type { Job } from '../types/job'

interface JobCardProps {
  job: Job
  onClose: (id: string) => Promise<any>
  onDelete: (id: string) => Promise<any>
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClose, onDelete }) => {
  const [isClosing, setIsClosing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const handleClose = async () => {
    if (!job.is_open || isClosing || isDeleting) return
    setIsClosing(true)
    setCardError(null)
    try {
      await onClose(job.id)
    } catch (err: any) {
      setCardError(err.message || 'Failed to close job.')
    } finally {
      setIsClosing(false)
    }
  }

  const handleDelete = async () => {
    if (isClosing || isDeleting) return
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return
    }
    setIsDeleting(true)
    setCardError(null)
    try {
      await onDelete(job.id)
    } catch (err: any) {
      setCardError(err.message || 'Failed to delete job.')
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={`rounded-xl border transition-all duration-200 p-6 shadow-sm hover:shadow-md ${
        job.is_open
          ? 'bg-white border-gray-200'
          : 'bg-gray-50 border-gray-300 opacity-90'
      }`}
      data-testid={`job-card-${job.id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            {job.is_open ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Open
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                Closed
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {job.department}
            </span>
            <span className="inline-flex items-center gap-1 font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {job.salary_range}
            </span>
          </div>

          <p className="mt-4 text-gray-700 whitespace-pre-line leading-relaxed text-sm">
            {job.description}
          </p>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          {job.is_open && (
            <button
              onClick={handleClose}
              disabled={isClosing || isDeleting}
              className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClosing ? (
                <>
                  <svg
                    className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Closing...
                </>
              ) : (
                'Close Position'
              )}
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isClosing || isDeleting}
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-rose-700"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>

      {cardError && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-2 text-xs text-rose-800">
          <span>{cardError}</span>
          <button
            type="button"
            onClick={() => setCardError(null)}
            className="text-rose-600 hover:text-rose-800 font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
