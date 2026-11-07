# Job Board — Project Plan & Requirements

---

## 1. Project Overview

A small recruitment firm needs a web application to replace their manual spreadsheet for managing job openings. The application allows recruiters to post, browse, filter, close, and delete job positions. It consists of a **React frontend** and a **FastAPI backend** communicating over HTTP, with in-memory data storage.

---


---

## 3. Functional Requirements

| ID    | Requirement                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------ |
| FR-01 | Users can view a list of open job positions.                                                     |
| FR-02 | Users can filter positions by department and/or location.                                        |
| FR-03 | Recruiters can create a new job position (title, department, location, description, salary range).|
| FR-04 | Recruiters can close a position (mark it as no longer accepting applications).                   |
| FR-05 | Recruiters can delete a position.                                                                |
| FR-06 | The UI shows a loading indicator while API requests are in progress.                             |
| FR-07 | The UI displays a specific error message when a request fails.                                   |
| FR-08 | The UI clearly distinguishes between open and closed positions.                                  |
| FR-09 | The position list shows an appropriate empty state when no positions exist or match the filter.   |

---

## 4. Non-Functional Requirements

| ID     | Requirement                                                                                |
| ------ | ------------------------------------------------------------------------------------------ |
| NFR-01 | Every API call in the frontend handles three states: loading, success, error.              |
| NFR-02 | API errors are displayed to the user in a useful way — not "Something went wrong".         |
| NFR-03 | The frontend never crashes due to an unhandled API error.                                  |
| NFR-04 | All user input is validated on both the frontend and backend.                              |
| NFR-05 | The backend and frontend are separate projects in the same repository.                     |

---

## 5. Technical Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- Uvicorn
- In-memory storage

### Constraints — Must NOT use:
- A database
- Authentication
- React Query, SWR, or any data-fetching library — use the native `fetch` API
- axios — use `fetch`
- Redux or external state management

> **Why these constraints?**
> Using `fetch` directly forces you to understand how HTTP requests work from the JavaScript side. React Query and SWR are excellent tools — but they abstract away concepts you need to understand first.

---

## 6. Project Structure

```
Job_Board/
├── README.md
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types/
│       │   └── job.ts
│       ├── api/
│       │   └── jobs.ts
│       ├── components/
│       │   ├── JobList.tsx
│       │   ├── JobCard.tsx
│       │   ├── AddJobForm.tsx
│       │   └── FilterBar.tsx
│       └── hooks/
│           └── useJobs.ts
└── backend/
    ├── requirements.txt
    ├── .gitignore
    └── app/
        ├── main.py
        ├── models/
        │   └── job.py
        ├── routes/
        │   └── jobs.py
        ├── services/
        │   └── job_service.py
        └── storage/
            └── in_memory.py
```

### Key architectural decisions:
- **`api/jobs.ts`** — All fetch calls to the backend live in one place. Components never call `fetch` directly. This centralizes URL construction, headers, and error handling.
- **`hooks/useJobs.ts`** — A custom hook encapsulates the state management for API calls (loading, data, error). Components stay clean and focused on rendering.

---

## 7. CORS Configuration

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:8000`
- These are different origins — the browser blocks cross-origin requests unless the backend explicitly allows it.
- FastAPI must be configured to accept requests from `http://localhost:5173`.
- Only allow the specific frontend origin, **not** `*` (wildcard) in production.

---

## 8. API Contract

### Endpoints

| Method | Endpoint             | Description               | Success Code | Error Codes |
| ------ | -------------------- | ------------------------- | ------------ | ----------- |
| POST   | `/jobs`              | Create a new job          | 201          | 422         |
| GET    | `/jobs`              | List jobs (with filters)  | 200          | —           |
| GET    | `/jobs/{id}`         | Get a single job          | 200          | 404         |
| PATCH  | `/jobs/{id}/close`   | Mark job as closed        | 200          | 404         |
| DELETE | `/jobs/{id}`         | Delete a job              | 204          | 404         |

### Query Parameters for `GET /jobs`
- `?department=` — filter by department
- `?location=` — filter by location

### Job Data Model

| Field       | Type   | Required | Notes                         |
| ----------- | ------ | -------- | ----------------------------- |
| id          | string | auto     | Generated by backend (UUID)   |
| title       | string | yes      | Job title                     |
| department  | string | yes      | Department name               |
| location    | string | yes      | Job location                  |
| description | string | yes      | Job description               |
| salary_range| string | yes      | Salary range                  |
| is_open     | bool   | auto     | Defaults to `true`            |

### Frontend API Client Functions (in `api/jobs.ts`)

- `fetchJobs(filters?: JobFilters): Promise<Job[]>`
- `createJob(data: CreateJobInput): Promise<Job>`
- `closeJob(id: string): Promise<Job>`
- `deleteJob(id: string): Promise<void>`

