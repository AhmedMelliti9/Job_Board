import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { JobList } from './JobList'

describe('JobList component', () => {
  it('renders loading state when loading is true', () => {
    render(
      <JobList
        jobs={[]}
        loading={true}
        error={null}
        onCloseJob={vi.fn()}
        onDeleteJob={vi.fn()}
        onRetry={vi.fn()}
        hasFilters={false}
      />,
    )

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    expect(screen.getByText('Loading job positions...')).toBeInTheDocument()
  })

  it('renders error state and retry button when error is present', () => {
    const handleRetry = vi.fn()
    render(
      <JobList
        jobs={[]}
        loading={false}
        error="Unable to connect. Please try again."
        onCloseJob={vi.fn()}
        onDeleteJob={vi.fn()}
        onRetry={handleRetry}
        hasFilters={false}
      />,
    )

    expect(screen.getByTestId('error-container')).toBeInTheDocument()
    expect(screen.getByText('Unable to connect. Please try again.')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Try Again'))
    expect(handleRetry).toHaveBeenCalled()
  })

  it('renders appropriate empty state when no jobs exist', () => {
    render(
      <JobList
        jobs={[]}
        loading={false}
        error={null}
        onCloseJob={vi.fn()}
        onDeleteJob={vi.fn()}
        onRetry={vi.fn()}
        hasFilters={false}
      />,
    )

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('No Positions Available')).toBeInTheDocument()
  })

  it('renders matching empty state when no jobs match filter', () => {
    render(
      <JobList
        jobs={[]}
        loading={false}
        error={null}
        onCloseJob={vi.fn()}
        onDeleteJob={vi.fn()}
        onRetry={vi.fn()}
        hasFilters={true}
      />,
    )

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('No Matching Positions')).toBeInTheDocument()
  })
})

