from typing import List, Optional
from app.models.job import Job, JobCreate
from app.storage.in_memory import InMemoryJobStorage, storage


class JobService:
    """Service layer handling business logic for job operations."""

    def __init__(self, job_storage: Optional[InMemoryJobStorage] = None) -> None:
        self.storage = job_storage or storage

    def list_jobs(
        self, department: Optional[str] = None, location: Optional[str] = None
    ) -> List[Job]:
        return self.storage.get_all(department=department, location=location)

    def get_job(self, job_id: str) -> Optional[Job]:
        return self.storage.get_by_id(job_id)

    def create_job(self, job_data: JobCreate) -> Job:
        return self.storage.create(job_data)

    def close_job(self, job_id: str) -> Optional[Job]:
        return self.storage.close(job_id)

    def delete_job(self, job_id: str) -> bool:
        return self.storage.delete(job_id)


# Default service instance
job_service = JobService()