Each function must:
- Construct the correct URL
- Send the correct HTTP method
- Parse the response JSON
- Throw a meaningful error if the response is not 2xx

---

## 9. Full Request Lifecycle

```
User clicks "Add Job"
  → Frontend validates input
    → If invalid: show form errors, stop here
    → If valid:
      → Frontend calls api/jobs.ts function
        → fetch() sends POST /jobs to backend
          → Backend receives request
          → Backend validates with Pydantic
          → Backend creates job in storage
          → Backend returns 201 + job object
        → fetch() receives response
        → api/jobs.ts parses JSON and returns job
      → useJobs hook updates state
    → Component re-renders with new job in list
```

You must be able to trace this full path. If something breaks, you need to know which step failed.

---

## 10. Error Handling Requirements

### Frontend Error Handling

| Scenario                              | Expected Behavior                                          |
| ------------------------------------- | ---------------------------------------------------------- |
| Network request fails (backend down)  | Show error: "Unable to connect. Please try again."         |
| Backend returns 404                   | Show error: "Job not found"                                |
| Backend returns 422                   | Show field-level errors from the API response              |
| Backend returns 500                   | Show error: "Something went wrong on our end."             |
| Request is in progress                | Show loading indicator; disable submit button              |

### Backend Error Handling
- Consistent structured error responses
- No tracebacks exposed to the client
- Log full errors server-side; return generic messages for 500s
- Never return internal implementation details

### Key Principle
The frontend must handle **every possible outcome** of an API call. "Just assume it works" is not acceptable. A network call can fail at any point.

---

## 11. Security Requirements

### CORS
- Only allow the specific frontend origin, not `*` (wildcard) in production
- Understand why wildcard CORS is a security risk

### Input Validation (Both Sides)
- **Frontend validates before sending** — for user experience
- **Backend validates on receipt** — for security
- These are not redundant; they serve different purposes

### Error Responses
- The backend must never return internal implementation details
- Log full errors server-side; return generic messages for 500s

---

## 12. Testing Requirements

### Backend API Tests (pytest) — Minimum 5 tests

| Test Case                      | Expected Status |
| ------------------------------ | --------------- |
| Create job                     | 201             |
| Create job with invalid data   | 422             |
| Get job list                   | 200             |
| Get non-existent job           | 404             |
| Close a job                    | 200             |
| Delete a job                   | 204             |

### Frontend Unit Tests (Vitest)

Unit tests for the API client functions in `api/jobs.ts` using `vi.mock` to mock fetch:

- `fetchJobs` returns parsed Job array on 200
- `createJob` throws on 422
- `deleteJob` returns void on 204

### Manual Integration Tests (documented in `TESTING.md`)

- Testing the full create → view → close → delete lifecycle
- Testing what happens when the backend is stopped mid-session

---

## 13. Git Strategy

### Remote Repository
`https://github.com/AhmedMelliti9/Job_Board.git`

### Branching Strategy — Feature Branches

| Branch                    | Purpose                         |
| ------------------------- | ------------------------------- |
| `feature/api-contract`    | Types and API route definitions |
| `feature/backend-routes`  | Backend route implementation    |
| `feature/api-client`      | Frontend API client layer       |
| `feature/ui-components`   | UI components                   |
| `feature/error-handling`  | Comprehensive error handling    |

### Rule
Write the API contract (types and routes) **before** writing either the frontend or backend implementation. Commit the contract first. This is how teams work when frontend and backend are developed in parallel.

---

## 14. Implementation Plan — Task by Task

### Task 1 — Set Up Both Projects
**Branch:** `feature/api-contract`

**Backend setup:**
1. Create a Python virtual environment
2. Install dependencies (`fastapi`, `uvicorn`, `pytest`, `httpx`)
3. Initialize a minimal FastAPI app in `main.py`
4. Verify the server starts: `uvicorn app.main:app --reload`
5. Visit `http://localhost:8000/docs` — FastAPI auto-generates documentation
6. Add `.gitignore` (Python + venv)

**Frontend setup:**
1. Initialize a new Vite + React + TypeScript project
2. Install and configure Tailwind CSS
3. Install Vitest and React Testing Library
4. Configure Vitest in `vite.config.ts`

**CORS:**
- Configure FastAPI to allow requests from `http://localhost:5173`

**Verification:**
- The backend starts, the frontend starts, and the browser can reach both

**Commit:** `"chore: initialize fullstack project structure"`

---

### Task 2 — Define Shared Types and API Contract
**Branch:** `feature/api-contract`

1. Define what each endpoint accepts and returns:
   - `POST /jobs` — accepts job input, returns created job
   - `GET /jobs` — returns list of jobs (with optional filters)
   - `GET /jobs/{id}` — returns a single job
   - `PATCH /jobs/{id}/close` — returns the closed job
   - `DELETE /jobs/{id}` — returns nothing
