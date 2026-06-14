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
- [Deployment](#deployment)
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

## Deployment

### 🚀 Quick Deploy to Render + Vercel (Recommended)

Deploy your app in under 10 minutes using our simplified deployment stack:

1. **Backend on Render** (Free tier with persistent SQLite)
2. **Frontend on Vercel** (Free tier with global CDN)

📖 **[Start Here: Quick Deployment Guide](./DEPLOYMENT_QUICKSTART.md)**

This guide walks you through:
- Setting up Render backend with persistent database
- Deploying frontend to Vercel
- Configuring environment variables
- Testing your live deployment

### 📚 Additional Deployment Resources

- **[Complete Render Guide](./RENDER_DEPLOYMENT.md)** - Detailed backend deployment with troubleshooting
- **[Complete Vercel Guide](./VERCEL_DEPLOYMENT.md)** - Detailed frontend deployment
- **[Render + Vercel Setup](./RENDER_VERCEL_SETUP.md)** - Architecture, cost breakdown, and best practices

### Alternative Deployments

The application can also be deployed to:
- **Railway** - See historical deployment docs in repository
- **Heroku** - Works with Node.js buildpack
- **AWS/Azure/GCP** - Docker containers or serverless

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

---

## Landing Page HTML Source

<details>
<summary>Click to expand</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Locus — Library Desk Management System</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #070C1A;
    --bg2: #0D1426;
    --card: #111827;
    --card2: #161F35;
    --teal: #00D4AA;
    --teal-dim: rgba(0, 212, 170, 0.12);
    --teal-glow: rgba(0, 212, 170, 0.3);
    --lavender: #8B9EFF;
    --lavender-dim: rgba(139, 158, 255, 0.12);
    --amber: #FFB547;
    --rose: #FF6B8A;
    --text: #E8EEFF;
    --text2: #8A96B4;
    --text3: #4A5470;
    --border: rgba(139, 158, 255, 0.1);
    --border2: rgba(0, 212, 170, 0.15);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* ─── NAV ─── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(7, 12, 26, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }

  .nav-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700; font-size: 1.3rem;
    color: var(--teal);
    letter-spacing: -0.02em;
  }
  .nav-logo span { color: var(--text); }

  .nav-links { display: flex; gap: 2rem; }
  .nav-links a {
    color: var(--text2); text-decoration: none;
    font-size: 0.85rem; font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--teal); }

  .nav-cta {
    background: var(--teal); color: #07111A;
    padding: 0.5rem 1.2rem; border-radius: 8px;
    font-weight: 600; font-size: 0.85rem;
    text-decoration: none; transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.85; }

  /* ─── HERO ─── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 6rem 2rem 4rem;
    position: relative; overflow: hidden;
    text-align: center;
  }

  .hero-grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(139,158,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,158,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
  }

  .hero-glow {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--teal-dim); border: 1px solid var(--border2);
    color: var(--teal); padding: 0.4rem 1rem;
    border-radius: 100px; font-size: 0.8rem; font-weight: 600;
    letter-spacing: 0.05em; text-transform: uppercase;
    margin-bottom: 2rem;
    animation: fadeUp 0.6s ease both;
  }

  .hero-badge::before {
    content: '';
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--teal);
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1.0;
    margin-bottom: 1.5rem;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  h1 .accent { color: var(--teal); }

  .hero-sub {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: var(--text2);
    max-width: 600px;
    margin: 0 auto 2.5rem;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .hero-terminal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    color: var(--teal);
    margin-bottom: 2.5rem;
    min-width: 380px;
    text-align: left;
    animation: fadeUp 0.6s 0.3s ease both;
    position: relative;
  }

  .hero-terminal::before {
    content: '● ● ●';
    color: var(--text3); font-size: 0.7rem;
    letter-spacing: 0.2em;
    display: block; margin-bottom: 0.5rem;
  }

  #typed-text { color: var(--text); }
  #typed-text .cmd { color: var(--teal); }
  .cursor {
    display: inline-block; width: 2px; height: 1em;
    background: var(--teal); vertical-align: middle;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  .hero-ctas {
    display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
    animation: fadeUp 0.6s 0.4s ease both;
  }

  .btn-primary {
    background: var(--teal); color: #07111A;
    padding: 0.75rem 1.75rem; border-radius: 10px;
    font-weight: 700; font-size: 0.95rem;
    text-decoration: none; display: flex; align-items: center; gap: 0.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 30px rgba(0,212,170,0.2);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(0,212,170,0.4); }

  .btn-secondary {
    background: transparent; color: var(--text);
    padding: 0.75rem 1.75rem; border-radius: 10px;
    border: 1px solid var(--border);
    font-weight: 600; font-size: 0.95rem;
    text-decoration: none; display: flex; align-items: center; gap: 0.5rem;
    transition: border-color 0.2s, background 0.2s;
  }
  .btn-secondary:hover { border-color: var(--teal); background: var(--teal-dim); }

  /* ─── DESK ANIMATION ─── */
  .desk-demo {
    margin-top: 5rem;
    padding: 0 2rem;
    animation: fadeUp 0.6s 0.5s ease both;
  }

  .desk-demo-label {
    text-align: center;
    color: var(--text3); font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
  }

  .desk-grid-container {
    max-width: 760px; margin: 0 auto;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .desk-grid-container::before {
    content: 'LIVE DESK MAP';
    position: absolute; top: 1rem; left: 1.5rem;
    color: var(--teal); font-size: 0.65rem; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.15em;
  }

  .desk-grid-container::after {
    content: '';
    position: absolute; top: 1rem; right: 1.5rem;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--teal);
    box-shadow: 0 0 8px var(--teal);
    animation: pulse 2s infinite;
  }

  .desk-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 6px;
    margin-top: 1.5rem;
  }

  .desk-cell {
    aspect-ratio: 1;
    border-radius: 5px;
    transition: background 0.6s, box-shadow 0.6s;
  }

  .desk-cell.free { background: rgba(0, 212, 170, 0.2); }
  .desk-cell.occupied { background: rgba(255, 107, 138, 0.5); }
  .desk-cell.away { background: rgba(255, 181, 71, 0.4); }
  .desk-cell.abandoned {
    background: rgba(139, 158, 255, 0.3);
    animation: abandonPulse 2s ease infinite;
  }

  @keyframes abandonPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .desk-legend {
    display: flex; gap: 1.5rem; margin-top: 1rem;
    justify-content: center; flex-wrap: wrap;
  }

  .legend-item {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.72rem; color: var(--text2);
    font-family: 'JetBrains Mono', monospace;
  }

  .legend-dot {
    width: 10px; height: 10px; border-radius: 3px;
  }
  .legend-dot.free { background: rgba(0, 212, 170, 0.5); }
  .legend-dot.occupied { background: rgba(255, 107, 138, 0.6); }
  .legend-dot.away { background: rgba(255, 181, 71, 0.5); }
  .legend-dot.abandoned { background: rgba(139, 158, 255, 0.5); }

  /* ─── STATS ─── */
  .stats-strip {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 3rem 2rem;
    display: flex; justify-content: center;
    gap: 0;
  }

  .stat-item {
    flex: 1; max-width: 200px;
    text-align: center;
    padding: 0 2rem;
    border-right: 1px solid var(--border);
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.5s, transform 0.5s;
  }
  .stat-item:last-child { border-right: none; }
  .stat-item.visible { opacity: 1; transform: translateY(0); }

  .stat-number {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.5rem; font-weight: 700;
    color: var(--teal);
    line-height: 1;
    margin-bottom: 0.4rem;
  }

  .stat-label {
    color: var(--text2); font-size: 0.8rem;
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  /* ─── SECTIONS ─── */
  section { padding: 6rem 2rem; max-width: 1100px; margin: 0 auto; }

  .section-eyebrow {
    color: var(--teal); font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.12em;
    font-weight: 600; margin-bottom: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
  }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 700; letter-spacing: -0.03em;
    margin-bottom: 1rem;
    line-height: 1.1;
  }

  .section-intro {
    color: var(--text2);
    font-size: 1.05rem;
    max-width: 580px;
    margin-bottom: 3rem;
  }

  /* ─── ROLE CARDS ─── */
  .role-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .role-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    transition: border-color 0.3s, transform 0.3s;
    opacity: 0; transform: translateY(24px);
    transition: opacity 0.5s, transform 0.5s, border-color 0.3s;
  }
  .role-card.visible { opacity: 1; transform: translateY(0); }
  .role-card:hover { border-color: var(--border2); transform: translateY(-4px); }

  .role-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin-bottom: 1.25rem;
  }

  .role-icon.student { background: rgba(0, 212, 170, 0.1); }
  .role-icon.staff { background: rgba(139, 158, 255, 0.1); }
  .role-icon.admin { background: rgba(255, 181, 71, 0.1); }

  .role-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.15rem; font-weight: 700;
    margin-bottom: 0.3rem;
  }

  .role-count {
    font-size: 0.78rem; color: var(--text2);
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 1.25rem;
  }

  .role-features { list-style: none; }
  .role-features li {
    display: flex; align-items: flex-start; gap: 0.6rem;
    font-size: 0.875rem; color: var(--text2);
    padding: 0.35rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .role-features li:last-child { border: none; }
  .role-features li::before {
    content: '✓'; color: var(--teal);
    font-size: 0.75rem; margin-top: 0.1rem;
    flex-shrink: 0;
  }

  /* ─── FEATURE BLOCKS ─── */
  .features-masonry {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  .feature-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    transition: border-color 0.3s, background 0.3s;
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.4s, transform 0.4s, border-color 0.3s;
  }
  .feature-card.visible { opacity: 1; transform: translateY(0); }
  .feature-card:hover { border-color: var(--border2); background: var(--card2); }

  .feature-card-icon {
    font-size: 1.5rem; margin-bottom: 0.75rem;
  }

  .feature-card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem; font-weight: 600;
    margin-bottom: 0.4rem;
  }

  .feature-card-desc {
    font-size: 0.82rem; color: var(--text2); line-height: 1.5;
  }

  /* ─── ACHIEVEMENTS ─── */
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .achievement {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    transition: transform 0.3s, border-color 0.3s;
    opacity: 0; transform: scale(0.9);
    transition: opacity 0.4s, transform 0.4s, border-color 0.3s;
  }
  .achievement.visible { opacity: 1; transform: scale(1); }
  .achievement:hover { transform: scale(1.03); border-color: var(--border2); }

  .achievement-icon { font-size: 2rem; margin-bottom: 0.5rem; }
  .achievement-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.875rem; font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .achievement-desc {
    font-size: 0.72rem; color: var(--text2);
  }

  .achievement.gold { border-color: rgba(255, 181, 71, 0.3); }
  .achievement.gold .achievement-name { color: var(--amber); }
  .achievement.silver { border-color: rgba(139, 158, 255, 0.3); }
  .achievement.silver .achievement-name { color: var(--lavender); }

  /* ─── TECH STACK ─── */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
  }

  .tech-pill {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    text-align: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: var(--text2);
    transition: border-color 0.3s, color 0.3s;
    opacity: 0;
    transition: opacity 0.4s, border-color 0.3s, color 0.3s;
  }
  .tech-pill.visible { opacity: 1; }
  .tech-pill:hover { border-color: var(--teal); color: var(--teal); }

  .tech-pill-icon { font-size: 1.25rem; display: block; margin-bottom: 0.4rem; }

  /* ─── REALTIME EVENTS ─── */
  .events-feed {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    max-height: 320px;
    overflow: hidden;
    position: relative;
  }

  .events-feed::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 80px;
    background: linear-gradient(transparent, var(--card));
    pointer-events: none;
  }

  .event-line {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    opacity: 0;
    animation: slideIn 0.4s ease forwards;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .event-time { color: var(--text3); min-width: 50px; }
  .event-type { color: var(--teal); min-width: 140px; }
  .event-msg { color: var(--text2); }

  /* ─── EXPORT FORMATS ─── */
  .export-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    max-width: 600px;
  }

  .export-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    transition: border-color 0.3s;
  }
  .export-card:hover { border-color: var(--border2); }
  .export-card .ext {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.1rem; font-weight: 700;
    margin-bottom: 0.3rem;
  }
  .export-card .ext-label { font-size: 0.72rem; color: var(--text2); }
  .export-card.csv .ext { color: var(--teal); }
  .export-card.xls .ext { color: #4CAF82; }
  .export-card.json .ext { color: var(--amber); }
  .export-card.pdf .ext { color: var(--rose); }

  /* ─── INSTALL ─── */
  .install-block {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .install-tabs {
    display: flex; border-bottom: 1px solid var(--border);
  }

  .install-tab {
    padding: 0.75rem 1.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem; color: var(--text2);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    background: none; border-top: none; border-left: none; border-right: none;
  }
  .install-tab.active { color: var(--teal); border-bottom-color: var(--teal); }

  .install-content { padding: 1.5rem; }
  .install-pane { display: none; }
  .install-pane.active { display: block; }

  .code-block {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    line-height: 1.8;
    color: var(--text2);
  }

  .code-block .comment { color: var(--text3); }
  .code-block .cmd-prefix { color: var(--teal); }
  .code-block .str { color: var(--amber); }
  .code-block .key { color: var(--lavender); }

  /* ─── DIVIDER ─── */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border2) 30%, var(--border2) 70%, transparent);
    margin: 0 2rem;
  }

  /* ─── FOOTER ─── */
  footer {
    border-top: 1px solid var(--border);
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text3);
    font-size: 0.82rem;
  }

  footer a { color: var(--teal); text-decoration: none; }
  footer a:hover { text-decoration: underline; }

  .footer-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem; font-weight: 700;
    color: var(--teal); margin-bottom: 0.75rem;
  }

  /* ─── ANIMATIONS ─── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .nav-links { display: none; }
    .hero-terminal { min-width: unset; width: 100%; }
    .stats-strip { flex-wrap: wrap; }
    .stat-item { min-width: 45%; border-right: none; padding: 1rem; }
    .export-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* ─── NOTIFICATION DEMO ─── */
  .notif-stack {
    display: flex; flex-direction: column; gap: 0.75rem;
    max-width: 480px;
  }

  .notif-item {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.875rem 1rem;
    display: flex; align-items: flex-start; gap: 0.75rem;
    opacity: 0;
  }

  .notif-item.visible { animation: slideIn 0.4s ease forwards; }

  .notif-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; flex-shrink: 0;
  }

  .notif-icon.started { background: rgba(0,212,170,0.1); }
  .notif-icon.away { background: rgba(255,181,71,0.1); }
  .notif-icon.booking { background: rgba(139,158,255,0.1); }
  .notif-icon.alert { background: rgba(255,107,138,0.1); }

  .notif-title {
    font-size: 0.83rem; font-weight: 600;
    margin-bottom: 0.2rem;
  }
  .notif-body { font-size: 0.77rem; color: var(--text2); }

  .notif-priority {
    margin-left: auto; padding: 0.2rem 0.5rem;
    border-radius: 100px; font-size: 0.65rem; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    flex-shrink: 0;
  }

  .notif-priority.high { background: rgba(255,107,138,0.1); color: var(--rose); }
  .notif-priority.normal { background: rgba(0,212,170,0.1); color: var(--teal); }
  .notif-priority.urgent { background: rgba(255,107,138,0.2); color: var(--rose); }
  .notif-priority.low { background: rgba(139,158,255,0.1); color: var(--lavender); }

  /* section max-width wrapper for full-bleed bg */
  .full-width-section {
    padding: 6rem 2rem;
    background: var(--bg2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .full-width-section .inner { max-width: 1100px; margin: 0 auto; }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-logo">Locus<span>.</span></div>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#roles">Roles</a>
    <a href="#realtime">Real-Time</a>
    <a href="#tech">Tech Stack</a>
    <a href="#install">Install</a>
  </div>
  <a href="https://github.com/kirtankumarsanghi/Locus" class="nav-cta" target="_blank">View on GitHub →</a>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-grid-bg"></div>
  <div class="hero-glow"></div>

  <div class="hero-badge">Library Desk Management System</div>

  <h1>
    Know every<br><span class="accent">desk.</span><br>in real time.
  </h1>

  <p class="hero-sub">
    Locus gives libraries a live command center — check-ins, desk states, analytics, and AI-powered recommendations, all synced in under 100ms.
  </p>

  <div class="hero-terminal">
    <div id="typed-text"></div><span class="cursor"></span>
  </div>

  <div class="hero-ctas">
    <a href="https://github.com/kirtankumarsanghi/Locus" class="btn-primary" target="_blank">
      ⭐ Star on GitHub
    </a>
    <a href="#install" class="btn-secondary">
      📦 Quick Install
    </a>
  </div>

  <!-- Live Desk Demo -->
  <div class="desk-demo" style="width:100%;max-width:760px;">
    <div class="desk-demo-label">↓ live desk availability simulation</div>
    <div class="desk-grid-container">
      <div class="desk-grid" id="deskGrid"></div>
      <div class="desk-legend">
        <div class="legend-item"><div class="legend-dot free"></div> Available</div>
        <div class="legend-item"><div class="legend-dot occupied"></div> Occupied</div>
        <div class="legend-item"><div class="legend-dot away"></div> Away (20m)</div>
        <div class="legend-item"><div class="legend-dot abandoned"></div> Abandoned</div>
      </div>
    </div>
  </div>
</div>

<!-- STATS -->
<div class="stats-strip" id="statsStrip">
  <div class="stat-item"><div class="stat-number" data-count="170">0</div><div class="stat-label">Total Features</div></div>
  <div class="stat-item"><div class="stat-number" data-count="3">0</div><div class="stat-label">User Roles</div></div>
  <div class="stat-item"><div class="stat-number" data-count="60">0</div><div class="stat-label">API Endpoints</div></div>
  <div class="stat-item"><div class="stat-number" data-count="13">0</div><div class="stat-label">Live Events</div></div>
  <div class="stat-item"><div class="stat-number" data-suffix="ms" data-count="100">0</div><div class="stat-label">Sync Latency</div></div>
</div>

<!-- ROLES -->
<section id="roles">
  <div class="section-eyebrow">// Three roles, one system</div>
  <h2>Built for everyone<br>in the library.</h2>
  <p class="section-intro">Students, staff, and administrators each get a purpose-built dashboard — not a one-size-fits-all view.</p>

  <div class="role-grid">
    <div class="role-card">
      <div class="role-icon student">🎓</div>
      <div class="role-title">Student</div>
      <div class="role-count">40+ features</div>
      <ul class="role-features">
        <li>3 check-in methods: QR, quick-select, manual</li>
        <li>Live session timer with "Go Away" mode</li>
        <li>AI-powered seat recommendations</li>
        <li>Study streak & weekly goal tracking</li>
        <li>Achievement badges & gamification</li>
        <li>Personal analytics + CSV/Excel export</li>
        <li>Room booking with approval tracking</li>
      </ul>
    </div>
    <div class="role-card">
      <div class="role-icon staff">🛡️</div>
      <div class="role-title">Staff</div>
      <div class="role-count">25+ features</div>
      <ul class="role-features">
        <li>Real-time 2D interactive desk map</li>
        <li>Color-coded desk states with animations</li>
        <li>Reset, end, or flag any desk instantly</li>
        <li>Abandoned-desk alerts & quick review</li>
        <li>Tabular desk list with bulk actions</li>
        <li>Occupancy analytics & peak-hour charts</li>
        <li>Room management & booking status</li>
      </ul>
    </div>
    <div class="role-card">
      <div class="role-icon admin">⚡</div>
      <div class="role-title">Admin</div>
      <div class="role-count">50+ features</div>
      <ul class="role-features">
        <li>Full CRUD for users, desks, rooms</li>
        <li>Promote/demote staff roles on the fly</li>
        <li>System-wide activity logs</li>
        <li>Peak usage heatmap (hour × day matrix)</li>
        <li>Multi-sheet Excel, CSV, JSON, PDF export</li>
        <li>Notification broadcasting</li>
        <li>Library settings (hours, timeouts, name)</li>
      </ul>
    </div>
  </div>
</section>

<div class="divider"></div>

<!-- SMART FEATURES -->
<section id="features">
  <div class="section-eyebrow">// What makes it special</div>
  <h2>Beyond basic<br>desk booking.</h2>
  <p class="section-intro">Locus layers intelligence and gamification on top of solid real-time infrastructure.</p>

  <div class="features-masonry">
    <div class="feature-card">
      <div class="feature-card-icon">🧠</div>
      <div class="feature-card-title">Smart Seat Recommendations</div>
      <div class="feature-card-desc">ML-style scoring ranks desks by your past usage, preferred zone, noise level, and live availability — before you even search.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon">🏆</div>
      <div class="feature-card-title">Achievement System</div>
      <div class="feature-card-desc">Six badges with rarity levels reward consistent study habits. Early Bird, Night Owl, Century Club — students actually care about their stats.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon">🔥</div>
      <div class="feature-card-title">Study Streak Tracking</div>
      <div class="feature-card-desc">Daily streaks, 5-day weekly goals, and 20-day monthly targets surface inside the student Smart Dashboard with visual progress rings.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon">🗺️</div>
      <div class="feature-card-title">Study Heatmap</div>
      <div class="feature-card-desc">Hour-by-day matrix shows when and where each student studies most. Staff get a library-wide version for capacity planning.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon">🔄</div>
      <div class="feature-card-title">Session State Machine</div>
      <div class="feature-card-desc">OCCUPIED → AWAY → ABANDONED flow with configurable timeouts. Auto-release frees desks without staff intervention.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon">📤</div>
      <div class="feature-card-title">Multi-Format Export</div>
      <div class="feature-card-desc">Students export personal CSV. Admins get multi-sheet Excel workbooks, raw JSON dumps, and PDF reports — all in one click.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon">📱</div>
      <div class="feature-card-title">PWA Ready</div>
      <div class="feature-card-desc">Installable as a native app on iOS and Android. Bottom navigation on mobile, sidebar on desktop — layouts optimized per breakpoint.</div>
    </div>
    <div class="feature-card">
      <div class="feature-card-icon">⚡</div>
      <div class="feature-card-title">Connection Resilience</div>
      <div class="feature-card-desc">Auto-reconnect with exponential backoff, polling fallback, and live connection indicator mean zero blind spots even on flaky Wi-Fi.</div>
    </div>
  </div>
</section>

<!-- ACHIEVEMENTS -->
<div class="full-width-section">
  <div class="inner">
    <div class="section-eyebrow">// Gamification layer</div>
    <h2 style="margin-bottom:0.5rem;">Study harder.<br>Earn badges.</h2>
    <p class="section-intro">Six achievements with rarity tiers keep students engaged with their library time.</p>

    <div class="achievements-grid" id="achievementsGrid">
      <div class="achievement gold">
        <div class="achievement-icon">🌅</div>
        <div class="achievement-name">Early Bird</div>
        <div class="achievement-desc">Check in before 8 AM, five times</div>
      </div>
      <div class="achievement silver">
        <div class="achievement-icon">📅</div>
        <div class="achievement-name">Consistent Learner</div>
        <div class="achievement-desc">7-day study streak</div>
      </div>
      <div class="achievement gold">
        <div class="achievement-icon">⏱️</div>
        <div class="achievement-name">Marathon Session</div>
        <div class="achievement-desc">Study 4+ hours in one sitting</div>
      </div>
      <div class="achievement silver">
        <div class="achievement-icon">🗝️</div>
        <div class="achievement-name">Room Master</div>
        <div class="achievement-desc">Study in every room</div>
      </div>
      <div class="achievement silver">
        <div class="achievement-icon">🦉</div>
        <div class="achievement-name">Night Owl</div>
        <div class="achievement-desc">Study after 8 PM, five times</div>
      </div>
      <div class="achievement gold">
        <div class="achievement-icon">💯</div>
        <div class="achievement-name">Century Club</div>
        <div class="achievement-desc">Complete 100 study sessions</div>
      </div>
    </div>
  </div>
</div>

<!-- REAL-TIME -->
<section id="realtime">
  <div class="section-eyebrow">// Socket.IO powered</div>
  <h2>13 live events.<br>Sub-100ms sync.</h2>
  <p class="section-intro">Every state change — check-in, away, checkout, desk reset — broadcasts instantly to every connected client.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start;" class="realtime-layout">
    <div class="events-feed" id="eventsFeed">
      <!-- events injected by JS -->
    </div>
    <div class="notif-stack" id="notifStack">
      <div class="notif-item">
        <div class="notif-icon started">✅</div>
        <div>
          <div class="notif-title">Session Started</div>
          <div class="notif-body">Desk B-14 checked in by Kirtan S.</div>
        </div>
        <div class="notif-priority normal">NORMAL</div>
      </div>
      <div class="notif-item">
        <div class="notif-icon away">⏳</div>
        <div>
          <div class="notif-title">Away Warning</div>
          <div class="notif-body">Desk A-07 has been away for 18 minutes.</div>
        </div>
        <div class="notif-priority high">HIGH</div>
      </div>
      <div class="notif-item">
        <div class="notif-icon booking">📅</div>
        <div>
          <div class="notif-title">Booking Reminder</div>
          <div class="notif-body">Room 3B starts in 15 minutes.</div>
        </div>
        <div class="notif-priority low">LOW</div>
      </div>
      <div class="notif-item">
        <div class="notif-icon alert">🚨</div>
        <div>
          <div class="notif-title">Abandoned Desk</div>
          <div class="notif-body">Desk C-02 flagged for 45 min inactivity.</div>
        </div>
        <div class="notif-priority urgent">URGENT</div>
      </div>
    </div>
  </div>
</section>

<style>
@media (max-width: 640px) {
  .realtime-layout { grid-template-columns: 1fr !important; }
}
</style>

<div class="divider"></div>

<!-- TECH STACK -->
<section id="tech">
  <div class="section-eyebrow">// Under the hood</div>
  <h2>Modern stack.<br>Zero compromise.</h2>
  <p class="section-intro">TypeScript end-to-end, real-time with Socket.IO, and a lean SQLite database that punches well above its weight.</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;margin-bottom:2rem;" class="stack-layout">
    <div>
      <div style="color:var(--teal);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;font-family:'JetBrains Mono',monospace;">Frontend</div>
      <div class="tech-grid" id="techFrontend">
        <div class="tech-pill"><span class="tech-pill-icon">⚛️</span>React 18</div>
        <div class="tech-pill"><span class="tech-pill-icon">🔷</span>TypeScript</div>
        <div class="tech-pill"><span class="tech-pill-icon">🎨</span>TailwindCSS</div>
        <div class="tech-pill"><span class="tech-pill-icon">📊</span>Recharts</div>
        <div class="tech-pill"><span class="tech-pill-icon">⚡</span>Vite</div>
        <div class="tech-pill"><span class="tech-pill-icon">🔌</span>Socket.IO</div>
      </div>
    </div>
    <div>
      <div style="color:var(--lavender);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;font-family:'JetBrains Mono',monospace;">Backend</div>
      <div class="tech-grid" id="techBackend">
        <div class="tech-pill"><span class="tech-pill-icon">🟩</span>Node.js</div>
        <div class="tech-pill"><span class="tech-pill-icon">🚂</span>Express</div>
        <div class="tech-pill"><span class="tech-pill-icon">🔷</span>TypeScript</div>
        <div class="tech-pill"><span class="tech-pill-icon">🗄️</span>SQLite3</div>
        <div class="tech-pill"><span class="tech-pill-icon">📡</span>Socket.IO</div>
        <div class="tech-pill"><span class="tech-pill-icon">📑</span>ExcelJS</div>
      </div>
    </div>
  </div>

  <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:1.5rem;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center;" class="db-stats-grid">
    <div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:700;color:var(--teal);">8</div>
      <div style="font-size:0.75rem;color:var(--text2);">Core Tables</div>
    </div>
    <div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:700;color:var(--lavender);">WAL</div>
      <div style="font-size:0.75rem;color:var(--text2);">Journal Mode</div>
    </div>
    <div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:700;color:var(--amber);">FK</div>
      <div style="font-size:0.75rem;color:var(--text2);">Foreign Keys</div>
    </div>
    <div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:700;color:var(--rose);">IDX</div>
      <div style="font-size:0.75rem;color:var(--text2);">Indexed Columns</div>
    </div>
  </div>
</section>

<style>
@media (max-width: 640px) {
  .stack-layout { grid-template-columns: 1fr !important; }
  .db-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
}
</style>

<!-- INSTALL -->
<div class="full-width-section" id="install">
  <div class="inner">
    <div class="section-eyebrow">// Get started in 5 minutes</div>
    <h2 style="margin-bottom:0.5rem;">Install Locus.</h2>
    <p class="section-intro" style="margin-bottom:2rem;">Clone, configure, and run. Backend and frontend start independently.</p>

    <div class="install-block" style="max-width:700px;">
      <div class="install-tabs">
        <button class="install-tab active" onclick="switchTab('backend')">Backend</button>
        <button class="install-tab" onclick="switchTab('frontend')">Frontend</button>
        <button class="install-tab" onclick="switchTab('env')">Environment</button>
      </div>
      <div class="install-content">
        <div class="install-pane active" id="pane-backend">
          <div class="code-block">
            <div><span class="comment"># Clone the repository</span></div>
            <div><span class="cmd-prefix">$</span> git clone https://github.com/kirtankumarsanghi/Locus.git</div>
            <div><span class="cmd-prefix">$</span> cd Locus/backend</div>
            <br>
            <div><span class="comment"># Install dependencies</span></div>
            <div><span class="cmd-prefix">$</span> npm install</div>
            <br>
            <div><span class="comment"># Run database migrations</span></div>
            <div><span class="cmd-prefix">$</span> npm run migrate</div>
            <br>
            <div><span class="comment"># Start the dev server</span></div>
            <div><span class="cmd-prefix">$</span> npm run dev</div>
            <br>
            <div style="color:var(--teal);">✓ Server running on http://localhost:3001</div>
          </div>
        </div>
        <div class="install-pane" id="pane-frontend">
          <div class="code-block">
            <div><span class="comment"># Navigate to frontend</span></div>
            <div><span class="cmd-prefix">$</span> cd ../frontend</div>
            <br>
            <div><span class="comment"># Install dependencies</span></div>
            <div><span class="cmd-prefix">$</span> npm install</div>
            <br>
            <div><span class="comment"># Start Vite dev server</span></div>
            <div><span class="cmd-prefix">$</span> npm run dev</div>
            <br>
            <div style="color:var(--teal);">✓ App running on http://localhost:5173</div>
          </div>
        </div>
        <div class="install-pane" id="pane-env">
          <div class="code-block">
            <div><span class="comment"># backend/.env</span></div>
            <div><span class="key">PORT</span>=<span class="str">3001</span></div>
            <div><span class="key">JWT_SECRET</span>=<span class="str">your_secret_here</span></div>
            <div><span class="key">DB_PATH</span>=<span class="str">./locus.db</span></div>
            <div><span class="key">SESSION_TIMEOUT</span>=<span class="str">7200</span></div>
            <div><span class="key">AWAY_TIMEOUT</span>=<span class="str">1200</span></div>
            <br>
            <div><span class="comment"># frontend/.env</span></div>
            <div><span class="key">VITE_API_URL</span>=<span class="str">http://localhost:3001</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- EXPORT -->
<section>
  <div class="section-eyebrow">// Data portability</div>
  <h2>Your data,<br>your format.</h2>
  <p class="section-intro" style="margin-bottom:2rem;">Export sessions, utilization reports, and analytics in four formats — from a single button.</p>

  <div class="export-grid">
    <div class="export-card csv">
      <div class="ext">.CSV</div>
      <div class="ext-label">Sessions & desks</div>
    </div>
    <div class="export-card xls">
      <div class="ext">.XLSX</div>
      <div class="ext-label">Multi-sheet workbook</div>
    </div>
    <div class="export-card json">
      <div class="ext">.JSON</div>
      <div class="ext-label">Raw data dump</div>
    </div>
    <div class="export-card pdf">
      <div class="ext">.PDF</div>
      <div class="ext-label">Printable reports</div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">Locus.</div>
  <p style="margin-bottom:0.5rem;">Built by <a href="https://github.com/kirtankumarsanghi" target="_blank">Kirtan Kumar Sanghi</a></p>
  <p>170+ features · 3 user roles · Real-time sync · AI-powered insights</p>
  <p style="margin-top:1.5rem;">
    <a href="https://github.com/kirtankumarsanghi/Locus" target="_blank">GitHub</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/kirtankumarsanghi/Locus/issues" target="_blank">Issues</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/kirtankumarsanghi/Locus/blob/main/LICENSE" target="_blank">License</a>
  </p>
</footer>

<script>
// ─── TYPEWRITER ───
const lines = [
  { prefix: '$ ', text: 'git clone github.com/kirtankumarsanghi/Locus' },
  { prefix: '✓ ', text: 'Locus v1.0 ready — 170 features loaded.' },
  { prefix: '⚡ ', text: 'Socket.IO connected — syncing in real time.' },
];
let lineIdx = 0, charIdx = 0;
const el = document.getElementById('typed-text');

function typeNext() {
  const line = lines[lineIdx];
  if (charIdx === 0) {
    el.innerHTML += `<div><span class="cmd">${line.prefix}</span><span id="cur-line"></span></div>`;
  }
  const curLine = el.querySelectorAll('div');
  const target = curLine[curLine.length - 1].querySelector('span:last-child');
  if (charIdx < line.text.length) {
    target.textContent += line.text[charIdx];
    charIdx++;
    setTimeout(typeNext, 35);
  } else {
    charIdx = 0;
    lineIdx++;
    if (lineIdx < lines.length) setTimeout(typeNext, 800);
  }
}
setTimeout(typeNext, 600);

// ─── DESK GRID ───
const grid = document.getElementById('deskGrid');
const states = ['free', 'free', 'free', 'occupied', 'occupied', 'away', 'abandoned'];
const cells = [];
for (let i = 0; i < 50; i++) {
  const cell = document.createElement('div');
  cell.className = 'desk-cell ' + states[Math.floor(Math.random() * states.length)];
  grid.appendChild(cell);
  cells.push(cell);
}
setInterval(() => {
  const idx = Math.floor(Math.random() * cells.length);
  cells[idx].className = 'desk-cell ' + states[Math.floor(Math.random() * states.length)];
}, 600);

// ─── STATS COUNTER ───
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.stat-item');
      items.forEach((item, i) => {
        setTimeout(() => {
          item.classList.add('visible');
          const numEl = item.querySelector('.stat-number');
          const target = parseInt(numEl.dataset.count);
          const suffix = numEl.dataset.suffix || '+';
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            numEl.textContent = (current < target ? current : target) + suffix;
            if (current >= target) clearInterval(timer);
          }, 30);
        }, i * 120);
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
statsObserver.observe(document.getElementById('statsStrip'));

// ─── SCROLL REVEAL ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.role-card, .feature-card, .achievement, .tech-pill').forEach((el, i) => {
  el.dataset.delay = (i % 4) * 80;
  revealObserver.observe(el);
});

