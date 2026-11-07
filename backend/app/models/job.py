from typing import Optional
from pydantic import BaseModel, Field, field_validator


class JobBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Job title")
    department: str = Field(..., min_length=1, max_length=50, description="Department name")
    location: str = Field(..., min_length=1, max_length=50, description="Job location")
    description: str = Field(..., min_length=1, max_length=2000, description="Job description")
    salary_range: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Salary range, e.g. $80,000 - $100,000",
    )

    @field_validator("title", "department", "location", "description", "salary_range")
    @classmethod
    def not_empty_or_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Field cannot be empty or contain only whitespace")
        return stripped


class JobCreate(JobBase):
    """Payload for creating a new job position."""
    pass


class Job(JobBase):
    """Full job position representation returned by the API."""
    id: str
    is_open: bool = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Software Engineer",
                "department": "Engineering",
                "location": "Remote",
                "description": "Develop and maintain web applications.",
                "salary_range": "$90,000 - $120,000",
                "is_open": True,
            }
        }
    }


class JobFilters(BaseModel):
    """Query parameters for filtering job listings."""
    department: Optional[str] = None
    location: Optional[str] = None
