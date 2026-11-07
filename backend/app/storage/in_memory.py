import uuid
from typing import Dict, List, Optional
from app.models.job import Job, JobCreate


class InMemoryJobStorage:
    """Thread-safe in-memory storage for jobs."""

    def __init__(self) -> None:
        self._jobs: Dict[str, Job] = {}

    def get_all(
        self, department: Optional[str] = None, location: Optional[str] = None
    ) -> List[Job]:
        jobs = list(self._jobs.values())
        if department:
            dept_lower = department.strip().lower()
            jobs = [j for j in jobs if dept_lower in j.department.lower()]
        if location:
            loc_lower = location.strip().lower()
            jobs = [j for j in jobs if loc_lower in j.location.lower()]
        return jobs

    def get_by_id(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def create(self, job_data: JobCreate) -> Job:
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id,
            title=job_data.title,
            department=job_data.department,
            location=job_data.location,
            description=job_data.description,
            salary_range=job_data.salary_range,
            is_open=True,
        )
        self._jobs[job_id] = job
        return job

    def close(self, job_id: str) -> Optional[Job]:
        job = self._jobs.get(job_id)
        if not job:
            return None
        updated_job = job.model_copy(update={"is_open": False})
        self._jobs[job_id] = updated_job
        return updated_job

    def delete(self, job_id: str) -> bool:
        if job_id in self._jobs:
            del self._jobs[job_id]
            return True
        return False

    def clear(self) -> None:
        """Clear all stored jobs, useful for test isolation."""
        self._jobs.clear()


# Singleton storage instance used by the service layer
storage = InMemoryJobStorage()
