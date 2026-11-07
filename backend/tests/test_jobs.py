import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.storage.in_memory import storage


@pytest.fixture(autouse=True)
def clean_storage():
    """Ensure storage is cleared before every test for clean test isolation."""
    storage.clear()
    yield
    storage.clear()


@pytest.fixture
def client():
    """TestClient fixture."""
    return TestClient(app)


def test_create_job_success(client):
    """Test 1: Create job — 201 Created."""
    payload = {
        "title": "Senior Frontend Developer",
        "department": "Engineering",
        "location": "Remote",
        "description": "Build high-performance React web applications.",
        "salary_range": "$120,000 - $140,000",
    }
    response = client.post("/jobs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == payload["title"]
    assert data["department"] == payload["department"]
    assert data["location"] == payload["location"]
    assert data["description"] == payload["description"]
    assert data["salary_range"] == payload["salary_range"]
    assert data["is_open"] is True


def test_create_job_invalid_data(client):
    """Test 2: Create job with invalid data — 422 Unprocessable Entity."""
    # Missing required fields
    response = client.post("/jobs", json={"title": "Incomplete"})
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data

    # Whitespace only field
    invalid_payload = {
        "title": "   ",
        "department": "Engineering",
        "location": "Remote",
        "description": "Valid description",
        "salary_range": "$80k",
    }
    response = client.post("/jobs", json=invalid_payload)
    assert response.status_code == 422


def test_get_job_list(client):
    """Test 3: Get job list — 200 OK."""
    # Empty list initially
    response = client.get("/jobs")
    assert response.status_code == 200
    assert response.json() == []

    # Create two jobs
    client.post(
        "/jobs",
        json={
            "title": "Backend Engineer",
            "department": "Engineering",
            "location": "Remote",
            "description": "Python FastAPI microservices",
            "salary_range": "$100,000",
        },
    )
    client.post(
        "/jobs",
        json={
            "title": "Marketing Manager",
            "department": "Marketing",
            "location": "New York",
            "description": "Growth and campaigns",
            "salary_range": "$90,000",
        },
    )

    response = client.get("/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) == 2


def test_filter_jobs_by_department_and_location(client):
    """Test filtering jobs by department and location."""
    client.post(
        "/jobs",
        json={
            "title": "Backend Engineer",
            "department": "Engineering",
            "location": "Remote",
            "description": "Python FastAPI",
            "salary_range": "$100,000",
        },
    )
    client.post(
        "/jobs",
        json={
            "title": "QA Engineer",
            "department": "Engineering",
            "location": "London",
            "description": "Automated testing",
            "salary_range": "$80,000",
        },
    )
    client.post(
        "/jobs",
        json={
            "title": "Sales Lead",
            "department": "Sales",
            "location": "Paris",
            "description": "Enterprise sales",
            "salary_range": "$95,000",
        },
    )

    # Filter by department
    res = client.get("/jobs?department=Engineering")
    assert res.status_code == 200
    assert len(res.json()) == 2

    # Filter by location
    res = client.get("/jobs?location=Remote")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "Backend Engineer"

    # Filter by both
    res = client.get("/jobs?department=Engineering&location=London")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["title"] == "QA Engineer"


def test_get_job_by_id_and_not_found(client):
    """Test 4: Get single job and non-existent job — 200 and 404."""
    # Non-existent ID
    response = client.get("/jobs/non-existent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"

    # Create job then get by ID
    create_res = client.post(
        "/jobs",
        json={
            "title": "DevOps Engineer",
            "department": "Infrastructure",
            "location": "Remote",
            "description": "Kubernetes & CI/CD",
            "salary_range": "$110,000",
        },
    )
    job_id = create_res.json()["id"]

    get_res = client.get(f"/jobs/{job_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == job_id
    assert get_res.json()["title"] == "DevOps Engineer"


def test_close_job(client):
    """Test 5: Close a job — 200 OK or 404 Not Found."""
    # Close non-existent job
    res = client.patch("/jobs/non-existent-id/close")
    assert res.status_code == 404
    assert res.json()["detail"] == "Job not found"

    # Create a job (is_open=True by default)
    create_res = client.post(
        "/jobs",
        json={
            "title": "Product Designer",
            "department": "Design",
            "location": "Remote",
            "description": "UI/UX design with Figma",
            "salary_range": "$95,000",
        },
    )
    job_id = create_res.json()["id"]
    assert create_res.json()["is_open"] is True

    # Close the job
    close_res = client.patch(f"/jobs/{job_id}/close")
    assert close_res.status_code == 200
    assert close_res.json()["id"] == job_id
    assert close_res.json()["is_open"] is False

    # Fetch again to verify persistence
    get_res = client.get(f"/jobs/{job_id}")
    assert get_res.status_code == 200
    assert get_res.json()["is_open"] is False


def test_delete_job(client):
    """Test 6: Delete a job — 204 No Content or 404 Not Found."""
    # Delete non-existent job
    res = client.delete("/jobs/non-existent-id")
    assert res.status_code == 404
    assert res.json()["detail"] == "Job not found"

    # Create a job
    create_res = client.post(
        "/jobs",
        json={
            "title": "Content Writer",
            "department": "Marketing",
            "location": "Remote",
            "description": "Technical blogging",
            "salary_range": "$60,000",
        },
    )
    job_id = create_res.json()["id"]

    # Delete the job
    del_res = client.delete(f"/jobs/{job_id}")
    assert del_res.status_code == 204
    assert del_res.text == ""

    # Verify it is deleted
    get_res = client.get(f"/jobs/{job_id}")
    assert get_res.status_code == 404
