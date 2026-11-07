# Project 04 — Job Board

A fullstack web application for recruiting firms to manage and publish open job positions. The application replaces spreadsheet-based workflows by enabling recruiters to post, browse, filter, close, and delete job openings in real-time.

Built with a **React + TypeScript + Vite + Tailwind CSS** frontend and a **FastAPI + Python** backend communicating over HTTP.

---

## Architecture Overview

```
04-fullstack-app/
├── README.md
├── TESTING.md
├── plan.md
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/
│   │   │   ├── jobs.ts          # Typed API client layer
│   │   │   └── jobs.test.ts     # API client unit tests
│   │   ├── components/
│   │   │   ├── AddJobForm.tsx   # Form with client validation
│   │   │   ├── FilterBar.tsx    # Department & location filter controls
│   │   │   ├── JobCard.tsx      # Single job display with close & delete actions
│   │   │   ├── JobList.tsx      # List rendering (loading, error, empty states)
│   │   │   └── ErrorBoundary.tsx # React error boundary
│   │   ├── hooks/
│   │   │   ├── useJobs.ts       # Custom hook managing state & mutations
│   │   │   └── useJobs.test.ts  # Hook unit tests
│   │   ├── types/
│   │   │   └── job.ts           # TypeScript interfaces matching backend models
│   │   ├── App.tsx              # Root application component
│   │   └── main.tsx             # Entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── backend/                      # FastAPI + Python + Uvicorn
    ├── app/
    │   ├── main.py              # FastAPI app setup, CORS, and global 500 handler
    │   ├── models/
    │   │   └── job.py           # Pydantic schemas (Job, JobCreate, JobFilters)
    │   ├── routes/
    │   │   └── jobs.py          # HTTP routes (/jobs)
    │   ├── services/
    │   │   └── job_service.py   # Business logic layer
    │   └── storage/
    │       └── in_memory.py     # In-memory data store
    ├── tests/
    │   └── test_jobs.py         # Pytest API integration tests
    └── requirements.txt
```

---

## The Request Lifecycle

Every user action follows this explicit lifecycle:
```
User clicks "Add Job"
  → Frontend validates input client-side
    → If invalid: shows form field errors, aborts request
    → If valid:
      → Frontend calls api/jobs.ts function
        → fetch() sends POST /jobs to backend
          → Backend receives request
          → Backend validates with Pydantic schemas
          → Backend creates job in in-memory storage
          → Backend returns 201 Created + job object
        → fetch() receives response
        → api/jobs.ts parses JSON and returns job
      → useJobs hook updates state
    → Component re-renders with new job in list
```

---

## Features & Requirements

- **Browse Positions (FR-01)**: View all current job openings with details and live status badges.
- **Filter Positions (FR-02)**: Search and filter dynamically by department and/or location with instant reset.
- **Post Positions (FR-03)**: Recruiters can add new job openings with title, department, location, description, and salary range.
- **Close Positions (FR-04)**: Mark a position as closed (no longer accepting applications).
- **Delete Positions (FR-05)**: Remove a position permanently with confirmation prompt.
- **Loading Indicators (FR-06)**: Clear loading spinners during data fetching and submission.
- **Specific Error Messages (FR-07)**: Human-friendly error messages for network outages, 404s, 422s, and 500s.
- **Visual Distinction (FR-08)**: Clear badges and color-coding distinguishing Open vs. Closed jobs.
- **Empty States (FR-09)**: Distinct empty states when no jobs exist vs. when filters return no matches.
- **Optimistic UI Updates**: Instant UI feedback on deletion and closing with state rollback on failure.

---

## API Contract

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `POST` | `/jobs` | Create a new job position | `201 Created`, `422 Validation Error` |
| `GET` | `/jobs` | List jobs (supports `?department=` and `?location=`) | `200 OK` |
| `GET` | `/jobs/{id}` | Retrieve a single job position | `200 OK`, `404 Not Found` |
| `PATCH` | `/jobs/{id}/close` | Mark a job as closed | `200 OK`, `404 Not Found` |
| `DELETE` | `/jobs/{id}` | Delete a job position | `204 No Content`, `404 Not Found` |

---

## CORS Configuration

- **Frontend Origin**: `http://localhost:5173`
- **Backend Origin**: `http://localhost:8000`

The browser blocks cross-origin HTTP requests unless explicitly allowed. The backend uses FastAPI's `CORSMiddleware` restricted to `http://localhost:5173`. Wildcards (`*`) are disallowed for production security.

---

## Error Handling Matrix

| Scenario | Frontend Behavior |
|---|---|
| **Network Failure** (backend offline) | Shows error: `"Unable to connect. Please try again."` with a Try Again button. |
| **HTTP 404** (job not found) | Shows error: `"Job not found"`. |
| **HTTP 422** (validation failure) | Maps backend errors directly underneath offending input fields. |
| **HTTP 500** (server crash) | Shows error: `"Something went wrong on our end."` without leaking stack traces. |
| **Request in progress** | Disables submit buttons and shows inline spinners. |

---

## Getting Started

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ (tested on Node v24)
- **npm**: 9+

---

### Running the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   - **Windows**:
     ```powershell
     .\venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

3. (If not already installed) Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. Explore the interactive API documentation:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Running the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. (If not already installed) Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Tests

### Backend Tests (Pytest)
From the `backend` directory:
```bash
pytest -v
```
Runs 7 automated tests covering:
- Job creation (201)
- Validation failure (422)
- Listing jobs (200)
- Query filtering by department & location (200)
- Single job retrieval & 404 handling
- Closing a job (200 & 404)
- Deleting a job (204 & 404)

### Frontend Tests (Vitest)
From the `frontend` directory:
```bash
npm test
```
Runs 33 automated tests across 7 test suites:
- `api/jobs.test.ts`: API client functions, error codes (404, 422, 500, network failure).
- `hooks/useJobs.test.ts`: Hook state, optimistic updates, rollback on error.
- `components/JobCard.test.tsx`: Card details, action buttons, open/close styling.
- `components/AddJobForm.test.tsx`: Client-side validation, error messages.
- `components/JobList.test.tsx`: Loading, error, empty states.
- `test/errorScenarios.test.tsx`: Comprehensive error simulation.
- `App.test.tsx`: End-to-end component flow integration.

---

## Security Considerations

1. **Strict CORS**: Only the frontend origin is permitted; wildcard access is rejected.
2. **Dual-Layer Validation**: Frontend checks improve user feedback; backend Pydantic models guarantee data integrity.
3. **Information Disclosure Prevention**: Global 500 handler logs server-side stack traces and returns generic error messages to clients.