// ─── LIVE EVENTS FEED ───
const events = [
  { time: '10:42:01', type: 'desk:updated', msg: 'B-14 → OCCUPIED' },
  { time: '10:42:03', type: 'session:checkin', msg: 'Student ID 21BCS042' },
  { time: '10:42:15', type: 'analytics:updated', msg: 'Occupancy now 73%' },
  { time: '10:43:00', type: 'notification:new', msg: 'Away warning for A-07' },
  { time: '10:43:22', type: 'session:away', msg: 'A-07 → AWAY' },
  { time: '10:44:10', type: 'desk:updated', msg: 'C-02 → ABANDONED' },
  { time: '10:44:11', type: 'notification:count', msg: 'Unread count: 3' },
  { time: '10:45:00', type: 'session:back', msg: 'A-07 → OCCUPIED' },
  { time: '10:45:30', type: 'desk:reset', msg: 'C-02 reset by staff' },
  { time: '10:46:02', type: 'session:checkout', msg: 'B-14 session ended' },
];

const feed = document.getElementById('eventsFeed');
let evIdx = 0;
const feedObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    addEvent();
    feedObserver.disconnect();
  }
}, { threshold: 0.3 });
feedObserver.observe(feed);

function addEvent() {
  if (evIdx >= events.length) { evIdx = 0; feed.innerHTML = ''; }
  const ev = events[evIdx++];
  const div = document.createElement('div');
  div.className = 'event-line';
  div.style.animationDelay = '0s';
  div.innerHTML = `<span class="event-time">${ev.time}</span><span class="event-type">${ev.type}</span><span class="event-msg">${ev.msg}</span>`;
  feed.appendChild(div);
  setTimeout(addEvent, 900);
}

// ─── NOTIFICATION REVEAL ───
const notifObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('.notif-item').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 250);
    });
    notifObserver.disconnect();
  }
}, { threshold: 0.3 });
notifObserver.observe(document.getElementById('notifStack'));

// ─── TAB SWITCHER ───
function switchTab(name) {
  document.querySelectorAll('.install-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.install-pane').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('pane-' + name).classList.add('active');
}
</script>

</body>
</html>
```
</details>

