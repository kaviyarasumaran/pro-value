"""Pydantic schemas for request validation and API responses."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import (
    ACADEMIC_YEARS,
    BASE_PAPER_STATUSES,
    PROJECT_CATEGORIES,
    SERVICE_TYPES,
    TEAM_SIZES,
    TICKET_STAGES,
)

StageLiteral = Literal[
    "Request",
    "Verify Contact",
    "Hold",
    "Dev",
    "Test",
    "Delivery",
    "Closed",
]


class MentorNoteCreate(BaseModel):
    """Payload to append a mentor note to a ticket."""

    content: str = Field(..., min_length=1, max_length=3000)
    author: str = Field(default="Mentor", min_length=1, max_length=100)

    @field_validator("content", "author")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be empty or whitespace only.")
        return cleaned


class MentorNoteRead(BaseModel):
    """Serialized mentor note."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: str
    author: str
    content: str
    created_at: datetime


class TicketCreate(BaseModel):
    """Payload for submitting a new student project ticket."""

    student_name: str = Field(..., min_length=2, max_length=150)
    email: str = Field(..., min_length=5, max_length=255)
    phone: str = Field(..., min_length=7, max_length=40)
    college: str = Field(..., min_length=2, max_length=255)
    department: str = Field(..., min_length=1, max_length=100)
    academic_year: str
    team_size: str
    project_title: str = Field(..., min_length=3, max_length=255)
    project_description: str = Field(..., min_length=10, max_length=5000)
    categories: list[str] = Field(..., min_length=1)
    base_paper_status: str
    base_paper_reference: str | None = Field(default=None, max_length=1000)
    service_types: list[str] = Field(..., min_length=1)

    @field_validator(
        "student_name",
        "email",
        "phone",
        "college",
        "department",
        "project_title",
        "project_description",
    )
    @classmethod
    def strip_required(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be blank.")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Please enter a valid email address.")
        return value.lower()

    @field_validator("academic_year")
    @classmethod
    def validate_academic_year(cls, value: str) -> str:
        if value not in ACADEMIC_YEARS:
            raise ValueError(f"academic_year must be one of: {', '.join(ACADEMIC_YEARS)}")
        return value

    @field_validator("team_size")
    @classmethod
    def validate_team_size(cls, value: str) -> str:
        normalized = value.replace("-", "–")
        if normalized not in TEAM_SIZES:
            raise ValueError(f"team_size must be one of: {', '.join(TEAM_SIZES)}")
        return normalized

    @field_validator("base_paper_status")
    @classmethod
    def validate_base_paper_status(cls, value: str) -> str:
        if value not in BASE_PAPER_STATUSES:
            raise ValueError(f"base_paper_status must be one of: {', '.join(BASE_PAPER_STATUSES)}")
        return value

    @field_validator("categories")
    @classmethod
    def validate_categories(cls, value: list[str]) -> list[str]:
        unique = list(dict.fromkeys(v.strip() for v in value if v.strip()))
        invalid = [c for c in unique if c not in PROJECT_CATEGORIES]
        if invalid:
            raise ValueError(f"Invalid categories: {', '.join(invalid)}")
        if not unique:
            raise ValueError("Select at least one project category.")
        return unique

    @field_validator("service_types")
    @classmethod
    def validate_service_types(cls, value: list[str]) -> list[str]:
        unique = list(dict.fromkeys(v.strip() for v in value if v.strip()))
        invalid = [s for s in unique if s not in SERVICE_TYPES]
        if invalid:
            raise ValueError(f"Invalid service types: {', '.join(invalid)}")
        if not unique:
            raise ValueError("Select at least one service type.")
        return unique

    @field_validator("base_paper_reference")
    @classmethod
    def clean_reference(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class TicketStatusUpdate(BaseModel):
    """Payload to transition a ticket to another stage."""

    status: StageLiteral

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in TICKET_STAGES:
            raise ValueError(f"status must be one of: {', '.join(TICKET_STAGES)}")
        return value


class TicketRead(BaseModel):
    """Serialized project ticket with mentor notes."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: str
    student_name: str
    email: str
    phone: str
    college: str
    department: str
    academic_year: str
    team_size: str
    project_title: str
    project_description: str
    categories: list[str]
    base_paper_status: str
    base_paper_reference: str | None
    service_types: list[str]
    status: str
    created_at: datetime
    updated_at: datetime
    notes: list[MentorNoteRead] = Field(default_factory=list)


class TicketStats(BaseModel):
    """Summary metrics for the admin dashboard header."""

    total_requests: int
    active_in_dev: int
    pending_verification: int
    delivered: int
    by_status: dict[str, int]
