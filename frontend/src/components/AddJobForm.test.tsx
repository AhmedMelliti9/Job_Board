import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddJobForm } from './AddJobForm'

describe('AddJobForm component', () => {
  it('toggles form visibility when clicking button', () => {
    render(<AddJobForm onSubmit={vi.fn()} />)

    expect(screen.queryByLabelText(/Job Title/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Post New Job'))
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument()
  })

  it('validates required fields client-side without submitting', async () => {
    const handleSubmit = vi.fn()
    render(<AddJobForm onSubmit={handleSubmit} />)

    // Open form
    fireEvent.click(screen.getByText('Post New Job'))

    // Click submit with empty fields
    fireEvent.click(screen.getByText('Publish Position'))

    // Validation errors should be displayed
    expect(screen.getByText('Job title is required.')).toBeInTheDocument()
    expect(screen.getByText('Department is required.')).toBeInTheDocument()
    expect(screen.getByText('Location is required.')).toBeInTheDocument()
    expect(screen.getByText('Description is required.')).toBeInTheDocument()
    expect(screen.getByText('Salary range is required.')).toBeInTheDocument()

    // onSubmit must NOT be called
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit when form is valid', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({})
    render(<AddJobForm onSubmit={handleSubmit} />)

    fireEvent.click(screen.getByText('Post New Job'))

    fireEvent.change(screen.getByLabelText(/Job Title/i), {
      target: { value: 'Frontend Dev' },
    })
    fireEvent.change(screen.getByLabelText(/Department/i), {
      target: { value: 'Engineering' },
    })
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: 'Remote' },
    })
    fireEvent.change(screen.getByLabelText(/Salary Range/i), {
      target: { value: '$100k' },
    })
    fireEvent.change(screen.getByLabelText(/Job Description/i), {
      target: { value: 'Building UI' },
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Publish Position'))
    })

    expect(handleSubmit).toHaveBeenCalledWith({
      title: 'Frontend Dev',
      department: 'Engineering',
      location: 'Remote',
      salary_range: '$100k',
      description: 'Building UI',
    })
  })
})
