import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AddJobForm } from './components/AddJobForm'
import { FilterBar } from './components/FilterBar'
import { JobDetailPage } from './components/JobDetailPage'
import { JobList } from './components/JobList'
import { useJobs } from './hooks/useJobs'

export function JobBoardView() {
  const {
    jobs,
    loading,
    error,
    filters,
    setFilters,
    refetch,
    createJob,
    closeJob,
    deleteJob,
    clearError,
  } = useJobs()

  const hasActiveFilters = Boolean(
    filters.department?.trim() || filters.location?.trim(),
  )

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Position Count Badge */}
      <div className="mb-4 flex items-center justify-end">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
          {jobs.length} Total {jobs.length === 1 ? 'Position' : 'Positions'}
        </span>
      </div>

      {/* Error Notification Banner if an action failed while jobs are already loaded */}
      {error && jobs.length > 0 && (
        <div
          className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-rose-800 text-sm shadow-xs"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-rose-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-rose-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Recruiter Section: Post New Job */}
      <AddJobForm onSubmit={createJob} />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        disabled={loading && jobs.length === 0}
      />

      {/* Jobs List */}
      <JobList
        jobs={jobs}
        loading={loading}
        error={error}
        onCloseJob={closeJob}
        onDeleteJob={deleteJob}
        onRetry={refetch}
        hasFilters={hasActiveFilters}
      />
    </main>
  )
}

export function NotFoundView() {
  return (
    <main className="max-w-md mx-auto py-16 px-4 text-center">
      <h2 className="text-4xl font-extrabold text-slate-900 mb-2">404</h2>
      <p className="text-slate-600 mb-6">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
      >
        &larr; Back to Job Board
      </Link>
    </main>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
                JB
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  Job Board
                </h1>
                <p className="text-xs text-slate-500">
                  Recruitment Firm Openings & Positions
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Route View */}
        <Routes>
          <Route path="/" element={<JobBoardView />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
          <p>Job Board &bull; React + FastAPI Architecture &bull; React Router</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
