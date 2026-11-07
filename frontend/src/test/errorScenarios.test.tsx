import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { ErrorBoundary } from '../components/ErrorBoundary'

describe('Task 8 — Comprehensive Error Handling Scenarios', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('Scenario 1: Network unavailable (backend down) shows "Unable to connect. Please try again."', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'))

    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByText('Unable to connect. Please try again.'),
      ).toBeInTheDocument()
    })
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('Scenario 2: Backend returns 404 displays "Job not found"', async () => {
    const jobs = [
      {
        id: 'job-999',
        title: 'Ghost Position',
        department: 'Engineering',
        location: 'Remote',
        description: 'Does not exist',
        salary_range: '$100k',
        is_open: true,
      },
    ]

    globalThis.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
      if (url.includes('/close') && options?.method === 'PATCH') {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ detail: 'Job not found' }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(jobs),
      } as Response)
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Ghost Position')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Close Position'))
    })

    await waitFor(() => {
      const notFoundElements = screen.getAllByText('Job not found')
      expect(notFoundElements.length).toBeGreaterThan(0)
    })
  })

  it('Scenario 3: Backend returns 422 shows field-level error messages in form', async () => {
    globalThis.fetch = vi.fn().mockImplementation((_url: string, options?: any) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 422,
          json: () =>
            Promise.resolve({
              detail: [
                {
                  loc: ['body', 'title'],
                  msg: 'String should have at least 1 character',
                  type: 'string_too_short',
                },
                {
                  loc: ['body', 'salary_range'],
                  msg: 'Salary range format is invalid',
                  type: 'value_error',
                },
              ],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      } as Response)
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('No Positions Available')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Post New Job'))

    fireEvent.change(screen.getByLabelText(/Job Title/i), {
      target: { value: 'Valid Title' },
    })
    fireEvent.change(screen.getByLabelText(/Department/i), {
      target: { value: 'Eng' },
    })
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: 'Remote' },
    })
    fireEvent.change(screen.getByLabelText(/Salary Range/i), {
      target: { value: '$100k' },
    })
    fireEvent.change(screen.getByLabelText(/Job Description/i), {
      target: { value: 'Valid description text' },
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Publish Position'))
    })

    await waitFor(() => {
      expect(
        screen.getByText('String should have at least 1 character'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Salary range format is invalid'),
      ).toBeInTheDocument()
    })
  })

  it('Scenario 4: Backend returns 500 shows "Something went wrong on our end."', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: 'Internal crash' }),
    } as Response)

    render(<App />)

    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong on our end.'),
      ).toBeInTheDocument()
    })
  })

  it('Scenario 5: Request in progress shows loading indicator and disables submit button', async () => {
    let resolveCreate: (value: any) => void
    const pendingPromise = new Promise((resolve) => {
      resolveCreate = resolve
    })

    globalThis.fetch = vi.fn().mockImplementation((_url: string, options?: any) => {
      if (options?.method === 'POST') {
        return pendingPromise
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      } as Response)
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('No Positions Available')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Post New Job'))

    fireEvent.change(screen.getByLabelText(/Job Title/i), {
      target: { value: 'Async Job' },
    })
    fireEvent.change(screen.getByLabelText(/Department/i), {
      target: { value: 'Eng' },
    })
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: 'Remote' },
    })
    fireEvent.change(screen.getByLabelText(/Salary Range/i), {
      target: { value: '$100k' },
    })
    fireEvent.change(screen.getByLabelText(/Job Description/i), {
      target: { value: 'Desc' },
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Publish Position'))
    })

    const submitBtn = screen.getByRole('button', { name: /Posting Job/i })
    expect(submitBtn).toBeDisabled()

    await act(async () => {
      resolveCreate!({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            id: 'new-id',
            title: 'Async Job',
            department: 'Eng',
            location: 'Remote',
            salary_range: '$100k',
            description: 'Desc',
            is_open: true,
          }),
      })
    })
  })

  it('Scenario 6: ErrorBoundary captures component render failure and displays recovery UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const ProblemComponent = () => {
      throw new Error('Crashing component render')
    }

    render(
      <ErrorBoundary>
        <ProblemComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Reload Page')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})
