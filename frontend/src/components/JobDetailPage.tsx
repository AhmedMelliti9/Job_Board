import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { closeJob, deleteJob, fetchJobById } from '../api/jobs'
import type { Job } from '../types/job'

interface JobDetailPageProps {
  onJobDeleted?: (id: string) => void
  onJobClosed?: (id: string) => void
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({
  onJobDeleted,
  onJobClosed,
}) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadJob = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJobById(id)
      setJob(data)
    } catch (err: any) {
      setError(err.message || 'Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJob()
  }, [id])

  const handleClose = async () => {
    if (!job || !job.is_open || isClosing || isDeleting) return
    setIsClosing(true)
    setActionError(null)

    // Optimistic update
    const previousJob = job
    setJob({ ...job, is_open: false })

    try {
      const updated = await closeJob(job.id)
      setJob(updated)
      if (onJobClosed) {
        onJobClosed(job.id)
      }
    } catch (err: any) {
      // Rollback on error
      setJob(previousJob)
      setActionError(err.message || 'Failed to close job.')
    } finally {
      setIsClosing(false)
    }
  }

  const handleDelete = async () => {
    if (!job || isClosing || isDeleting) return
    if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return
    }

    setIsDeleting(true)
    setActionError(null)

    try {
      await deleteJob(job.id)
      if (onJobDeleted) {
        onJobDeleted(job.id)
      }
      navigate('/')
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete job.')
      setIsDeleting(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div
        className="max-w-3xl mx-auto py-12 px-4"
        data-testid="job-detail-loading"
      >
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-xs">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 mb-4"
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
          <p className="text-slate-600 font-medium">Loading position details...</p>
        </div>
      </div>
    )
  }

  // Error State with Retry Button
  if (error || !job) {
    return (
      <div
        className="max-w-3xl mx-auto py-12 px-4"
        data-testid="job-detail-error"
      >
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-rose-900 mb-1">
            Unable to Load Position
          </h3>
          <p className="text-sm text-rose-700 mb-6">{error || 'Job not found'}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
            >
              &larr; Back to Job Board
            </Link>
            <button
              onClick={loadJob}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors"
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
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Navigation breadcrumb */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all positions
        </Link>
      </div>

      {actionError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-semibold text-rose-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              {job.is_open ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Accepting Applications
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                  Closed
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.department}
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-purple-50 text-purple-700 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.salary_range}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            {job.is_open && (
              <button
                onClick={handleClose}
                disabled={isClosing || isDeleting}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors disabled:opacity-50"
              >
                {isClosing ? 'Closing...' : 'Close Position'}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isClosing || isDeleting}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg text-rose-800 bg-rose-100 hover:bg-rose-200 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Position'}
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div className="pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Role Description & Responsibilities
          </h2>
          <div className="text-slate-800 leading-relaxed whitespace-pre-line text-base bg-slate-50 p-6 rounded-xl border border-slate-100">
            {job.description}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Position ID: <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{job.id}</code></span>
          <span>Status: {job.is_open ? 'Open' : 'Closed'}</span>
        </div>
      </div>
    </div>
  )
}

