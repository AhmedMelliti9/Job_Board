# Project 04 — Job Board

```

---

## Learning Objectives

By the end of this project you will be able to:

- Explain the complete HTTP request lifecycle from user action to UI update
- Connect a React frontend to a FastAPI backend
- Handle loading, success, and error states in the UI for every API call
- Configure CORS correctly and explain why it is required
- Write a typed API client layer in TypeScript
- Handle different HTTP error codes differently in the frontend
- Write basic integration tests that test frontend and backend together
- Understand the difference between a client error (4xx) and a server error (5xx)

---

## Problem Statement

A small recruitment firm lists job openings manually in a spreadsheet. Their team wastes time searching through the sheet to find open roles by department or location. They want a web application where:

- Recruiters can post new job openings via a form
- Anyone can browse open positions
- Positions can be filtered by department and location
- Positions can be closed (marked no longer accepting applications)
- Positions can be deleted by recruiters

You are building both the React frontend and the FastAPI backend. They must communicate over HTTP. The backend stores data in memory for now.

---

## Functional Requirements

```
FR-01: Users can view a list of open job positions.
FR-02: Users can filter positions by department and/or location.
FR-03: Recruiters can create a new job position (title, department, location, description, salary range).
FR-04: Recruiters can close a position (mark it as no longer accepting applications).
FR-05: Recruiters can delete a position.
FR-06: The UI shows a loading indicator while API requests are in progress.
FR-07: The UI displays a specific error message when a request fails.
FR-08: The UI clearly distinguishes between open and closed positions.
FR-09: The position list shows an appropriate empty state when no positions exist or match the filter.
```

---

## Non-Functional Requirements

```
NFR-01: Every API call in the frontend handles three states: loading, success, error.
NFR-02: API errors are displayed to the user in a useful way — not "Something went wrong".
NFR-03: The frontend never crashes due to an unhandled API error.
NFR-04: All user input is validated on both the frontend and backend.
NFR-05: The backend and frontend are separate projects in the same repository.
```

---

## Technical Requirements

### Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend:

- Python
- FastAPI
- Uvicorn
- In-memory storage

### You must NOT use:

- A database
- Authentication
- React Query, SWR, or any data-fetching library — use the native `fetch` API
- axios — use `fetch`
- Redux or external state management

### Why these constraints?

Using `fetch` directly forces you to understand how HTTP requests work from the JavaScript side. React Query and SWR are excellent tools — but they abstract away concepts you need to understand first.

---

## Suggested Project Structure

```
04-fullstack-app/
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

### Why `api/jobs.ts`?

All fetch calls to the backend live in one place. Components never call `fetch` directly — they call functions from `api/jobs.ts`. This makes it easy to change the API URL, add headers, or handle errors in one place instead of scattered across every component.

### Why `hooks/useJobs.ts`?

A custom hook encapsulates the state management for an API call (loading, data, error). Components stay clean and focused on rendering.

---

## Understanding CORS

Before you start, read about CORS (Cross-Origin Resource Sharing).

Your frontend will run on `http://localhost:5173`.
Your backend will run on `http://localhost:8000`.

These are different origins. The browser will block requests from the frontend to the backend unless the backend explicitly allows it.

You will need to configure FastAPI to accept requests from `http://localhost:5173`.

Understand why CORS exists and what it protects against. This is a security mechanism — not an arbitrary annoyance.

---

## The Full Request Lifecycle

Every time a user action triggers an API call, this sequence happens:

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

## Implementation Tasks

### Task 1 — Set Up Both Projects

Set up the backend :
(Create a Python virtual environment
Install dependencies
Initialize a minimal FastAPI app in main.py
Verify the server starts: uvicorn app.main:app --reload
Visit http://localhost:8000/docs — FastAPI auto-generates documentation
Add .gitignore (Python + venv)
Initialize Git and make first commit)

Set up the frontend :
(Initialize a new Vite + React + TypeScript project
Install and configure Tailwind CSS
Install Vitest and React Testing Library
Configure Vitest in vite.config.ts
Initialize Git, make initial commit)

Configure CORS in FastAPI to allow requests from the frontend origin.

Verify: The backend starts, the frontend starts, and the browser can reach both.

Commit: `"chore: initialize fullstack project structure"`

---

### Task 2 — Define Shared Types and API Contract

Before writing any UI or route logic, define the API contract:

**What does `POST /jobs` accept?**
**What does `GET /jobs` return?**
**What does `GET /jobs/{id}` return?**
**What does `PATCH /jobs/{id}/close` return?**
**What does `DELETE /jobs/{id}` return?**

Write the Pydantic models in the backend.
Write the TypeScript types in the frontend.

They should mirror each other.

Commit: `"feat: define job types and API contract"`

---

### Task 3 — Build the Backend API

Build all routes:

```
POST   /jobs              → create a job (201)
GET    /jobs              → list jobs, supports ?department= and ?location= (200)
GET    /jobs/{id}         → get one job (200 or 404)
PATCH  /jobs/{id}/close   → mark job as closed (200 or 404)
DELETE /jobs/{id}         → delete job (204 or 404)
```

Write at least 5 API tests using pytest.

Commit: `"feat: implement jobs API"`

---

### Task 4 — Build the API Client Layer

In `src/api/jobs.ts`, write typed functions:

