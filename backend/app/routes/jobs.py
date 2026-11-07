from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.job import Job, JobCreate
from app.services.job_service import job_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=Job, status_code=status.HTTP_201_CREATED)
def create_job(job_data: JobCreate) -> Job:
    """Create a new job position."""
    return job_service.create_job(job_data)


@router.get("", response_model=List[Job], status_code=status.HTTP_200_OK)
def list_jobs(
    department: Optional[str] = Query(None, description="Filter by department"),
    location: Optional[str] = Query(None, description="Filter by location"),
) -> List[Job]:
    """List all job positions, optionally filtered by department and/or location."""
    return job_service.list_jobs(department=department, location=location)


@router.get("/{job_id}", response_model=Job, status_code=status.HTTP_200_OK)
def get_job(job_id: str) -> Job:
    """Get a single job position by its ID."""
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return job


@router.patch("/{job_id}/close", response_model=Job, status_code=status.HTTP_200_OK)
def close_job(job_id: str) -> Job:
    """Mark a job position as closed."""
    job = job_service.close_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: str) -> None:
    """Delete a job position."""
    deleted = job_service.delete_job(job_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return None
