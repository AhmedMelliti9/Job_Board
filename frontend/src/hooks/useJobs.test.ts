import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as jobsApi from '../api/jobs'
import { useJobs } from './useJobs'

vi.mock('../api/jobs')

describe('useJobs custom hook', () => {
  const mockJobs = [
    {
      id: 'job-1',
      title: 'Senior Engineer',
      department: 'Engineering',
      location: 'Remote',
      description: 'Building software',
      salary_range: '$120,000',
      is_open: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches jobs on mount and sets loading state', async () => {
    vi.mocked(jobsApi.fetchJobs).mockResolvedValueOnce(mockJobs)

    const { result } = renderHook(() => useJobs())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.jobs).toEqual(mockJobs)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error gracefully', async () => {
    vi.mocked(jobsApi.fetchJobs).mockRejectedValueOnce(
      new Error('Unable to connect. Please try again.'),
    )

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Unable to connect. Please try again.')
    expect(result.current.jobs).toEqual([])
  })

  it('createJob adds the newly created job to state', async () => {
    vi.mocked(jobsApi.fetchJobs).mockResolvedValueOnce(mockJobs)
    const newJob = {
      id: 'job-2',
      title: 'DevOps Engineer',
      department: 'Operations',
      location: 'Remote',
      description: 'CI/CD pipeline',
      salary_range: '$110,000',
      is_open: true,
    }
    vi.mocked(jobsApi.createJob).mockResolvedValueOnce(newJob)

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.createJob({
        title: 'DevOps Engineer',
        department: 'Operations',
        location: 'Remote',
        description: 'CI/CD pipeline',
        salary_range: '$110,000',
      })
    })

    expect(result.current.jobs).toHaveLength(2)
    expect(result.current.jobs[0]).toEqual(newJob)
  })

  it('closeJob marks position as closed', async () => {
    vi.mocked(jobsApi.fetchJobs).mockResolvedValueOnce(mockJobs)
    const closedJob = { ...mockJobs[0], is_open: false }
    vi.mocked(jobsApi.closeJob).mockResolvedValueOnce(closedJob)

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.closeJob('job-1')
    })

    expect(result.current.jobs[0].is_open).toBe(false)
  })

  it('deleteJob removes position optimistically and rolls back if API fails', async () => {
    vi.mocked(jobsApi.fetchJobs).mockResolvedValueOnce(mockJobs)
    vi.mocked(jobsApi.deleteJob).mockRejectedValueOnce(
      new Error('Failed to delete job position.'),
    )

    const { result } = renderHook(() => useJobs())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let caughtError: any
    await act(async () => {
      try {
        await result.current.deleteJob('job-1')
      } catch (err) {
        caughtError = err
      }
    })

    expect(caughtError).toBeDefined()
    // Position should be restored after failure
    expect(result.current.jobs).toHaveLength(1)
    expect(result.current.jobs[0].id).toBe('job-1')
    expect(result.current.error).toBe('Failed to delete job position.')
  })
})