- `fetchJobs(filters?: JobFilters): Promise<Job[]>`
- `createJob(data: CreateJobInput): Promise<Job>`
- `closeJob(id: string): Promise<Job>`
- `deleteJob(id: string): Promise<void>`

Each function must:
- Construct the correct URL
- Send the correct HTTP method
- Parse the response JSON
- Throw a meaningful error if the response is not 2xx

Components must never call `fetch` directly.

Commit: `"feat: implement typed API client"`

---

### Task 5 — Build a Custom Hook

In `src/hooks/useJobs.ts`, build a custom hook that:

- Fetches the job list on mount
- Exposes: `jobs`, `loading`, `error`
- Exposes: `createJob`, `closeJob`, `deleteJob` functions that update the local state optimistically or re-fetch after mutation

Commit: `"feat: implement useJobs custom hook"`

---

### Task 6 — Build the UI Components

Build:

- `JobList.tsx` — renders the list, handles loading/error/empty states
- `JobCard.tsx` — renders a single job with close and delete actions
- `AddJobForm.tsx` — form with validation (client-side, same rules as server)
- `FilterBar.tsx` — department and location filter controls

Commit: `"feat: implement UI components"`

---

### Task 7 — Wire Up the Full Flow

Connect everything in `App.tsx`.

Test the full lifecycle manually:
- Add a job → it appears in the list
- Close a job → it shows as closed
- Delete a job → it disappears
- Filter by department → list updates
- Submit invalid form → errors shown, no request sent
- Stop the backend and try to add a job → error displayed, UI does not crash

Commit: `"feat: wire up full frontend/backend integration"`

---

### Task 8 — Handle Errors at Every Level

At this stage, go through every API call and verify:

- What happens if the network is unavailable?
- What happens if the backend returns 404?
- What happens if the backend returns 422 (validation error)?
- What happens if the backend returns 500?

For each scenario, the UI must:
- Show a specific, useful error message
- Not crash
- Allow the user to retry or recover

Commit: `"feat: add comprehensive error handling in UI"`

---

### Task 9 — Documentation

Write a `README.md` that explains:

- What the application does
- How to run both the backend and frontend
- Available API endpoints
- How to run the backend tests

Commit: `"docs: add project README"`

---

## Error Handling Requirements

### Frontend

| Scenario | Expected Behavior |
|---|---|
| Network request fails (backend down) | Show error: "Unable to connect. Please try again." |
| Backend returns 404 | Show error: "Job not found" |
| Backend returns 422 | Show field-level errors from the API response |
| Backend returns 500 | Show error: "Something went wrong on our end." |
| Request is in progress | Show loading indicator; disable submit button |

### Backend

Same as Project 03 — consistent structured error responses, no tracebacks exposed.

### Key lesson:

The frontend must handle every possible outcome of an API call. "Just assume it works" is not acceptable. A network call can fail at any point.

---

## Testing Requirements

### Backend API tests (pytest)

Write tests covering:
- Create job — 201
- Create job with invalid data — 422
- Get job list — 200
- Get non-existent job — 404
- Close a job — 200
- Delete a job — 204

### Frontend unit tests (Vitest)

Write unit tests for the API client functions in `api/jobs.ts` using `vi.mock` to mock fetch:

- `fetchJobs` returns parsed Job array on 200
- `createJob` throws on 422
- `deleteJob` returns void on 204

### Manual integration tests

Document in `TESTING.md`:
- Testing the full create-view-close-delete lifecycle
- Testing what happens when the backend is stopped mid-session

---

## Git Requirements
github repo to push : 'https://github.com/AhmedMelliti9/Job_Board.git' 

Continue using feature branches.

New rule this week:

Write the API contract (types and routes) before writing either the frontend or backend implementation. Commit the contract first. This is how teams work when frontend and backend are developed in parallel.

Suggested branches:
- `feature/api-contract`
- `feature/backend-routes`
- `feature/api-client`
- `feature/ui-components`
- `feature/error-handling`

---

## Security Requirements

**CORS configuration**

- Only allow the specific frontend origin, not `*` (wildcard) in production
- Understand why wildcard CORS is a security risk

**Input validation on both sides**

- The frontend validates before sending — for user experience
- The backend validates on receipt — for security
- These are not redundant; they serve different purposes

**Sensitive data in errors**

- The backend must never return internal implementation details
- Log full errors server-side; return generic messages for 500s

---




## Stretch Goals

```
Optional:
- Add optimistic UI updates: when deleting a job, remove it from the UI immediately
  and restore it if the API call fails
- Add a "retry" button on error states
- Add a job detail page using URL-based routing (React Router)

Do NOT implement:
- Authentication
- A database
- Docker
- Real-time updates (WebSockets)
```

---

## Definition of Done

```
[ ] All functional requirements (FR-01 through FR-09) are met
[ ] Frontend and backend communicate successfully
[ ] CORS is correctly configured
[ ] Every API call handles loading, success, and error states
[ ] UI does not crash on any API error
[ ] Client-side and server-side validation are both present
[ ] Backend API tests pass: pytest
[ ] Frontend API client unit tests pass: npm run test
[ ] README.md explains how to run both applications
[ ] Feature branches used throughout
[ ] Debugging exercise completed and answers written
```

---

---

