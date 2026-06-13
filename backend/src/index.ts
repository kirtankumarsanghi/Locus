import express, { Request, Response } from 'express';
import cors from 'cors';
import db, { initDB } from './db';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize DB on start
initDB();

// ─── Types ────────────────────────────────────────────────────────────────────

interface Desk {
  id: number;
  number: number;
  label: string;
  zone: string;
  floor: number;
  status: 'FREE' | 'OCCUPIED' | 'AWAY' | 'ABANDONED';
  current_session_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Session {
  id: number;
  desk_id: number;
  student_id: string;
  status: 'ACTIVE' | 'ENDED';
  start_time: string;
  away_start_time: string | null;
  last_check_in_time: string;
  end_time: string | null;
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// GET /api/desks — Fetch all desks with current status
app.get('/api/desks', (_req: Request, res: Response) => {
  try {
    const desks = db.prepare('SELECT * FROM desks ORDER BY number ASC').all();
    res.json(desks);
  } catch (err) {
    console.error('Error fetching desks:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/desks/:id — Fetch a single desk with its session info
app.get('/api/desks/:id', (req: Request, res: Response) => {
  try {
    const desk = db.prepare('SELECT * FROM desks WHERE id = ?').get(req.params.id) as Desk | undefined;
    if (!desk) {
      res.status(404).json({ error: 'Desk not found' });
      return;
    }

    let session = null;
    if (desk.current_session_id) {
      session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(desk.current_session_id);
    }

    res.json({ desk, session });
  } catch (err) {
    console.error('Error fetching desk:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/check-in — Student checks into a desk
app.post('/api/check-in', (req: Request, res: Response) => {
  const { deskNumber, studentId } = req.body;

  if (!deskNumber || !studentId) {
    res.status(400).json({ error: 'deskNumber and studentId are required' });
    return;
  }

  try {
    const desk = db.prepare('SELECT * FROM desks WHERE number = ? OR label = ? COLLATE NOCASE').get(deskNumber, deskNumber) as Desk | undefined;
    if (!desk) {
      res.status(404).json({ error: 'Desk not found' });
      return;
    }
    if (desk.status !== 'FREE') {
      res.status(400).json({ error: 'Desk is not free' });
      return;
    }

    const insertSession = db.prepare(
      `INSERT INTO sessions (desk_id, student_id, status) VALUES (?, ?, 'ACTIVE')`
    );
    const result = insertSession.run(desk.id, studentId);
    const sessionId = result.lastInsertRowid;

    db.prepare(
      `UPDATE desks SET status = 'OCCUPIED', current_session_id = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(sessionId, desk.id);

    res.json({ success: true, sessionId: Number(sessionId) });
  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/away — Mark student as temporarily away
app.post('/api/away', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND status = ?').get(sessionId, 'ACTIVE') as Session | undefined;
    if (!session) {
      res.status(404).json({ error: 'Active session not found' });
      return;
    }

    db.prepare(
      `UPDATE sessions SET away_start_time = datetime('now') WHERE id = ?`
    ).run(sessionId);

    db.prepare(
      `UPDATE desks SET status = 'AWAY', updated_at = datetime('now') WHERE current_session_id = ?`
    ).run(sessionId);

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking away:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/here — Student returns from being away
app.post('/api/here', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND status = ?').get(sessionId, 'ACTIVE') as Session | undefined;
    if (!session) {
      res.status(404).json({ error: 'Active session not found' });
      return;
    }

    db.prepare(
      `UPDATE sessions SET away_start_time = NULL, last_check_in_time = datetime('now') WHERE id = ?`
    ).run(sessionId);

    db.prepare(
      `UPDATE desks SET status = 'OCCUPIED', updated_at = datetime('now') WHERE current_session_id = ?`
    ).run(sessionId);

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking here:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/reset — Staff resets a desk to FREE (by deskId)
app.post('/api/reset', (req: Request, res: Response) => {
  const { deskId } = req.body;

  if (!deskId) {
    res.status(400).json({ error: 'deskId is required' });
    return;
  }

  try {
    const desk = db.prepare('SELECT * FROM desks WHERE id = ?').get(deskId) as Desk | undefined;
    if (!desk) {
      res.status(404).json({ error: 'Desk not found' });
      return;
    }

    // End any active session on this desk
    if (desk.current_session_id) {
      db.prepare(
        `UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ? AND status = 'ACTIVE'`
      ).run(desk.current_session_id);
    }

    db.prepare(
      `UPDATE desks SET status = 'FREE', current_session_id = NULL, updated_at = datetime('now') WHERE id = ?`
    ).run(deskId);

    res.json({ success: true });
  } catch (err) {
    console.error('Error resetting desk:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/end-session — End session by deskId (used by MapView staff actions)
app.post('/api/end-session', (req: Request, res: Response) => {
  const { deskId } = req.body;

  if (!deskId) {
    res.status(400).json({ error: 'deskId is required' });
    return;
  }

  try {
    const desk = db.prepare('SELECT * FROM desks WHERE id = ?').get(deskId) as Desk | undefined;
    if (!desk) {
      res.status(404).json({ error: 'Desk not found' });
      return;
    }

    if (desk.current_session_id) {
      db.prepare(
        `UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?`
      ).run(desk.current_session_id);
    }

    db.prepare(
      `UPDATE desks SET status = 'FREE', current_session_id = NULL, updated_at = datetime('now') WHERE id = ?`
    ).run(deskId);

    res.json({ success: true });
  } catch (err) {
    console.error('Error ending session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/checkout — Student checks out voluntarily
app.post('/api/checkout', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session | undefined;
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    db.prepare(
      `UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?`
    ).run(sessionId);

    db.prepare(
      `UPDATE desks SET status = 'FREE', current_session_id = NULL, updated_at = datetime('now') WHERE current_session_id = ?`
    ).run(sessionId);

    res.json({ success: true });
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/analytics — Basic analytics data
app.get('/api/analytics', (_req: Request, res: Response) => {
  try {
    const totalDesks = (db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as { cnt: number }).cnt;
    const freeDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'FREE'").get() as { cnt: number }).cnt;
    const occupiedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'OCCUPIED'").get() as { cnt: number }).cnt;
    const awayDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'AWAY'").get() as { cnt: number }).cnt;
    const abandonedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'ABANDONED'").get() as { cnt: number }).cnt;

    const totalSessions = (db.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as { cnt: number }).cnt;
    const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as { cnt: number }).cnt;

    res.json({
      desks: {
        total: totalDesks,
        free: freeDesks,
        occupied: occupiedDesks,
        away: awayDesks,
        abandoned: abandonedDesks,
        occupancyRate: totalDesks > 0 ? Math.round(((occupiedDesks + awayDesks) / totalDesks) * 100) : 0,
      },
      sessions: {
        total: totalSessions,
        active: activeSessions,
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Sweeper: Auto-detect abandoned desks ─────────────────────────────────────

const sweepAbandonedDesks = () => {
  try {
    // Mark sessions as ended if away for more than 20 minutes
    // or if no check-in for more than 2 hours
    const awayThresholdMinutes = 20;
    const inactiveThresholdMinutes = 120;

    // Find sessions that should be ended
    const expiredSessions = db.prepare(`
      SELECT s.id, s.desk_id FROM sessions s
      WHERE s.status = 'ACTIVE'
        AND (
          (s.away_start_time IS NOT NULL
           AND (julianday('now') - julianday(s.away_start_time)) * 1440 > ?)
          OR
          (julianday('now') - julianday(s.last_check_in_time)) * 1440 > ?
        )
    `).all(awayThresholdMinutes, inactiveThresholdMinutes) as Array<{ id: number; desk_id: number }>;

    if (expiredSessions.length > 0) {
      const endSession = db.prepare(
        `UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?`
      );
      const markAbandoned = db.prepare(
        `UPDATE desks SET status = 'ABANDONED', current_session_id = NULL, updated_at = datetime('now') WHERE id = ?`
      );

      const sweep = db.transaction(() => {
        for (const session of expiredSessions) {
          endSession.run(session.id);
          markAbandoned.run(session.desk_id);
        }
      });
      sweep();

      console.log(`Sweeper: marked ${expiredSessions.length} desk(s) as abandoned`);
    }
  } catch (err) {
    console.error('Sweeper error:', err);
  }
};

// Run sweeper every 60 seconds
setInterval(sweepAbandonedDesks, 60_000);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🟢 Locus backend running on http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`     GET  /api/desks          - List all desks`);
  console.log(`     GET  /api/desks/:id      - Get desk details`);
  console.log(`     POST /api/check-in       - Check into a desk`);
  console.log(`     POST /api/away           - Mark as away`);
  console.log(`     POST /api/here           - Return from away`);
  console.log(`     POST /api/reset          - Staff reset desk`);
  console.log(`     POST /api/end-session    - Staff end session`);
  console.log(`     POST /api/checkout       - Student checkout`);
  console.log(`     GET  /api/analytics      - Usage stats`);
  console.log(`     GET  /api/health         - Health check`);
});
