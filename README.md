# Locus — Library Desk Management System

> *"Your seat. Not your bag's."*

Locus is a full-stack web application built for academic institutions to manage library desk occupancy in real time. It solves a common problem on campuses: students leaving bags on desks for hours while vacating the seat, making it impossible for others to know if a spot is truly available. Locus provides a live map of desk statuses, QR-based check-in/out for students, and an administrative dashboard for library staff.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Desk Status Model](#desk-status-model)

---

## Features

**For Students**
- QR code scan to check in to a desk and start a timed session
- "I'm Away" button to temporarily flag your seat, preventing it from being reassigned
- "I'm Back" to return to active status
- Clean success screen with session timer upon check-in

**For Library Staff**
- Live interactive map view showing real-time desk statuses
- List view with sortable, filterable desk table
- Room management panel
- Analytics dashboard for occupancy trends
- Configurable settings: session timeout, operating hours, QR code generation, notification preferences

**Automated Session Management**
- A background sweeper runs every 60 seconds and automatically marks sessions as ended if:
  - A student has been "Away" for more than **20 minutes**
  - No check-in activity has occurred in the last **2 hours**
- Desks tied to ended sessions are marked **Abandoned**, queuing them for a staff reset

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v3, PostCSS, Autoprefixer |
| Routing | React Router DOM v6 |
| Icons | Lucide React, Google Material Symbols |
| Backend | Node.js, Express 5, TypeScript, ts-node |
| Database | PostgreSQL (via `pg` driver) |
| Environment | `dotenv` for config management |

---

## Project Structure

```
kirtankumarsanghi-locus/
├── design.md                  # Design system specification (colors, typography, layout)
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── db.ts              # PostgreSQL connection pool & table initialization
│       └── index.ts           # Express server, all API routes, background sweeper
│
└── frontend/
    ├── index.html             # HTML entry point, loads fonts
    ├── package.json
    ├── vite.config.ts         # Vite bundler config
    ├── tailwind.config.js     # Custom design tokens wired into Tailwind
    ├── postcss.config.js
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── src/
        ├── main.tsx           # React app entry point
        ├── App.tsx            # Route definitions (student vs staff views)
        ├── index.css          # Global styles, custom animations
        ├── components/
        │   ├── Layout.tsx     # Persistent sidebar navigation for staff
        │   └── Logo.tsx       # Locus brand logo component
        └── pages/
            ├── Landing.tsx        # Public landing/marketing page
            ├── MapView.tsx        # Interactive visual desk map (staff)
            ├── DeskList.tsx       # Tabular desk list view (staff)
            ├── Rooms.tsx          # Room/zone management (staff)
            ├── Analytics.tsx      # Occupancy analytics dashboard (staff)
            ├── Settings.tsx       # Configuration panel (staff)
            ├── ActiveSession.tsx  # Student's live session screen
            └── CheckinSuccess.tsx # Post check-in confirmation screen
```

---

## How It Works

### Student Flow

1. A student approaches a free desk and scans the QR code attached to it.
2. The frontend sends a `POST /api/check-in` request with the desk number and student ID.
3. The backend creates a new session record, marks the desk as **Occupied**, and returns a `sessionId`.
4. The student is shown the `CheckinSuccess` screen with a live session timer.
5. If they step out briefly, they hit "I'm Away" → `POST /api/away` sets the desk to **Away** and records the away start time.
6. When they return, "I'm Back" → `POST /api/here` clears the away timer and restores **Occupied** status.
7. When done, the session ends (either manually or via auto-timeout).

### Staff Flow

Staff access the application via a sidebar layout (`/map`, `/list`, `/rooms`, `/analytics`, `/settings`). They can:
- See all desks color-coded by live status on the map or in a list.
- Manually reset an **Abandoned** desk to **Free** via `POST /api/reset`.
- Review analytics and configure system behavior in Settings.

### Background Sweeper

Every 60 seconds, a server-side function runs two SQL updates:

1. It ends any active session that has been Away for more than 20 minutes, or has had no activity for over 2 hours.
2. It marks any desk still linked to an ended session as **Abandoned**.

This keeps the desk map accurate even when students leave without formally checking out.

---

## API Reference

All endpoints are served from `http://localhost:4000`.

### `GET /api/desks`
Returns all desks ordered by desk number.

**Response:** Array of desk objects with `id`, `number`, `status`, `current_session_id`, `created_at`, `updated_at`.

---

### `POST /api/check-in`
Starts a new session at a free desk.

**Body:**
```json
{
  "deskNumber": "A-12",
  "studentId": "student_xyz"
}
```

**Response:** `{ "success": true, "sessionId": "<uuid>" }`

**Errors:** `404` if desk not found, `400` if desk is not free.

---

### `POST /api/away`
Marks a session as temporarily away; desk status becomes `AWAY`.

**Body:**
```json
{ "sessionId": "<uuid>" }
```

---

### `POST /api/here`
Marks a student as returned; clears the away timer, desk becomes `OCCUPIED`.

**Body:**
```json
{ "sessionId": "<uuid>" }
```

---

### `POST /api/reset`
Staff-only action. Frees a desk, clearing any linked session.

**Body:**
```json
{ "deskId": "<uuid>" }
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- `ts-node` (installed as a dev dependency)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd kirtankumarsanghi-locus
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/locus_db
PORT=4000
```

Start the backend server:

```bash
npm run dev
```

On startup, the server automatically runs `initDB()`, which creates the `desks` and `sessions` tables if they don't already exist. No manual migration step needed.

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` by default (Vite's standard port). Make sure the backend is running on port `4000` so API calls resolve correctly.

### 4. Seed Desks (Manual Step)

The database schema initializes tables but does not seed desk records. You'll need to insert desks manually or build a seed script, for example:

```sql
INSERT INTO desks (number, status) VALUES ('A-01', 'FREE'), ('A-02', 'FREE'), ('B-01', 'FREE');
```

---

## Design System

The visual design is codified in `design.md` and reflected in `tailwind.config.js`. The key principles are:

**Font:** Inter exclusively — chosen for its tall x-height, which keeps desk numbers and countdown timers legible at small sizes. Tabular figures (`tnum`) are used on numerical data to prevent jitter during live countdowns.

**Color Palette:** Anchored by an Indigo primary (`#4F46E5`) and Slate secondary. The most important colors are the semantic status tokens:

| Status | Background Token | Meaning |
|---|---|---|
| Available | `status-available` (green) | Desk is free to claim |
| Occupied | `status-occupied` (red) | Desk is currently in use |
| Away | `status-away` (yellow) | Student stepped out temporarily |
| Abandoned | Gray (neutral) | Student left without checking out; needs staff reset |

**Spacing:** 4px baseline grid throughout. `sm` (8px) for related items (label + timer), `lg` (24px) between unrelated sections.

**Layout:** Desktop uses a persistent split-view — sidebar for navigation, main viewport for the desk map. Tablet and mobile collapse to card-based and simplified layouts.

**Elevation:** Tonal layers over shadows. Cards are defined by a 1px border, not drop shadows. Interactive elements get a subtle `4px 12px` shadow on hover to suggest lift.

---

## Desk Status Model

```
         Student scans QR
                │
                ▼
           [ FREE ] ◄─────────────────── Staff resets
                │                                ▲
       check-in succeeds                         │
                │                         [ ABANDONED ]
                ▼                                ▲
         [ OCCUPIED ]           20-min away timeout / 2-hr inactivity
                │                                │
         student goes away              [ AWAY ] ──────┘
                │                         ▲   │
                └────────────────────────┘   └──► student returns
```

The sweeper enforces the transitions from `AWAY` → `ABANDONED` and `OCCUPIED` → `ABANDONED` automatically, so the map stays accurate without requiring staff intervention for every forgotten session.
