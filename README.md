# ProValue Student Project Mentorship & Development Portal

A full-stack web application for managing academic project mentorship and end-to-end development services for pre-final and final-year college students.

## Architecture

- **Frontend (`/frontend`)**: React 19, Vite, TypeScript, Tailwind CSS v4, Radix UI (`@radix-ui/themes`, `@radix-ui/react-toast`, `@radix-ui/colors`), `lucide-react`, `@dnd-kit/core`, and `react-router-dom`.
- **Backend (`/backend`)**: Python, FastAPI, SQLAlchemy 2.0, Pydantic v2, and SQLite (configured via `DATABASE_URL` for seamless migration to PostgreSQL).

## Features

1. **Student Intake & Status Tracker (`/`)**:
   - Captures student details (name, email, phone/WhatsApp, college, department, academic year, individual vs group of 2–4).
   - Project details: title, description, multi-select categories (Radix Checkboxes), IEEE/base paper status (`Yes` with paper link/title, `No`, or `Need Guidance Selecting One`), and multi-select service types.
   - Generates a unique Ticket ID (`PRJ-XXXX`) shown in a Radix Dialog confirmation, plus a public Status Tracker modal (`Ticket ID + Email/Phone`).

2. **Admin / Mentor Dashboard (`/admin`)**:
   - Summary KPI metrics (`Total Requests`, `Pending Verification`, `Active in Dev`, `Delivered`).
   - Search and filter by category, academic year, and base paper status.
   - Radix Tabs view switcher between a **7-column Kanban Board** (`Request`, `Verify Contact`, `Hold`, `Dev`, `Test`, `Delivery`, `Closed`) with `@dnd-kit/core` drag-and-drop + quick-status dropdowns, and a **List/Table View**.
   - Full Ticket Detail Dialog with base paper reference and timestamped internal mentor notes.

## Running Locally (Concurrent Backend + Frontend)

### 1. Start the FastAPI Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- API base URL: `http://127.0.0.1:8000`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

- Student Portal: `http://localhost:5173/`
- Admin / Mentor Dashboard: `http://localhost:5173/admin`
- Vite automatically proxies `/api/*` requests to `http://127.0.0.1:8000`.

### 3. Run Backend Tests

```bash
cd backend
.venv/bin/pytest -v
```

### 4. Build Frontend for Production

```bash
cd frontend
npm run build
```

## REST API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/tickets` | Create a new student project ticket (generates `PRJ-XXXX`, defaults to `Request`) |
| `GET` | `/api/tickets` | List tickets with optional `status`, `category`, `academic_year`, `base_paper_status`, `search` |
| `GET` | `/api/tickets/{ticket_id}` | Fetch single ticket details (pass `?contact=...` for verified student lookup) |
| `PATCH` | `/api/tickets/{ticket_id}/status` | Move ticket to another workflow stage |
| `POST` | `/api/tickets/{ticket_id}/notes` | Add an internal timestamped mentor note |
| `GET` | `/api/stats` | Retrieve summary metrics and per-stage ticket counts |

## Migrating to PostgreSQL

Set `DATABASE_URL` in the backend environment before starting `uvicorn` (with `psycopg` installed):

```bash
export DATABASE_URL="postgresql+psycopg://user:password@localhost:5432/provalue"
```
