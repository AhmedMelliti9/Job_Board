import React from 'react'
import type { Job } from '../types/job'
import { JobCard } from './JobCard'

interface JobListProps {
  jobs: Job[]
  loading: boolean
  error: string | null
  onCloseJob: (id: string) => Promise<any>
  onDeleteJob: (id: string) => Promise<any>
  onRetry: () => void
  hasFilters: boolean
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  error,
  onCloseJob,
  onDeleteJob,
  onRetry,
  hasFilters,
}) => {
  // Loading State
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm"
        data-testid="loading-indicator"
      >
        <svg
          className="animate-spin h-10 w-10 text-indigo-600 mb-4"
          xmlns="http://www.w3.org/2000/svg"
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
        <p className="text-gray-600 font-medium">Loading job positions...</p>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div
        className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center shadow-sm"
        data-testid="error-container"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-rose-900 mb-1">Unable to Load Jobs</h3>
        <p className="text-sm text-rose-700 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      </div>
    )
  }

  // Empty State (FR-09)
  if (jobs.length === 0) {
    return (
      <div
        className="p-12 bg-white border border-dashed border-gray-300 rounded-xl text-center shadow-sm"
        data-testid="empty-state"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {hasFilters ? 'No Matching Positions' : 'No Positions Available'}
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          {hasFilters
            ? 'No job openings match the selected department or location filters. Try adjusting your filters.'
            : 'There are currently no job positions posted. Use the "Post New Job" button above to list one.'}
        </p>
      </div>
    )
  }

  // Jobs List
  return (
    <div className="space-y-4" data-testid="job-list-container">
      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <span>
          Showing <strong className="text-gray-900">{jobs.length}</strong>{' '}
          {jobs.length === 1 ? 'position' : 'positions'}
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {jobs.filter((j) => j.is_open).length} Open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            {jobs.filter((j) => !j.is_open).length} Closed
          </span>
        </div>
      </div>

      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onClose={onCloseJob}
          onDelete={onDeleteJob}
        />
      ))}
    </div>
  )
}

