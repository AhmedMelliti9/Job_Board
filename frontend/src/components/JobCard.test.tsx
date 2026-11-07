import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { JobCard } from './JobCard'

describe('JobCard component', () => {
  const openJob = {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    description: 'Build React applications',
    salary_range: '$120,000 - $140,000',
    is_open: true,
  }

  const closedJob = {
    ...openJob,
    id: 'job-2',
    is_open: false,
  }

  it('renders job details, distinguishes Open status, and shows View Details link', () => {
    render(
      <MemoryRouter>
        <JobCard job={openJob} onClose={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Close Position')).toBeInTheDocument()
    expect(screen.getByText(/View Details/i)).toBeInTheDocument()
  })

  it('renders Closed status and hides Close Position button when already closed', () => {
    render(
      <MemoryRouter>
        <JobCard job={closedJob} onClose={vi.fn()} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.queryByText('Close Position')).not.toBeInTheDocument()
  })

  it('calls onClose when Close Position is clicked', async () => {
    const handleClose = vi.fn().mockResolvedValue({})
    render(
      <MemoryRouter>
        <JobCard job={openJob} onClose={handleClose} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Close Position'))
    })
    expect(handleClose).toHaveBeenCalledWith('job-1')
  })

  it('calls onDelete when Delete is clicked and confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const handleDelete = vi.fn().mockResolvedValue({})
    render(
      <MemoryRouter>
        <JobCard job={openJob} onClose={vi.fn()} onDelete={handleDelete} />
      </MemoryRouter>,
    )

    await act(async () => {
      fireEvent.click(screen.getByText('Delete'))
    })
    expect(handleDelete).toHaveBeenCalledWith('job-1')
  })
})
