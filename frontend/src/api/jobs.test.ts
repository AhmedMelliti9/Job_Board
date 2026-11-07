import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, closeJob, createJob, deleteJob, fetchJobs } from './jobs'

describe('Job Board API Client (api/jobs.ts)', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('fetchJobs returns parsed Job array on 200', async () => {
    const mockJobs = [
      {
        id: '1',
        title: 'Frontend Engineer',
        department: 'Engineering',
        location: 'Remote',
        description: 'React TS',
        salary_range: '$100k',
        is_open: true,
      },
    ]

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockJobs),
    } as unknown as Response)

    const jobs = await fetchJobs()
    expect(globalThis.fetch).toHaveBeenCalledWith('http://localhost:8000/jobs', expect.any(Object))
    expect(jobs).toEqual(mockJobs)
  })

  it('fetchJobs appends filter query parameters correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([]),
    } as unknown as Response)

    await fetchJobs({ department: 'Engineering', location: 'Remote' })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/jobs?department=Engineering&location=Remote',
      expect.any(Object),
    )
  })

  it('createJob throws on 422', async () => {
    const errorBody = {
      detail: [
        {
          loc: ['body', 'title'],
          msg: 'Field required',
          type: 'missing',
        },
      ],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue(errorBody),
    } as unknown as Response)

    await expect(
      createJob({
        title: '',
        department: 'Eng',
        location: 'Remote',
        description: 'Desc',
        salary_range: '100k',
      }),
    ).rejects.toThrow(ApiError)

    try {
      await createJob({
        title: '',
        department: 'Eng',
        location: 'Remote',
        description: 'Desc',
        salary_range: '100k',
      })
    } catch (err: any) {
      expect(err.status).toBe(422)
      expect(err.message).toContain('Field required')
    }
  })

  it('deleteJob returns void on 204', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn().mockRejectedValue(new Error('No body')),
    } as unknown as Response)

    const result = await deleteJob('job-123')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/jobs/job-123',
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(result).toBeUndefined()
  })

  it('closeJob sends PATCH and returns updated Job on 200', async () => {
    const mockClosedJob = {
      id: 'job-123',
      title: 'Dev',
      department: 'Eng',
      location: 'Remote',
      description: 'Desc',
      salary_range: '100k',
      is_open: false,
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockClosedJob),
    } as unknown as Response)

    const job = await closeJob('job-123')
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/jobs/job-123/close',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(job.is_open).toBe(false)
  })

  it('throws useful message on 404', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ detail: 'Job not found' }),
    } as unknown as Response)

    await expect(closeJob('missing-id')).rejects.toThrow('Job not found')
  })

  it('throws user-friendly error on network failure (server down)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(fetchJobs()).rejects.toThrow('Unable to connect. Please try again.')
  })

  it('throws user-friendly error on 500 server error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ detail: 'Internal crash' }),
    } as unknown as Response)

    await expect(fetchJobs()).rejects.toThrow('Something went wrong on our end.')
  })
})
