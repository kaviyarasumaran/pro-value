"""Database models and domain constants for project tickets and mentor notes."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

TICKET_STAGES: tuple[str, ...] = (
    "Request",
    "Verify Contact",
    "Hold",
    "Dev",
    "Test",
    "Delivery",
    "Closed",
)

PROJECT_CATEGORIES: tuple[str, ...] = (
    "AI / Machine Learning Apps",
    "Mobile Apps (Android/iOS)",
    "Web Applications",
    "SaaS Platforms",
    "ERP / Management Systems",
    "E-Commerce",
    "IoT / Hardware Integration",
    "Other",
)

ACADEMIC_YEARS: tuple[str, ...] = (
    "Pre-Final Year",
    "Final Year",
)

TEAM_SIZES: tuple[str, ...] = (
    "Individual",
    "Group of 2–4",
)

BASE_PAPER_STATUSES: tuple[str, ...] = (
    "Yes",
    "No",
    "Need Guidance Selecting One",
)

SERVICE_TYPES: tuple[str, ...] = (
    "Full Project Development",
    "Code Debugging & Support",
    "Documentation & Report",
    "Base Paper Implementation",
    "1-on-1 Mentorship",
)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Ticket(Base):
    """Student project mentorship & development ticket."""

    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)

    # Student details
    student_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(40), nullable=False)
    college: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(40), nullable=False)
    team_size: Mapped[str] = mapped_column(String(40), nullable=False)

    # Project details
    project_title: Mapped[str] = mapped_column(String(255), nullable=False)
    project_description: Mapped[str] = mapped_column(Text, nullable=False)
    categories: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    # Base paper & service details
    base_paper_status: Mapped[str] = mapped_column(String(50), nullable=False)
    base_paper_reference: Mapped[str | None] = mapped_column(Text, nullable=True)
    service_types: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    # Workflow stage
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="Request", index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    notes: Mapped[list["MentorNote"]] = relationship(
        "MentorNote",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="MentorNote.created_at.desc()",
    )


class MentorNote(Base):
    """Internal timestamped mentor note attached to a ticket."""

    __tablename__ = "mentor_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticket_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("tickets.ticket_id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    author: Mapped[str] = mapped_column(String(100), nullable=False, default="Mentor")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, nullable=False
    )

    ticket: Mapped[Ticket] = relationship("Ticket", back_populates="notes")