2. Write Pydantic models in the backend (`app/models/job.py`)
3. Write TypeScript types in the frontend (`src/types/job.ts`)
4. Ensure they mirror each other

**Commit:** `"feat: define job types and API contract"`

---

### Task 3 — Build the Backend API
**Branch:** `feature/backend-routes`

1. Implement in-memory storage (`app/storage/in_memory.py`)
2. Implement job service (`app/services/job_service.py`)
3. Build all routes (`app/routes/jobs.py`):
   - `POST /jobs` → 201
   - `GET /jobs` → 200 (supports `?department=` and `?location=`)
   - `GET /jobs/{id}` → 200 or 404
   - `PATCH /jobs/{id}/close` → 200 or 404
   - `DELETE /jobs/{id}` → 204 or 404
4. Write at least 5 API tests using pytest

**Commit:** `"feat: implement jobs API"`

---

### Task 4 — Build the API Client Layer
**Branch:** `feature/api-client`

1. Create `src/api/jobs.ts` with typed functions:
   - `fetchJobs(filters?: JobFilters): Promise<Job[]>`
   - `createJob(data: CreateJobInput): Promise<Job>`
   - `closeJob(id: string): Promise<Job>`
   - `deleteJob(id: string): Promise<void>`
2. Each function must:
   - Construct the correct URL
   - Send the correct HTTP method
   - Parse the response JSON
   - Throw a meaningful error if the response is not 2xx
3. Components must never call `fetch` directly

**Commit:** `"feat: implement typed API client"`

---

### Task 5 — Build a Custom Hook
**Branch:** `feature/ui-components`

1. Create `src/hooks/useJobs.ts` — a custom hook that:
   - Fetches the job list on mount
   - Exposes: `jobs`, `loading`, `error`
   - Exposes: `createJob`, `closeJob`, `deleteJob` functions
   - Updates local state optimistically or re-fetches after mutation

**Commit:** `"feat: implement useJobs custom hook"`

---

### Task 6 — Build the UI Components
**Branch:** `feature/ui-components`

1. **`JobList.tsx`** — Renders the list; handles loading, error, and empty states
2. **`JobCard.tsx`** — Renders a single job with close and delete actions
3. **`AddJobForm.tsx`** — Form with client-side validation (same rules as server)
4. **`FilterBar.tsx`** — Department and location filter controls

**Commit:** `"feat: implement UI components"`

---

### Task 7 — Wire Up the Full Flow
**Branch:** `feature/ui-components`

1. Connect everything in `App.tsx`
2. Test the full lifecycle manually:
   - Add a job → it appears in the list
   - Close a job → it shows as closed
   - Delete a job → it disappears
   - Filter by department → list updates
   - Submit invalid form → errors shown, no request sent
   - Stop the backend and try to add a job → error displayed, UI does not crash

**Commit:** `"feat: wire up full frontend/backend integration"`

---

### Task 8 — Handle Errors at Every Level
**Branch:** `feature/error-handling`

1. Go through every API call and verify:
   - What happens if the network is unavailable?
   - What happens if the backend returns 404?
   - What happens if the backend returns 422 (validation error)?
   - What happens if the backend returns 500?
2. For each scenario, the UI must:
   - Show a specific, useful error message
   - Not crash
   - Allow the user to retry or recover

**Commit:** `"feat: add comprehensive error handling in UI"`

---

### Task 9 — Documentation
**Branch:** `main` or current working branch

1. Write `README.md` that explains:
   - What the application does
   - How to run both the backend and frontend
   - Available API endpoints
   - How to run the backend tests
2. Write `TESTING.md` documenting manual integration tests

**Commit:** `"docs: add project README"`

---

## 15. Stretch Goals (Optional)

- Add optimistic UI updates: when deleting a job, remove it from the UI immediately and restore it if the API call fails
- Add a "retry" button on error states
- Add a job detail page using URL-based routing (React Router)

### Do NOT Implement:
- Authentication
- A database
- Docker
- Real-time updates (WebSockets)

---

## 16. Definition of Done

- [x] All functional requirements (FR-01 through FR-09) are met
- [x] Frontend and backend communicate successfully
- [x] CORS is correctly configured
- [x] Every API call handles loading, success, and error states
- [x] UI does not crash on any API error
- [x] Client-side and server-side validation are both present
- [x] Backend API tests pass: `pytest` (7/7 passed)
- [x] Frontend API client unit tests pass: `npm run test` (33/33 passed)
- [x] README.md explains how to run both applications
- [x] Feature branches used throughout
- [x] Debugging exercise completed and answers written (in TESTING.md & README.md)

