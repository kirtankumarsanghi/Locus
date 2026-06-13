import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ NOTE: SQLite database won't work on Vercel serverless functions
// You'll need to use a cloud database like:
// - Vercel Postgres
// - PlanetScale (MySQL)
// - Supabase (PostgreSQL)
// - MongoDB Atlas

// For now, using in-memory storage (will reset on each cold start)
let desks: any[] = [];
let sessions: any[] = [];

// Initialize some mock data
if (desks.length === 0) {
  for (let i = 1; i <= 50; i++) {
    desks.push({
      id: i,
      number: i,
      label: `Desk ${i}`,
      zone: i <= 15 ? 'Zone A' : i <= 30 ? 'Zone B' : 'Zone C',
      floor: Math.ceil(i / 25),
      status: 'FREE',
      current_session_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

// GET /api/desks
app.get('/api/desks', (_req: Request, res: Response) => {
  res.json(desks);
});

// GET /api/desks/:id
app.get('/api/desks/:id', (req: Request, res: Response) => {
  const desk = desks.find(d => d.id === parseInt(req.params.id));
  if (!desk) {
    res.status(404).json({ error: 'Desk not found' });
    return;
  }

  let session = null;
  if (desk.current_session_id) {
    session = sessions.find(s => s.id === desk.current_session_id);
  }

  res.json({ desk, session });
});

// POST /api/check-in
app.post('/api/check-in', (req: Request, res: Response) => {
  const { deskNumber, studentId } = req.body;

  if (!deskNumber || !studentId) {
    res.status(400).json({ error: 'deskNumber and studentId are required' });
    return;
  }

  const desk = desks.find(d => d.number === deskNumber);
  if (!desk) {
    res.status(404).json({ error: 'Desk not found' });
    return;
  }
  if (desk.status !== 'FREE') {
    res.status(400).json({ error: 'Desk is not free' });
    return;
  }

  const sessionId = sessions.length + 1;
  const newSession = {
    id: sessionId,
    desk_id: desk.id,
    student_id: studentId,
    status: 'ACTIVE',
    start_time: new Date().toISOString(),
    away_start_time: null,
    last_check_in_time: new Date().toISOString(),
    end_time: null,
  };
  sessions.push(newSession);

  desk.status = 'OCCUPIED';
  desk.current_session_id = sessionId;
  desk.updated_at = new Date().toISOString();

  res.json({ success: true, sessionId });
});

// POST /api/away
app.post('/api/away', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  const session = sessions.find(s => s.id === sessionId && s.status === 'ACTIVE');
  if (!session) {
    res.status(404).json({ error: 'Active session not found' });
    return;
  }

  session.away_start_time = new Date().toISOString();

  const desk = desks.find(d => d.current_session_id === sessionId);
  if (desk) {
    desk.status = 'AWAY';
    desk.updated_at = new Date().toISOString();
  }

  res.json({ success: true });
});

// POST /api/here
app.post('/api/here', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  const session = sessions.find(s => s.id === sessionId && s.status === 'ACTIVE');
  if (!session) {
    res.status(404).json({ error: 'Active session not found' });
    return;
  }

  session.away_start_time = null;
  session.last_check_in_time = new Date().toISOString();

  const desk = desks.find(d => d.current_session_id === sessionId);
  if (desk) {
    desk.status = 'OCCUPIED';
    desk.updated_at = new Date().toISOString();
  }

  res.json({ success: true });
});

// POST /api/reset
app.post('/api/reset', (req: Request, res: Response) => {
  const { deskId } = req.body;

  if (!deskId) {
    res.status(400).json({ error: 'deskId is required' });
    return;
  }

  const desk = desks.find(d => d.id === deskId);
  if (!desk) {
    res.status(404).json({ error: 'Desk not found' });
    return;
  }

  if (desk.current_session_id) {
    const session = sessions.find(s => s.id === desk.current_session_id);
    if (session && session.status === 'ACTIVE') {
      session.status = 'ENDED';
      session.end_time = new Date().toISOString();
    }
  }

  desk.status = 'FREE';
  desk.current_session_id = null;
  desk.updated_at = new Date().toISOString();

  res.json({ success: true });
});

// POST /api/end-session
app.post('/api/end-session', (req: Request, res: Response) => {
  const { deskId } = req.body;

  if (!deskId) {
    res.status(400).json({ error: 'deskId is required' });
    return;
  }

  const desk = desks.find(d => d.id === deskId);
  if (!desk) {
    res.status(404).json({ error: 'Desk not found' });
    return;
  }

  if (desk.current_session_id) {
    const session = sessions.find(s => s.id === desk.current_session_id);
    if (session) {
      session.status = 'ENDED';
      session.end_time = new Date().toISOString();
    }
  }

  desk.status = 'FREE';
  desk.current_session_id = null;
  desk.updated_at = new Date().toISOString();

  res.json({ success: true });
});

// POST /api/checkout
app.post('/api/checkout', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ error: 'sessionId is required' });
    return;
  }

  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  session.status = 'ENDED';
  session.end_time = new Date().toISOString();

  const desk = desks.find(d => d.current_session_id === sessionId);
  if (desk) {
    desk.status = 'FREE';
    desk.current_session_id = null;
    desk.updated_at = new Date().toISOString();
  }

  res.json({ success: true });
});

// GET /api/analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  const totalDesks = desks.length;
  const freeDesks = desks.filter(d => d.status === 'FREE').length;
  const occupiedDesks = desks.filter(d => d.status === 'OCCUPIED').length;
  const awayDesks = desks.filter(d => d.status === 'AWAY').length;
  const abandonedDesks = desks.filter(d => d.status === 'ABANDONED').length;

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.status === 'ACTIVE').length;

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
});

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
