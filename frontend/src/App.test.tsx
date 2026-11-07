import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as jobsApi from './api/jobs'
import App from './App'

vi.mock('./api/jobs')

describe('App full flow integration', () => {
  const initialJobs = [
    {
      id: 'job-1',
      title: 'Fullstack Engineer',
      department: 'Engineering',
      location: 'Remote',
      description: 'React and Python',
      salary_range: '$100k - $120k',
      is_open: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header, filter bar, form, and fetched jobs', async () => {
    vi.mocked(jobsApi.fetchJobs).mockResolvedValueOnce(initialJobs)

    render(<App />)

    expect(screen.getByText('Job Board')).toBeInTheDocument()
    expect(screen.getByText('Loading job positions...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Fullstack Engineer')).toBeInTheDocument()
    })

    expect(screen.getByText('1 Total Position')).toBeInTheDocument()
    expect(screen.getByText('Post New Job')).toBeInTheDocument()
  })

  it('submits a new job and displays it in the list', async () => {
    vi.mocked(jobsApi.fetchJobs).mockResolvedValueOnce(initialJobs)
    const newJob = {
      id: 'job-2',
      title: 'Product Manager',
      department: 'Product',
      location: 'New York',
      description: 'Lead roadmaps',
      salary_range: '$130k',
      is_open: true,
    }
    vi.mocked(jobsApi.createJob).mockResolvedValueOnce(newJob)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Fullstack Engineer')).toBeInTheDocument()
    })

    // Open form
    fireEvent.click(screen.getByText('Post New Job'))

    fireEvent.change(screen.getByLabelText(/Job Title/i), {
      target: { value: 'Product Manager' },
    })
    fireEvent.change(screen.getByLabelText(/Department/i), {
      target: { value: 'Product' },
    })
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: 'New York' },
    })
    fireEvent.change(screen.getByLabelText(/Salary Range/i), {
      target: { value: '$130k' },
    })
    fireEvent.change(screen.getByLabelText(/Job Description/i), {
      target: { value: 'Lead roadmaps' },
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Publish Position'))
    })

    await waitFor(() => {
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
    })
  })

  it('displays error and does not crash when backend request fails', async () => {
    vi.mocked(jobsApi.fetchJobs).mockRejectedValueOnce(
      new Error('Unable to connect. Please try again.'),
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Jobs')).toBeInTheDocument()
      expect(
        screen.getByText('Unable to connect. Please try again.'),
      ).toBeInTheDocument()
    })

    // UI did not crash and allows retry
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })
})

