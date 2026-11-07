import { useCallback, useEffect, useRef, useState } from 'react'
import {
  closeJob as apiCloseJob,
  createJob as apiCreateJob,
  deleteJob as apiDeleteJob,
  fetchJobs as apiFetchJobs,
} from '../api/jobs'
import type { CreateJobInput, Job, JobFilters } from '../types/job'

export interface UseJobsReturn {
  jobs: Job[]
  loading: boolean
  error: string | null
  filters: JobFilters
  setFilters: React.Dispatch<React.SetStateAction<JobFilters>>
  refetch: () => Promise<void>
  createJob: (data: CreateJobInput) => Promise<Job>
  closeJob: (id: string) => Promise<Job>
  deleteJob: (id: string) => Promise<void>
  clearError: () => void
}

export function useJobs(initialFilters: JobFilters = {}): UseJobsReturn {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>(initialFilters)

  const jobsRef = useRef<Job[]>([])
  jobsRef.current = jobs

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loadJobs = useCallback(async (activeFilters: JobFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetchJobs(activeFilters)
      setJobs(data)
    } catch (err: any) {
      setError(err.message || 'Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs(filters)
  }, [filters, loadJobs])

  const refetch = useCallback(async () => {
    await loadJobs(filters)
  }, [filters, loadJobs])

  const createJob = useCallback(async (data: CreateJobInput): Promise<Job> => {
    setError(null)
    try {
      const newJob = await apiCreateJob(data)
      setJobs((prevJobs) => [newJob, ...prevJobs])
      return newJob
    } catch (err: any) {
      setError(err.message || 'Failed to create job position.')
      throw err
    }
  }, [])

  const closeJob = useCallback(async (id: string): Promise<Job> => {
    setError(null)
    const currentJobs = jobsRef.current
    const targetJob = currentJobs.find((j) => j.id === id)

    // Optimistically update
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === id ? { ...job, is_open: false } : job)),
    )

    try {
      const updatedJob = await apiCloseJob(id)
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === id ? updatedJob : job)),
      )
      return updatedJob
    } catch (err: any) {
      // Rollback on failure
      if (targetJob) {
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === id ? targetJob : job)),
        )
      }
      setError(err.message || 'Failed to close job position.')
      throw err
    }
  }, [])

  const deleteJob = useCallback(async (id: string): Promise<void> => {
    setError(null)
    const currentJobs = jobsRef.current
    const deletedIndex = currentJobs.findIndex((j) => j.id === id)
    const deletedJob = deletedIndex !== -1 ? currentJobs[deletedIndex] : undefined

    // Optimistically remove from state
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id))

    try {
      await apiDeleteJob(id)
    } catch (err: any) {
      // Rollback state if delete failed
      if (deletedJob) {
        setJobs((prevJobs) => {
          const restored = [...prevJobs]
          restored.splice(deletedIndex, 0, deletedJob)
          return restored
        })
      }
      setError(err.message || 'Failed to delete job position.')
      throw err
    }
  }, [])

  return {
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
  }
}
