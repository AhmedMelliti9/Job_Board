# Testing Guide & Manual Test Plan

This document outlines both manual integration test scenarios and automated test instructions for the Job Board application.

---

## 1. Manual Integration Test Scenarios

### Scenario A: Full Lifecycle (Create → View → Filter → Close → Delete)

| Step | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Start backend (`uvicorn app.main:app --reload`) and frontend (`npm run dev`). Open `http://localhost:5173`. | Header loads showing `0 Total Positions`. Empty state appears: "No Positions Available". | [Pass] |
| 2 | Click **"Post New Job"**. | The recruiter job creation form expands smoothly. | [Pass] |
| 3 | Fill in the form: <br>&bull; Title: `Senior Python Engineer`<br>&bull; Department: `Engineering`<br>&bull; Location: `Remote`<br>&bull; Salary Range: `$130,000 - $150,000`<br>&bull; Description: `Develop FastAPI backend services.`<br>Click **"Publish Position"**. | Submit button displays spinner `"Posting Job..."` and disables. Success banner appears: `"Job position posted successfully!"`. Form resets and closes. | [Pass] |
| 4 | Check the jobs list. | The new job appears immediately at the top with an **Open** badge (green pulsing indicator). Total counter updates to `1 Total Position`. | [Pass] |
| 5 | Post a second job: `Marketing Specialist` in `Marketing`, `New York`. | List updates to display 2 jobs. Header reads `2 Total Positions`. | [Pass] |
| 6 | In the Filter Bar, type `Engineering` into the department field. | List dynamically filters to show only `Senior Python Engineer`. | [Pass] |
| 7 | In the Filter Bar, type `London` into the location field. | Empty state appears with contextual message: `"No Matching Positions"`. | [Pass] |
| 8 | Click **"Clear Filters"**. | Both jobs reappear immediately. | [Pass] |
| 9 | Click **"Close Position"** on `Senior Python Engineer`. | Button shows loading spinner `"Closing..."`. Status badge changes to **Closed** (gray). "Close Position" button disappears. Counter updates to `1 Open, 1 Closed`. | [Pass] |
| 10 | Click **"Delete"** on `Marketing Specialist`. Accept the confirmation prompt. | Job is removed from the list immediately. Total counter updates to `1 Total Position`. | [Pass] |

---

### Scenario B: Backend Stopped Mid-Session (Resilience & Recovery)

| Step | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | With frontend open showing the jobs list, stop the backend server (`Ctrl + C` in backend terminal). | Frontend remains intact; UI does not crash. | [Pass] |
| 2 | Attempt to post a new job position or close an existing job. | Mutation fails cleanly. Error message displays: `"Unable to connect. Please try again."`. If closing/deleting, optimistic change rolls back to preserve original state. | [Pass] |
| 3 | Refresh the browser page with the backend offline. | Error screen renders with specific message: `"Unable to connect. Please try again."` and a `"Try Again"` button. No blank screen, no crash. | [Pass] |
| 4 | Restart the backend server (`uvicorn app.main:app --reload`). Click **"Try Again"**. | Loading spinner appears; jobs list recovers and renders successfully without requiring full page refresh. | [Pass] |

---

### Scenario C: Validation Testing (Client-Side & Server-Side)

| Step | Action | Expected Result | Pass/Fail |
|---|---|---|---|
| 1 | Open **"Post New Job"** form. Leave all fields empty. Click **"Publish Position"**. | Client-side validation triggers instantly. Red error messages appear under all 5 fields. Network tab confirms **0 HTTP requests** were dispatched. | [Pass] |
| 2 | Enter only whitespace (`"   "`) into the Title and Salary Range fields. | Client-side validation catches whitespace-only input and displays field error. | [Pass] |
| 3 | Bypass client validation using DevTools or curl to send invalid JSON (`POST /jobs` with `{}`). | Backend responds with `422 Unprocessable Entity`. Frontend displays field-level error messages directly under inputs. | [Pass] |

---

## 2. Automated Test Execution

### Backend Automated Tests
```bash
cd backend
pytest -v
```
**Test Results**: 7 passing tests
- `test_create_job_success`: Verifies `POST /jobs` returns 201 with generated UUID and `is_open: true`.
- `test_create_job_invalid_data`: Verifies `POST /jobs` with missing/whitespace data returns 422.
- `test_get_job_list`: Verifies `GET /jobs` returns 200 and list of jobs.
- `test_filter_jobs_by_department_and_location`: Tests filtering by department, location, and combined.
- `test_get_job_by_id_and_not_found`: Tests `GET /jobs/{id}` returns 200 or 404 with `"Job not found"`.
- `test_close_job`: Tests `PATCH /jobs/{id}/close` toggles `is_open` to `false` (200 or 404).
- `test_delete_job`: Tests `DELETE /jobs/{id}` removes job returning 204 or 404.

### Frontend Automated Tests
```bash
cd frontend
npm test
```
**Test Results**: 33 passing tests across 7 test suites
- `src/api/jobs.test.ts` (8 tests): Typed client functions, URL query building, HTTP methods, status code parsing (200, 201, 204, 404, 422, 500, network error).
- `src/hooks/useJobs.test.ts` (5 tests): State initialization, mounting fetch, create, optimistic close, optimistic delete & error rollback.
- `src/components/JobCard.test.tsx` (4 tests): Details rendering, badge styles, actions handling.
- `src/components/AddJobForm.test.tsx` (3 tests): Form toggling, client-side validation, submit dispatch.
- `src/components/JobList.test.tsx` (4 tests): Loading spinner, error container, empty state variants.
- `src/test/errorScenarios.test.tsx` (6 tests): End-to-end failure scenarios (network, 404, 422, 500, in-flight, error boundary).
- `src/App.test.tsx` (3 tests): Full application integration.

