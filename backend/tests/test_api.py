"""End-to-end API tests for the Student Project Mentorship & Development Portal."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture()
def client(tmp_path: Path):
    """Provide an isolated empty SQLite database per test."""
    db_file = tmp_path / "test_mentorship.db"

    test_engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app, raise_server_exceptions=True) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    test_engine.dispose()


def _sample_payload(**overrides):
    data = {
        "student_name": "Neha Gupta",
        "email": "neha.gupta@iitb.ac.in",
        "phone": "+91 98200 12345",
        "college": "IIT Bombay",
        "department": "CSE",
        "academic_year": "Final Year",
        "team_size": "Group of 2-4",
        "project_title": "Autonomous Drone Path Planner",
        "project_description": "Reinforcement learning trajectory optimizer for indoor obstacle avoidance.",
        "categories": ["AI / Machine Learning Apps", "IoT / Hardware Integration"],
        "base_paper_status": "Yes",
        "base_paper_reference": "ICRA 2024: Safe RL Navigation",
        "service_types": ["Full Project Development", "Base Paper Implementation"],
    }
    data.update(overrides)
    return data


def test_empty_initial_state_and_stats(client: TestClient):
    res = client.get("/api/tickets")
    assert res.status_code == 200
    assert res.json() == []

    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_requests"] == 0
    assert stats["active_in_dev"] == 0
    assert stats["pending_verification"] == 0
    assert stats["delivered"] == 0


def test_create_ticket_and_student_lookup(client: TestClient):
    create_res = client.post("/api/tickets", json=_sample_payload())
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["ticket_id"] == "PRJ-1001"
    assert created["status"] == "Request"
    assert created["team_size"] == "Group of 2–4"

    # Lookup with matching email
    email_lookup = client.get("/api/tickets/PRJ-1001", params={"contact": "NEHA.GUPTA@iitb.ac.in"})
    assert email_lookup.status_code == 200
    assert email_lookup.json()["project_title"] == "Autonomous Drone Path Planner"

    # Lookup with matching phone (digits only)
    phone_lookup = client.get("/api/tickets/prj-1001", params={"contact": "9820012345"})
    assert phone_lookup.status_code == 200

    # Lookup with mismatched contact fails
    bad_lookup = client.get("/api/tickets/PRJ-1001", params={"contact": "wrong@example.com"})
    assert bad_lookup.status_code == 403


def test_filters_status_update_and_notes(client: TestClient):
    client.post(
        "/api/tickets",
        json=_sample_payload(
            student_name="Priya Nair",
            email="priya@nitk.edu.in",
            categories=["SaaS Platforms"],
            project_title="Campus Placement SaaS",
        ),
    )
    client.post(
        "/api/tickets",
        json=_sample_payload(
            student_name="Sneha Kulkarni",
            email="sneha@coep.ac.in",
            categories=["Mobile Apps (Android/iOS)"],
            project_title="Farmers Produce App",
        ),
    )

    # Filter by category
    res = client.get("/api/tickets", params={"category": "SaaS Platforms"})
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["ticket_id"] == "PRJ-1001"

    # Search by ticket ID
    search_res = client.get("/api/tickets", params={"search": "PRJ-1002"})
    assert search_res.status_code == 200
    assert len(search_res.json()) == 1
    assert search_res.json()[0]["student_name"] == "Sneha Kulkarni"

    # Update status
    patch_res = client.patch("/api/tickets/PRJ-1002/status", json={"status": "Verify Contact"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Verify Contact"

    # Stats reflect update
    stats = client.get("/api/stats").json()
    assert stats["total_requests"] == 2
    assert stats["pending_verification"] == 1

    # Invalid status rejected
    bad_patch = client.patch("/api/tickets/PRJ-1002/status", json={"status": "InvalidStage"})
    assert bad_patch.status_code == 422

    # Add mentor note
    note_res = client.post(
        "/api/tickets/PRJ-1002/notes",
        json={"author": "Mentor Raj", "content": "Scheduled initial architecture review."},
    )
    assert note_res.status_code == 201
    assert note_res.json()["author"] == "Mentor Raj"

    detail_res = client.get("/api/tickets/PRJ-1002")
    assert detail_res.status_code == 200
    assert len(detail_res.json()["notes"]) == 1
    assert detail_res.json()["notes"][0]["content"] == "Scheduled initial architecture review."
