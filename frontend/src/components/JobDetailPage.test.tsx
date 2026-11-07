import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as jobsApi from '../api/jobs'
import { JobDetailPage } from './JobDetailPage'

vi.mock('../api/jobs')

describe('JobDetailPage component', () => {
  const mockJob = {
    id: 'job-101',
    title: 'Lead Architect',
    department: 'Architecture',
    location: 'Remote',
    description: 'Design distributed architectures',
    salary_range: '$180,000',
    is_open: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(jobsApi.fetchJobById).mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter initialEntries={['/jobs/job-101']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('job-detail-loading')).toBeInTheDocument()
    expect(screen.getByText('Loading position details...')).toBeInTheDocument()
  })

  it('renders job details and accepting applications badge', async () => {
    vi.mocked(jobsApi.fetchJobById).mockResolvedValueOnce(mockJob)

    render(
      <MemoryRouter initialEntries={['/jobs/job-101']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Lead Architect')).toBeInTheDocument()
    })

    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('$180,000')).toBeInTheDocument()
    expect(screen.getByText('Accepting Applications')).toBeInTheDocument()
    expect(screen.getByText('Close Position')).toBeInTheDocument()
  })

  it('handles closing job position optimistically', async () => {
    vi.mocked(jobsApi.fetchJobById).mockResolvedValueOnce(mockJob)
    vi.mocked(jobsApi.closeJob).mockResolvedValueOnce({
      ...mockJob,
      is_open: false,
    })

    render(
      <MemoryRouter initialEntries={['/jobs/job-101']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Close Position')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Close Position'))
    })

    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('renders error state and retry button when fetching fails', async () => {
    vi.mocked(jobsApi.fetchJobById).mockRejectedValueOnce(
      new Error('Job not found'),
    )

    render(
      <MemoryRouter initialEntries={['/jobs/job-999']}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Position')).toBeInTheDocument()
      expect(screen.getByText('Job not found')).toBeInTheDocument()
    })

    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('← Back to Job Board')).toBeInTheDocument()
  })
})

