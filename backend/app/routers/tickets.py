"""REST endpoints for student project tickets, mentor notes, and dashboard stats."""

import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import MentorNote, TICKET_STAGES, Ticket
from app.schemas import (
    MentorNoteCreate,
    MentorNoteRead,
    TicketCreate,
    TicketRead,
    TicketStats,
    TicketStatusUpdate,
)

router = APIRouter(prefix="/api", tags=["tickets"])


def _serialize_ticket(ticket: Ticket, include_notes: bool = True) -> TicketRead:
    return TicketRead(
        id=ticket.id,
        ticket_id=ticket.ticket_id,
        student_name=ticket.student_name,
        email=ticket.email,
        phone=ticket.phone,
        college=ticket.college,
        department=ticket.department,
        academic_year=ticket.academic_year,
        team_size=ticket.team_size,
        project_title=ticket.project_title,
        project_description=ticket.project_description,
        categories=list(ticket.categories or []),
        base_paper_status=ticket.base_paper_status,
        base_paper_reference=ticket.base_paper_reference,
        service_types=list(ticket.service_types or []),
        status=ticket.status,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        notes=[MentorNoteRead.model_validate(n) for n in ticket.notes] if include_notes else [],
    )


def _generate_next_ticket_id(db: Session) -> str:
    existing_ids = db.scalars(select(Ticket.ticket_id)).all()
    max_num = 1000
    for tid in existing_ids:
        match = re.fullmatch(r"PRJ-(\d+)", tid.upper())
        if match:
            max_num = max(max_num, int(match.group(1)))
    return f"PRJ-{max_num + 1}"


def _contacts_match(ticket: Ticket, contact: str) -> bool:
    candidate = contact.strip()
    if not candidate:
        return False
    if candidate.lower() == ticket.email.strip().lower():
        return True
    candidate_digits = re.sub(r"\D", "", candidate)
    ticket_digits = re.sub(r"\D", "", ticket.phone)
    if len(candidate_digits) >= 7 and len(ticket_digits) >= 7:
        # Match full digits or trailing 10 digits (handles optional country code)
        if candidate_digits == ticket_digits:
            return True
        if len(candidate_digits) >= 10 and len(ticket_digits) >= 10:
            return candidate_digits[-10:] == ticket_digits[-10:]
    return candidate == ticket.phone.strip()


@router.get("/stats", response_model=TicketStats)
def get_stats(db: Session = Depends(get_db)) -> TicketStats:
    """Return summary metrics for the admin dashboard header."""
    tickets = db.scalars(select(Ticket)).all()
    by_status = {stage: 0 for stage in TICKET_STAGES}
    for ticket in tickets:
        if ticket.status in by_status:
            by_status[ticket.status] += 1

    return TicketStats(
        total_requests=len(tickets),
        active_in_dev=by_status["Dev"],
        pending_verification=by_status["Verify Contact"],
        delivered=by_status["Delivery"],
        by_status=by_status,
    )


@router.post("/tickets", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)) -> TicketRead:
    """Create a new student project ticket and auto-generate a PRJ-XXXX Ticket ID."""
    ticket_id = _generate_next_ticket_id(db)
    ticket = Ticket(
        ticket_id=ticket_id,
        student_name=payload.student_name,
        email=payload.email,
        phone=payload.phone,
        college=payload.college,
        department=payload.department,
        academic_year=payload.academic_year,
        team_size=payload.team_size,
        project_title=payload.project_title,
        project_description=payload.project_description,
        categories=payload.categories,
        base_paper_status=payload.base_paper_status,
        base_paper_reference=payload.base_paper_reference,
        service_types=payload.service_types,
        status="Request",
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return _serialize_ticket(ticket)


@router.get("/tickets", response_model=list[TicketRead])
def list_tickets(
    status_filter: str | None = Query(default=None, alias="status"),
    category: str | None = Query(default=None),
    academic_year: str | None = Query(default=None),
    base_paper_status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[TicketRead]:
    """Fetch all tickets with optional filters for status, category, year, base paper, and search."""
    stmt = (
        select(Ticket)
        .options(selectinload(Ticket.notes))
        .order_by(Ticket.created_at.desc(), Ticket.id.desc())
    )
    if status_filter:
        stmt = stmt.where(Ticket.status == status_filter)
    if academic_year:
        stmt = stmt.where(Ticket.academic_year == academic_year)
    if base_paper_status:
        stmt = stmt.where(Ticket.base_paper_status == base_paper_status)

    tickets = db.scalars(stmt).all()

    if category:
        tickets = [t for t in tickets if category in (t.categories or [])]

    if search and search.strip():
        needle = search.strip().lower()
        tickets = [
            t
            for t in tickets
            if needle in t.ticket_id.lower()
            or needle in t.student_name.lower()
            or needle in t.project_title.lower()
            or needle in t.college.lower()
            or needle in t.email.lower()
            or needle in t.department.lower()
        ]

    return [_serialize_ticket(t) for t in tickets]


@router.get("/tickets/{ticket_id}", response_model=TicketRead)
def get_ticket(
    ticket_id: str,
    contact: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> TicketRead:
    """Fetch a single ticket by ID. When `contact` is supplied (student lookup), verify email/phone."""
    normalized_id = ticket_id.strip().upper()
    stmt = (
        select(Ticket)
        .options(selectinload(Ticket.notes))
        .where(Ticket.ticket_id == normalized_id)
    )
    ticket = db.scalar(stmt)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{normalized_id}' was not found.",
        )

    if contact is not None:
        if not _contacts_match(ticket, contact):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The provided email or phone number does not match this Ticket ID.",
            )
        # Keep internal mentor notes private on public student lookup
        return _serialize_ticket(ticket, include_notes=False)

    return _serialize_ticket(ticket, include_notes=True)


@router.patch("/tickets/{ticket_id}/status", response_model=TicketRead)
def update_ticket_status(
    ticket_id: str,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
) -> TicketRead:
    """Update a ticket's workflow stage."""
    normalized_id = ticket_id.strip().upper()
    stmt = (
        select(Ticket)
        .options(selectinload(Ticket.notes))
        .where(Ticket.ticket_id == normalized_id)
    )
    ticket = db.scalar(stmt)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{normalized_id}' was not found.",
        )

    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)
    return _serialize_ticket(ticket)


@router.post("/tickets/{ticket_id}/notes", response_model=MentorNoteRead, status_code=status.HTTP_201_CREATED)
def add_mentor_note(
    ticket_id: str,
    payload: MentorNoteCreate,
    db: Session = Depends(get_db),
) -> MentorNoteRead:
    """Attach an internal timestamped mentor note to a ticket."""
    normalized_id = ticket_id.strip().upper()
    ticket = db.scalar(select(Ticket).where(Ticket.ticket_id == normalized_id))
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{normalized_id}' was not found.",
        )

    note = MentorNote(
        ticket_id=ticket.ticket_id,
        author=payload.author,
        content=payload.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return MentorNoteRead.model_validate(note)
