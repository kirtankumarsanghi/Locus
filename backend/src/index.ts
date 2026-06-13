import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import db, { initDB } from './db';

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Initialize DB on start
initDB();

// ─── Socket.IO Connection Management ──────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });

  // Send initial connection confirmation
  socket.emit('connected', { message: 'Connected to Locus real-time server' });
});

// Helper function to broadcast desk updates
const broadcastDeskUpdate = (deskId: number) => {
  try {
    const desk = db.prepare(`
      SELECT d.*, r.zone, r.floor 
      FROM desks d
      JOIN rooms r ON d.room_id = r.id
      WHERE d.id = ?
    `).get(deskId);

    let session = null;
    if (desk && (desk as any).current_session_id) {
      session = db.prepare(`
        SELECT s.*, u.student_id, u.name 
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
      `).get((desk as any).current_session_id);
    }

    io.emit('desk:updated', { desk, session });
  } catch (err) {
    console.error('Error broadcasting desk update:', err);
  }
};

// Helper function to broadcast all desks
const broadcastAllDesks = () => {
  try {
    const desks = db.prepare(`
      SELECT d.*, r.zone, r.floor 
      FROM desks d
      JOIN rooms r ON d.room_id = r.id
      ORDER BY d.number ASC
    `).all();

    io.emit('desks:all', desks);
  } catch (err) {
    console.error('Error broadcasting all desks:', err);
  }
};

// Helper function to broadcast analytics
const broadcastAnalytics = () => {
  try {
    const totalDesks = (db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as { cnt: number }).cnt;
    const freeDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'FREE'").get() as { cnt: number }).cnt;
    const occupiedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'OCCUPIED'").get() as { cnt: number }).cnt;
    const awayDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'AWAY'").get() as { cnt: number }).cnt;
    const abandonedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'ABANDONED'").get() as { cnt: number }).cnt;

    const totalSessions = (db.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as { cnt: number }).cnt;
    const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as { cnt: number }).cnt;

    io.emit('analytics:updated', {
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
    console.error('Error broadcasting analytics:', err);
  }
};

// ─── Notification Helpers ────────────────────────────────────────────────────

interface NotificationData {
  userId: number;
  type: 'SESSION_STARTED' | 'AWAY_WARNING' | 'SESSION_EXPIRED' | 'BOOKING_REMINDER' | 'ABANDONED_DESK' | 'NEW_BOOKING' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  metadata?: any;
}

const createNotification = (data: NotificationData) => {
  try {
    const result = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, priority, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.userId,
      data.type,
      data.title,
      data.message,
      data.priority || 'NORMAL',
      data.metadata ? JSON.stringify(data.metadata) : null
    );

    const notificationId = result.lastInsertRowid;
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId);

    // Emit to specific user via Socket.IO
    io.emit('notification:new', { userId: data.userId, notification });

    console.log(`📬 Notification created for user ${data.userId}: ${data.title}`);
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

const broadcastNotificationCount = (userId: number) => {
  try {
    const unreadCount = (db.prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as { cnt: number }).cnt;
    io.emit('notification:count', { userId, unreadCount });
  } catch (err) {
    console.error('Error broadcasting notification count:', err);
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Desk {
  id: number;
  number: number;
  label: string;
  room_id: number;
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
  user_id: number;
  student_id: string; // joined from users
  name?: string; // joined from users
  status: 'ACTIVE' | 'ENDED';
  start_time: string;
  away_start_time: string | null;
  last_check_in_time: string;
  end_time: string | null;
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// POST /api/login — Simple role-based login
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = db.prepare('SELECT id, student_id, name, email, role, department, status FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Your account has been suspended. Contact an administrator.' });
      return;
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/desks — Fetch all desks with current status
app.get('/api/desks', (_req: Request, res: Response) => {
  try {
    const desks = db.prepare(`
      SELECT d.*, r.zone, r.floor 
      FROM desks d
      JOIN rooms r ON d.room_id = r.id
      ORDER BY d.number ASC
    `).all();
    res.json(desks);
  } catch (err) {
    console.error('Error fetching desks:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/sessions/:id — Fetch session details
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined;
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/desks/:id — Fetch a single desk with its session info
app.get('/api/desks/:id', (req: Request, res: Response) => {
  try {
    const desk = db.prepare(`
      SELECT d.*, r.zone, r.floor 
      FROM desks d
      JOIN rooms r ON d.room_id = r.id
      WHERE d.id = ?
    `).get(req.params.id) as Desk | undefined;
    if (!desk) {
      res.status(404).json({ error: 'Desk not found' });
      return;
    }

    let session = null;
    if (desk.current_session_id) {
      session = db.prepare(`
        SELECT s.*, u.student_id, u.name 
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
      `).get(desk.current_session_id);
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

    // Find or create user
    let user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as { id: number } | undefined;
    if (!user) {
      const insertUser = db.prepare('INSERT INTO users (student_id, name, email) VALUES (?, ?, ?)');
      const userResult = insertUser.run(studentId, `Student ${studentId}`, `${studentId}@student.edu`);
      user = { id: Number(userResult.lastInsertRowid) };
    }

    const insertSession = db.prepare(
      `INSERT INTO sessions (desk_id, user_id, status) VALUES (?, ?, 'ACTIVE')`
    );
    const result = insertSession.run(desk.id, user.id);
    const sessionId = result.lastInsertRowid;

    db.prepare(
      `UPDATE desks SET status = 'OCCUPIED', current_session_id = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(sessionId, desk.id);

    // Emit socket events
    broadcastDeskUpdate(desk.id);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('session:checkin', { deskId: desk.id, sessionId: Number(sessionId), studentId });

    // Create notification for session started
    createNotification({
      userId: user.id,
      type: 'SESSION_STARTED',
      title: '✓ Session Started',
      message: `Your study session at ${desk.label} has begun. Remember to check out when done!`,
      priority: 'NORMAL',
      metadata: { sessionId: Number(sessionId), deskId: desk.id, deskLabel: desk.label }
    });

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

    // Emit socket events
    broadcastDeskUpdate(session.desk_id);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('session:away', { deskId: session.desk_id, sessionId });

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

    // Emit socket events
    broadcastDeskUpdate(session.desk_id);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('session:back', { deskId: session.desk_id, sessionId });

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

    // Emit socket events
    broadcastDeskUpdate(deskId);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('desk:reset', { deskId });

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

    // Emit socket events
    broadcastDeskUpdate(deskId);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('session:ended', { deskId });

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

    // Emit socket events
    broadcastDeskUpdate(session.desk_id);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('session:checkout', { deskId: session.desk_id, sessionId });

    res.json({ success: true });
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Analytics Routes ─────────────────────────────────────────────────────────

// GET /api/analytics/student/:studentId — Student-specific analytics
app.get('/api/analytics/student/:studentId', (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
    
    if (!user) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Daily study hours (last 30 days)
    const dailyHours = db.prepare(`
      SELECT 
        date(start_time) as date,
        SUM((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24) as hours
      FROM sessions
      WHERE user_id = ? 
        AND start_time >= date('now', '-30 days')
      GROUP BY date(start_time)
      ORDER BY date
    `).all(user.id) as any[];

    // Weekly study hours (last 12 weeks)
    const weeklyHours = db.prepare(`
      SELECT 
        strftime('%Y-W%W', start_time) as week,
        SUM((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24) as hours
      FROM sessions
      WHERE user_id = ? 
        AND start_time >= date('now', '-84 days')
      GROUP BY week
      ORDER BY week
    `).all(user.id) as any[];

    // Monthly study hours (last 12 months)
    const monthlyHours = db.prepare(`
      SELECT 
        strftime('%Y-%m', start_time) as month,
        SUM((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24) as hours
      FROM sessions
      WHERE user_id = ? 
        AND start_time >= date('now', '-365 days')
      GROUP BY month
      ORDER BY month
    `).all(user.id) as any[];

    // Session history (last 50)
    const sessionHistory = db.prepare(`
      SELECT 
        s.*,
        d.label as desk_label,
        d.number as desk_number,
        r.name as room_name
      FROM sessions s
      LEFT JOIN desks d ON s.desk_id = d.id
      LEFT JOIN rooms r ON d.room_id = r.id
      WHERE s.user_id = ?
      ORDER BY s.start_time DESC
      LIMIT 50
    `).all(user.id) as any[];

    // Study streak calculation
    const allSessionDates = db.prepare(`
      SELECT DISTINCT date(start_time) as date
      FROM sessions
      WHERE user_id = ?
      ORDER BY date DESC
    `).all(user.id) as any[];

    let studyStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const row of allSessionDates) {
      const sessionDate = new Date(row.date);
      sessionDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === studyStreak) {
        studyStreak++;
      } else {
        break;
      }
    }

    // Favorite desk
    const favoriteDesk = db.prepare(`
      SELECT 
        d.label,
        d.number,
        COUNT(*) as count
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      WHERE s.user_id = ?
      GROUP BY d.id
      ORDER BY count DESC
      LIMIT 1
    `).get(user.id) as any;

    // Favorite room
    const favoriteRoom = db.prepare(`
      SELECT 
        r.name,
        COUNT(*) as count
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      JOIN rooms r ON d.room_id = r.id
      WHERE s.user_id = ?
      GROUP BY r.id
      ORDER BY count DESC
      LIMIT 1
    `).get(user.id) as any;

    // Total study time
    const totalHours = db.prepare(`
      SELECT SUM((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24) as total
      FROM sessions
      WHERE user_id = ?
    `).get(user.id) as any;

    res.json({
      dailyHours: dailyHours.map(r => ({ date: r.date, hours: Math.round(r.hours * 100) / 100 })),
      weeklyHours: weeklyHours.map(r => ({ week: r.week, hours: Math.round(r.hours * 100) / 100 })),
      monthlyHours: monthlyHours.map(r => ({ month: r.month, hours: Math.round(r.hours * 100) / 100 })),
      sessionHistory,
      studyStreak,
      favoriteDesk: favoriteDesk || null,
      favoriteRoom: favoriteRoom || null,
      totalHours: totalHours?.total ? Math.round(totalHours.total * 100) / 100 : 0
    });
  } catch (err) {
    console.error('Error fetching student analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/analytics/staff — Staff analytics
app.get('/api/analytics/staff', (_req: Request, res: Response) => {
  try {
    const totalDesks = (db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as { cnt: number }).cnt;
    const freeDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'FREE'").get() as { cnt: number }).cnt;
    const occupiedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'OCCUPIED'").get() as { cnt: number }).cnt;
    const awayDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'AWAY'").get() as { cnt: number }).cnt;
    const abandonedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'ABANDONED'").get() as { cnt: number }).cnt;
    const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as { cnt: number }).cnt;

    const occupancyRate = totalDesks > 0 ? Math.round(((occupiedDesks + awayDesks) / totalDesks) * 100) : 0;

    // Peak hours (last 7 days)
    const peakHours = db.prepare(`
      SELECT 
        strftime('%H', start_time) as hour,
        COUNT(*) as count
      FROM sessions
      WHERE start_time >= datetime('now', '-7 days')
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 5
    `).all() as any[];

    // Desk utilization (sessions per desk)
    const deskUtilization = db.prepare(`
      SELECT 
        d.label,
        d.number,
        COUNT(s.id) as session_count,
        SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24) as total_hours
      FROM desks d
      LEFT JOIN sessions s ON d.id = s.desk_id AND s.start_time >= datetime('now', '-30 days')
      GROUP BY d.id
      ORDER BY session_count DESC
    `).all() as any[];

    // Hourly occupancy pattern (last 7 days)
    const hourlyPattern = db.prepare(`
      SELECT 
        strftime('%H', start_time) as hour,
        COUNT(*) as sessions
      FROM sessions
      WHERE start_time >= datetime('now', '-7 days')
      GROUP BY hour
      ORDER BY hour
    `).all() as any[];

    // Current desk status distribution
    const statusDistribution = [
      { status: 'FREE', count: freeDesks },
      { status: 'OCCUPIED', count: occupiedDesks },
      { status: 'AWAY', count: awayDesks },
      { status: 'ABANDONED', count: abandonedDesks }
    ];

    res.json({
      overview: {
        totalDesks,
        freeDesks,
        occupiedDesks,
        awayDesks,
        abandonedDesks,
        activeSessions,
        occupancyRate
      },
      peakHours: peakHours.map(r => ({ hour: `${r.hour}:00`, count: r.count })),
      deskUtilization: deskUtilization.map(r => ({
        label: r.label,
        number: r.number,
        sessionCount: r.session_count,
        totalHours: r.total_hours ? Math.round(r.total_hours * 100) / 100 : 0
      })),
      hourlyPattern: hourlyPattern.map(r => ({ hour: `${r.hour}:00`, sessions: r.sessions })),
      statusDistribution
    });
  } catch (err) {
    console.error('Error fetching staff analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/analytics/admin — Admin analytics
app.get('/api/analytics/admin', (_req: Request, res: Response) => {
  try {
    // Total users by role
    const usersByRole = db.prepare(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `).all() as any[];

    const totalUsers = usersByRole.reduce((sum, r) => sum + r.count, 0);
    const totalSessions = (db.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as { cnt: number }).cnt;
    const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as { cnt: number }).cnt;

    // Room utilization
    const roomUtilization = db.prepare(`
      SELECT 
        r.name,
        r.zone,
        r.floor,
        r.capacity,
        COUNT(DISTINCT d.id) as total_desks,
        COUNT(s.id) as total_sessions,
        SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24) as total_hours
      FROM rooms r
      LEFT JOIN desks d ON r.id = d.room_id
      LEFT JOIN sessions s ON d.id = s.desk_id AND s.start_time >= datetime('now', '-30 days')
      GROUP BY r.id
      ORDER BY total_sessions DESC
    `).all() as any[];

    // Daily occupancy trends (last 30 days)
    const dailyOccupancy = db.prepare(`
      SELECT 
        date(start_time) as date,
        COUNT(DISTINCT desk_id) as unique_desks,
        COUNT(*) as sessions,
        AVG((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24) as avg_duration
      FROM sessions
      WHERE start_time >= date('now', '-30 days')
      GROUP BY date
      ORDER BY date
    `).all() as any[];

    // Weekly occupancy trends (last 12 weeks)
    const weeklyOccupancy = db.prepare(`
      SELECT 
        strftime('%Y-W%W', start_time) as week,
        COUNT(DISTINCT desk_id) as unique_desks,
        COUNT(*) as sessions,
        AVG((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24) as avg_duration
      FROM sessions
      WHERE start_time >= date('now', '-84 days')
      GROUP BY week
      ORDER BY week
    `).all() as any[];

    // Monthly occupancy trends (last 12 months)
    const monthlyOccupancy = db.prepare(`
      SELECT 
        strftime('%Y-%m', start_time) as month,
        COUNT(DISTINCT desk_id) as unique_desks,
        COUNT(*) as sessions,
        AVG((julianday(COALESCE(end_time, datetime('now'))) - julianday(start_time)) * 24) as avg_duration
      FROM sessions
      WHERE start_time >= date('now', '-365 days')
      GROUP BY month
      ORDER BY month
    `).all() as any[];

    // Department usage (by room zone)
    const departmentUsage = db.prepare(`
      SELECT 
        r.zone as department,
        COUNT(s.id) as sessions,
        COUNT(DISTINCT s.user_id) as unique_users,
        SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24) as total_hours
      FROM rooms r
      LEFT JOIN desks d ON r.id = d.room_id
      LEFT JOIN sessions s ON d.id = s.desk_id AND s.start_time >= datetime('now', '-30 days')
      GROUP BY r.zone
      ORDER BY sessions DESC
    `).all() as any[];

    // Peak usage times heatmap (hour x day of week)
    const heatmapData = db.prepare(`
      SELECT 
        CAST(strftime('%w', start_time) AS INTEGER) as day_of_week,
        CAST(strftime('%H', start_time) AS INTEGER) as hour,
        COUNT(*) as count
      FROM sessions
      WHERE start_time >= datetime('now', '-30 days')
      GROUP BY day_of_week, hour
      ORDER BY day_of_week, hour
    `).all() as any[];

    res.json({
      overview: {
        totalUsers,
        totalSessions,
        activeSessions,
        usersByRole
      },
      roomUtilization: roomUtilization.map(r => ({
        name: r.name,
        zone: r.zone,
        floor: r.floor,
        capacity: r.capacity,
        totalDesks: r.total_desks,
        totalSessions: r.total_sessions,
        totalHours: r.total_hours ? Math.round(r.total_hours * 100) / 100 : 0,
        utilizationRate: r.total_desks > 0 ? Math.round((r.total_sessions / r.total_desks) * 100) / 100 : 0
      })),
      dailyOccupancy: dailyOccupancy.map(r => ({
        date: r.date,
        uniqueDesks: r.unique_desks,
        sessions: r.sessions,
        avgDuration: r.avg_duration ? Math.round(r.avg_duration * 100) / 100 : 0
      })),
      weeklyOccupancy: weeklyOccupancy.map(r => ({
        week: r.week,
        uniqueDesks: r.unique_desks,
        sessions: r.sessions,
        avgDuration: r.avg_duration ? Math.round(r.avg_duration * 100) / 100 : 0
      })),
      monthlyOccupancy: monthlyOccupancy.map(r => ({
        month: r.month,
        uniqueDesks: r.unique_desks,
        sessions: r.sessions,
        avgDuration: r.avg_duration ? Math.round(r.avg_duration * 100) / 100 : 0
      })),
      departmentUsage: departmentUsage.map(r => ({
        department: r.department,
        sessions: r.sessions,
        uniqueUsers: r.unique_users,
        totalHours: r.total_hours ? Math.round(r.total_hours * 100) / 100 : 0
      })),
      heatmapData
    });
  } catch (err) {
    console.error('Error fetching admin analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/analytics — Basic and advanced analytics data
app.get('/api/analytics', (_req: Request, res: Response) => {
  try {
    const totalDesks = (db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as { cnt: number }).cnt;
    const freeDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'FREE'").get() as { cnt: number }).cnt;
    const occupiedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'OCCUPIED'").get() as { cnt: number }).cnt;
    const awayDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'AWAY'").get() as { cnt: number }).cnt;
    const abandonedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'ABANDONED'").get() as { cnt: number }).cnt;

    const totalSessions = (db.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as { cnt: number }).cnt;
    const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as { cnt: number }).cnt;

    // Advanced analytics
    let avgDuration = 0;
    const durationRow = db.prepare("SELECT AVG((julianday(end_time) - julianday(start_time)) * 24 * 60) as avg_mins FROM sessions WHERE status = 'ENDED'").get() as any;
    if (durationRow && durationRow.avg_mins) {
      avgDuration = Math.round(durationRow.avg_mins);
    }

    const peakHoursRows = db.prepare("SELECT strftime('%H', start_time) as hour, COUNT(*) as count FROM sessions GROUP BY hour ORDER BY count DESC LIMIT 3").all() as any[];
    const peakHours = peakHoursRows.map(r => ({ hour: r.hour, count: r.count }));

    const mostUsedDesksRows = db.prepare(`
      SELECT d.label, d.number, COUNT(s.id) as count 
      FROM desks d 
      LEFT JOIN sessions s ON d.id = s.desk_id 
      GROUP BY d.id 
      ORDER BY count DESC 
      LIMIT 5
    `).all() as any[];
    const mostUsedDesks = mostUsedDesksRows.map(r => ({ label: r.label, number: r.number, count: r.count }));

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
        avgDurationMinutes: avgDuration,
        peakHours,
        mostUsedDesks
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Export Routes ────────────────────────────────────────────────────────────

// GET /api/export/csv/:type — Export data as CSV
app.get('/api/export/csv/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { studentId, startDate, endDate } = req.query;

    let data: any[] = [];
    let filename = 'export.csv';

    if (type === 'student-sessions' && studentId) {
      const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
      if (!user) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      data = db.prepare(`
        SELECT 
          s.id,
          s.start_time,
          s.end_time,
          s.status,
          d.label as desk,
          r.name as room,
          (julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24 as duration_hours
        FROM sessions s
        LEFT JOIN desks d ON s.desk_id = d.id
        LEFT JOIN rooms r ON d.room_id = r.id
        WHERE s.user_id = ?
        ORDER BY s.start_time DESC
      `).all(user.id) as any[];

      filename = `sessions_${studentId}_${Date.now()}.csv`;
    } else if (type === 'all-sessions') {
      data = db.prepare(`
        SELECT 
          s.id,
          u.student_id,
          u.name as student_name,
          s.start_time,
          s.end_time,
          s.status,
          d.label as desk,
          r.name as room,
          (julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24 as duration_hours
        FROM sessions s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN desks d ON s.desk_id = d.id
        LEFT JOIN rooms r ON d.room_id = r.id
        ORDER BY s.start_time DESC
        LIMIT 1000
      `).all() as any[];

      filename = `all_sessions_${Date.now()}.csv`;
    } else if (type === 'desk-utilization') {
      data = db.prepare(`
        SELECT 
          d.label,
          d.number,
          r.name as room,
          COUNT(s.id) as session_count,
          SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24) as total_hours
        FROM desks d
        LEFT JOIN rooms r ON d.room_id = r.id
        LEFT JOIN sessions s ON d.id = s.desk_id
        GROUP BY d.id
        ORDER BY session_count DESC
      `).all() as any[];

      filename = `desk_utilization_${Date.now()}.csv`;
    }

    // Convert to CSV format
    if (data.length === 0) {
      res.status(404).json({ error: 'No data found' });
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(v => 
        typeof v === 'string' && v.includes(',') ? `"${v}"` : v
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    res.status(500).json({ error: 'Export error' });
  }
});

// GET /api/export/json/:type — Export data as JSON
app.get('/api/export/json/:type', (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { studentId } = req.query;

    let data: any;
    let filename = 'export.json';

    if (type === 'student-analytics' && studentId) {
      const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
      if (!user) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      data = {
        studentId,
        exportDate: new Date().toISOString(),
        sessions: db.prepare(`SELECT * FROM sessions WHERE user_id = ? ORDER BY start_time DESC`).all(user.id)
      };

      filename = `student_analytics_${studentId}_${Date.now()}.json`;
    } else if (type === 'admin-analytics') {
      data = {
        exportDate: new Date().toISOString(),
        users: db.prepare('SELECT * FROM users').all(),
        sessions: db.prepare('SELECT * FROM sessions').all(),
        desks: db.prepare('SELECT * FROM desks').all(),
        rooms: db.prepare('SELECT * FROM rooms').all()
      };

      filename = `admin_analytics_${Date.now()}.json`;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(data);
  } catch (err) {
    console.error('Error exporting JSON:', err);
    res.status(500).json({ error: 'Export error' });
  }
});

// GET /api/export/excel/:type — Export data as Excel
app.get('/api/export/excel/:type', async (req: Request, res: Response) => {
  try {
    const ExcelJS = require('exceljs');
    const { type } = req.params;
    const { studentId } = req.query;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Locus System';
    workbook.created = new Date();

    let filename = 'export.xlsx';

    if (type === 'student-analytics' && studentId) {
      const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
      if (!user) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      // Sessions sheet
      const sessionsSheet = workbook.addWorksheet('Sessions');
      sessionsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Start Time', key: 'start_time', width: 20 },
        { header: 'End Time', key: 'end_time', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Desk', key: 'desk', width: 15 },
        { header: 'Room', key: 'room', width: 20 },
        { header: 'Duration (hrs)', key: 'duration_hours', width: 15 }
      ];

      const sessions = db.prepare(`
        SELECT 
          s.id,
          s.start_time,
          s.end_time,
          s.status,
          d.label as desk,
          r.name as room,
          ROUND((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24, 2) as duration_hours
        FROM sessions s
        LEFT JOIN desks d ON s.desk_id = d.id
        LEFT JOIN rooms r ON d.room_id = r.id
        WHERE s.user_id = ?
        ORDER BY s.start_time DESC
      `).all(user.id) as any[];

      sessionsSheet.addRows(sessions);
      sessionsSheet.getRow(1).font = { bold: true };

      filename = `student_analytics_${studentId}_${Date.now()}.xlsx`;

    } else if (type === 'admin-analytics') {
      // Overview sheet
      const overviewSheet = workbook.addWorksheet('Overview');
      const totalUsers = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
      const totalSessions = (db.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as { cnt: number }).cnt;
      const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as { cnt: number }).cnt;

      overviewSheet.addRow(['Metric', 'Value']);
      overviewSheet.addRow(['Total Users', totalUsers]);
      overviewSheet.addRow(['Total Sessions', totalSessions]);
      overviewSheet.addRow(['Active Sessions', activeSessions]);
      overviewSheet.addRow(['Export Date', new Date().toISOString()]);
      overviewSheet.getRow(1).font = { bold: true };

      // Room Utilization sheet
      const roomSheet = workbook.addWorksheet('Room Utilization');
      roomSheet.columns = [
        { header: 'Room', key: 'name', width: 25 },
        { header: 'Zone', key: 'zone', width: 15 },
        { header: 'Floor', key: 'floor', width: 10 },
        { header: 'Capacity', key: 'capacity', width: 12 },
        { header: 'Total Desks', key: 'total_desks', width: 15 },
        { header: 'Total Sessions', key: 'total_sessions', width: 15 },
        { header: 'Total Hours', key: 'total_hours', width: 15 }
      ];

      const roomData = db.prepare(`
        SELECT 
          r.name,
          r.zone,
          r.floor,
          r.capacity,
          COUNT(DISTINCT d.id) as total_desks,
          COUNT(s.id) as total_sessions,
          ROUND(SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24), 2) as total_hours
        FROM rooms r
        LEFT JOIN desks d ON r.id = d.room_id
        LEFT JOIN sessions s ON d.id = s.desk_id
        GROUP BY r.id
        ORDER BY total_sessions DESC
      `).all() as any[];

      roomSheet.addRows(roomData);
      roomSheet.getRow(1).font = { bold: true };

      // All Sessions sheet (limited to 5000 for performance)
      const allSessionsSheet = workbook.addWorksheet('All Sessions');
      allSessionsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Student ID', key: 'student_id', width: 15 },
        { header: 'Student Name', key: 'student_name', width: 20 },
        { header: 'Start Time', key: 'start_time', width: 20 },
        { header: 'End Time', key: 'end_time', width: 20 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Desk', key: 'desk', width: 15 },
        { header: 'Room', key: 'room', width: 20 }
      ];

      const allSessions = db.prepare(`
        SELECT 
          s.id,
          u.student_id,
          u.name as student_name,
          s.start_time,
          s.end_time,
          s.status,
          d.label as desk,
          r.name as room
        FROM sessions s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN desks d ON s.desk_id = d.id
        LEFT JOIN rooms r ON d.room_id = r.id
        ORDER BY s.start_time DESC
        LIMIT 5000
      `).all() as any[];

      allSessionsSheet.addRows(allSessions);
      allSessionsSheet.getRow(1).font = { bold: true };

      filename = `admin_analytics_${Date.now()}.xlsx`;

    } else if (type === 'staff-analytics') {
      // Desk Utilization sheet
      const deskSheet = workbook.addWorksheet('Desk Utilization');
      deskSheet.columns = [
        { header: 'Desk', key: 'label', width: 15 },
        { header: 'Room', key: 'room', width: 20 },
        { header: 'Sessions', key: 'session_count', width: 12 },
        { header: 'Total Hours', key: 'total_hours', width: 15 }
      ];

      const deskData = db.prepare(`
        SELECT 
          d.label,
          r.name as room,
          COUNT(s.id) as session_count,
          ROUND(SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24), 2) as total_hours
        FROM desks d
        LEFT JOIN rooms r ON d.room_id = r.id
        LEFT JOIN sessions s ON d.id = s.desk_id AND s.start_time >= datetime('now', '-30 days')
        GROUP BY d.id
        ORDER BY session_count DESC
      `).all() as any[];

      deskSheet.addRows(deskData);
      deskSheet.getRow(1).font = { bold: true };

      filename = `staff_analytics_${Date.now()}.xlsx`;
    }

    // Generate buffer and send
    const buffer = await workbook.xlsx.writeBuffer();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (err) {
    console.error('Error exporting Excel:', err);
    res.status(500).json({ error: 'Export error' });
  }
});

// GET /api/export/pdf/:type — Export data as PDF (placeholder for future implementation)
app.get('/api/export/pdf/:type', (_req: Request, res: Response) => {
  // PDF export requires additional library like pdfkit or puppeteer
  // This is a placeholder that returns a formatted text file for now
  res.status(501).json({ 
    error: 'PDF export not yet implemented',
    message: 'Please use Excel or CSV export for now. PDF support coming soon.'
  });
});

// ─── Student Profile Routes ───────────────────────────────────────────────────

app.get('/api/student/:studentId', (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    let user = db.prepare('SELECT * FROM users WHERE student_id = ?').get(studentId) as any;
    
    // If user doesn't exist, create a dummy one for the demo
    if (!user) {
      const insertUser = db.prepare('INSERT INTO users (student_id, name, email) VALUES (?, ?, ?)');
      const userResult = insertUser.run(studentId, `Student ${studentId}`, `${studentId}@student.edu`);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userResult.lastInsertRowid);
    }

    // Get active session
    const activeSession = db.prepare(`
      SELECT s.*, d.number as desk_number, d.label as desk_label
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      WHERE s.user_id = ? AND s.status = 'ACTIVE'
    `).get(user.id) as any;

    // Get past sessions for history and stats
    const pastSessions = db.prepare(`
      SELECT s.*, d.number as desk_number, d.label as desk_label
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      WHERE s.user_id = ?
      ORDER BY s.start_time DESC
    `).all(user.id) as any[];

    let totalMinutes = 0;
    for (const s of pastSessions) {
      if (s.end_time) {
        const start = new Date(s.start_time).getTime();
        const end = new Date(s.end_time).getTime();
        totalMinutes += (end - start) / 60000;
      } else if (s.status === 'ACTIVE') {
         const start = new Date(s.start_time).getTime();
         const end = new Date().getTime();
         totalMinutes += (end - start) / 60000;
      }
    }
    
    const totalHours = Math.floor(totalMinutes / 60);

    res.json({
      student: {
        id: user.id,
        studentId: user.student_id,
        name: user.name,
        email: user.email,
        totalHours,
        checkIns: pastSessions.length,
        activeDesk: activeSession ? activeSession.desk_label : null
      },
      recentSessions: pastSessions.slice(0, 10),
      activeSession
    });
  } catch (err) {
    console.error('Error fetching student profile:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Smart Features Routes ────────────────────────────────────────────────────

// GET /api/smart/recommendations/:studentId — Smart seat recommendations
app.get('/api/smart/recommendations/:studentId', (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
    
    if (!user) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Get student's study history to identify preferences
    const studyHistory = db.prepare(`
      SELECT d.id, d.label, d.room_id, r.name as room_name, r.zone, COUNT(*) as usage_count
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      JOIN rooms r ON d.room_id = r.id
      WHERE s.user_id = ?
      GROUP BY d.id
      ORDER BY usage_count DESC
      LIMIT 3
    `).all(user.id) as any[];

    // Get preferred area (most used zone)
    const preferredZone = studyHistory.length > 0 ? studyHistory[0].zone : null;

    // Get currently available desks
    const availableDesks = db.prepare(`
      SELECT d.*, r.name as room_name, r.zone, r.floor, r.noise_level as room_noise_level
      FROM desks d
      JOIN rooms r ON d.room_id = r.id
      WHERE d.status = 'FREE'
    `).all() as any[];

    // Calculate desk usage frequency (for popularity estimation)
    const deskUsageMap: Record<number, number> = {};
    const allDeskUsage = db.prepare(`
      SELECT desk_id, COUNT(*) as session_count
      FROM sessions
      WHERE start_time >= datetime('now', '-30 days')
      GROUP BY desk_id
    `).all() as any[];

    allDeskUsage.forEach((item: any) => {
      deskUsageMap[item.desk_id] = item.session_count;
    });

    // Score and rank desks
    const rankedDesks = availableDesks.map((desk: any) => {
      let score = 0;
      const usageCount = deskUsageMap[desk.id] || 0;

      // Availability score (always available)
      score += 30;

      // Preferred area bonus
      if (preferredZone && desk.zone === preferredZone) {
        score += 25;
      }

      // Noise level (Quiet gets highest base bonus)
      const roomNoise = desk.room_noise_level || 'Moderate';
      if (roomNoise === 'Quiet') score += 20;
      else if (roomNoise === 'Moderate') score += 10;
      else score += 5; // Collaborative/Busy

      // Study history bonus (previously used desks)
      const previouslyUsed = studyHistory.find((h: any) => h.id === desk.id);
      if (previouslyUsed) {
        score += 25;
      }

      return {
        ...desk,
        score: Math.round(score),
        noiseLevel: roomNoise,
        usageCount,
        reason: previouslyUsed 
          ? 'You\'ve studied here before' 
          : preferredZone && desk.zone === preferredZone
            ? 'In your preferred area'
            : roomNoise === 'Quiet'
              ? 'Quiet environment'
              : 'Available now'
      };
    });

    // Sort by score descending
    rankedDesks.sort((a, b) => b.score - a.score);

    res.json({
      recommendations: rankedDesks.slice(0, 5),
      preferredZone,
      studyHistory: studyHistory.slice(0, 3)
    });

  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/smart/heatmap — Occupancy heatmap data
app.get('/api/smart/heatmap', (_req: Request, res: Response) => {
  try {
    // Most used desks (last 30 days)
    const deskHeatmap = db.prepare(`
      SELECT 
        d.id,
        d.label,
        d.number,
        r.name as room_name,
        r.zone,
        COUNT(s.id) as session_count,
        SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24) as total_hours
      FROM desks d
      LEFT JOIN rooms r ON d.room_id = r.id
      LEFT JOIN sessions s ON d.id = s.desk_id AND s.start_time >= datetime('now', '-30 days')
      GROUP BY d.id
      ORDER BY session_count DESC
    `).all() as any[];

    // Most used rooms
    const roomHeatmap = db.prepare(`
      SELECT 
        r.id,
        r.name,
        r.zone,
        r.floor,
        COUNT(s.id) as session_count,
        SUM((julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24) as total_hours
      FROM rooms r
      LEFT JOIN desks d ON r.id = d.room_id
      LEFT JOIN sessions s ON d.id = s.desk_id AND s.start_time >= datetime('now', '-30 days')
      GROUP BY r.id
      ORDER BY session_count DESC
    `).all() as any[];

    // Peak hours (last 7 days)
    const peakHours = db.prepare(`
      SELECT 
        CAST(strftime('%H', start_time) AS INTEGER) as hour,
        COUNT(*) as session_count
      FROM sessions
      WHERE start_time >= datetime('now', '-7 days')
      GROUP BY hour
      ORDER BY hour
    `).all() as any[];

    // Hour x Day heatmap
    const hourDayHeatmap = db.prepare(`
      SELECT 
        CAST(strftime('%w', start_time) AS INTEGER) as day_of_week,
        CAST(strftime('%H', start_time) AS INTEGER) as hour,
        COUNT(*) as count
      FROM sessions
      WHERE start_time >= datetime('now', '-30 days')
      GROUP BY day_of_week, hour
    `).all() as any[];

    res.json({
      deskHeatmap: deskHeatmap.map((d: any) => ({
        ...d,
        total_hours: d.total_hours ? Math.round(d.total_hours * 100) / 100 : 0
      })),
      roomHeatmap: roomHeatmap.map((r: any) => ({
        ...r,
        total_hours: r.total_hours ? Math.round(r.total_hours * 100) / 100 : 0
      })),
      peakHours,
      hourDayHeatmap
    });

  } catch (err) {
    console.error('Error fetching heatmap data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/smart/streak/:studentId — Study streak tracking
app.get('/api/smart/streak/:studentId', (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
    
    if (!user) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Get all session dates
    const sessionDates = db.prepare(`
      SELECT DISTINCT date(start_time) as date
      FROM sessions
      WHERE user_id = ?
      ORDER BY date DESC
    `).all(user.id) as any[];

    // Calculate current streak
    let currentStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const row of sessionDates) {
      const sessionDate = new Date(row.date);
      sessionDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const row of sessionDates.slice().reverse()) {
      const sessionDate = new Date(row.date);
      sessionDate.setHours(0, 0, 0, 0);

      if (!prevDate || Math.floor((sessionDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      prevDate = sessionDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Weekly goal progress (target: 5 days)
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisWeekSessions = sessionDates.filter((row: any) => {
      const sessionDate = new Date(row.date);
      return sessionDate >= thisWeekStart;
    }).length;

    // Monthly goal progress (target: 20 days)
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const thisMonthSessions = sessionDates.filter((row: any) => {
      const sessionDate = new Date(row.date);
      return sessionDate >= thisMonthStart;
    }).length;

    res.json({
      currentStreak,
      longestStreak,
      weeklyGoal: {
        current: thisWeekSessions,
        target: 5,
        percentage: Math.min(Math.round((thisWeekSessions / 5) * 100), 100)
      },
      monthlyGoal: {
        current: thisMonthSessions,
        target: 20,
        percentage: Math.min(Math.round((thisMonthSessions / 20) * 100), 100)
      },
      totalStudyDays: sessionDates.length
    });

  } catch (err) {
    console.error('Error fetching streak data:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/smart/achievements/:studentId — Achievement system
app.get('/api/smart/achievements/:studentId', (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
    
    if (!user) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Get all sessions for achievement calculations
    const sessions = db.prepare(`
      SELECT 
        s.*,
        d.room_id,
        r.name as room_name,
        (julianday(COALESCE(s.end_time, datetime('now'))) - julianday(s.start_time)) * 24 as duration_hours
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      JOIN rooms r ON d.room_id = r.id
      WHERE s.user_id = ?
      ORDER BY s.start_time ASC
    `).all(user.id) as any[];

    const achievements = [];

    // Early Bird: Check in before 8 AM (at least 5 times)
    const earlyBirdSessions = sessions.filter((s: any) => {
      const hour = new Date(s.start_time).getHours();
      return hour < 8;
    });
    achievements.push({
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Check in before 8 AM',
      icon: 'wb_sunny',
      color: 'from-amber-400 to-orange-500',
      progress: earlyBirdSessions.length,
      target: 5,
      unlocked: earlyBirdSessions.length >= 5,
      rarity: 'rare'
    });

    // Consistent Learner: 7 day streak
    const sessionDates = [...new Set(sessions.map((s: any) => s.start_time.split(' ')[0]))];
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sessionDates.sort()) {
      const currentDate = new Date(dateStr);
      currentDate.setHours(0, 0, 0, 0);

      if (!prevDate || Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }

      prevDate = currentDate;
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    achievements.push({
      id: 'consistent_learner',
      name: 'Consistent Learner',
      description: '7 day study streak',
      icon: 'local_fire_department',
      color: 'from-red-400 to-orange-500',
      progress: maxStreak,
      target: 7,
      unlocked: maxStreak >= 7,
      rarity: 'epic'
    });

    // Marathon Session: Study for 4+ hours in one session
    const marathonSessions = sessions.filter((s: any) => s.duration_hours >= 4);
    achievements.push({
      id: 'marathon_session',
      name: 'Marathon Session',
      description: 'Study for 4+ hours',
      icon: 'timer',
      color: 'from-purple-400 to-purple-600',
      progress: marathonSessions.length,
      target: 1,
      unlocked: marathonSessions.length >= 1,
      rarity: 'rare'
    });

    // Room Master: Use all available rooms
    const uniqueRooms = new Set(sessions.map((s: any) => s.room_id));
    const totalRooms = (db.prepare('SELECT COUNT(*) as cnt FROM rooms').get() as { cnt: number }).cnt;
    
    achievements.push({
      id: 'room_master',
      name: 'Room Master',
      description: 'Study in all rooms',
      icon: 'meeting_room',
      color: 'from-blue-400 to-blue-600',
      progress: uniqueRooms.size,
      target: totalRooms,
      unlocked: uniqueRooms.size >= totalRooms,
      rarity: 'legendary'
    });

    // Night Owl: Study after 8 PM (at least 5 times)
    const nightOwlSessions = sessions.filter((s: any) => {
      const hour = new Date(s.start_time).getHours();
      return hour >= 20;
    });
    achievements.push({
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Study after 8 PM',
      icon: 'dark_mode',
      color: 'from-indigo-400 to-purple-500',
      progress: nightOwlSessions.length,
      target: 5,
      unlocked: nightOwlSessions.length >= 5,
      rarity: 'rare'
    });

    // Century Club: 100 total sessions
    achievements.push({
      id: 'century_club',
      name: 'Century Club',
      description: '100 study sessions',
      icon: 'military_tech',
      color: 'from-yellow-400 to-amber-500',
      progress: sessions.length,
      target: 100,
      unlocked: sessions.length >= 100,
      rarity: 'legendary'
    });

    res.json({
      achievements,
      unlockedCount: achievements.filter((a: any) => a.unlocked).length,
      totalCount: achievements.length
    });

  } catch (err) {
    console.error('Error fetching achievements:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Room Booking Routes ──────────────────────────────────────────────────────

app.get('/api/rooms', (_req: Request, res: Response) => {
  try {
    const rooms = db.prepare('SELECT * FROM rooms ORDER BY name ASC').all();
    const bookings = db.prepare('SELECT * FROM room_bookings').all();
    res.json({ rooms, bookings });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/rooms/book', (req: Request, res: Response) => {
  const { roomId, studentId, startTime, endTime, role } = req.body;
  if (!roomId || !studentId || !startTime || !endTime) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    let user = db.prepare('SELECT id, role FROM users WHERE student_id = ?').get(studentId) as any;
    if (!user) {
      const insertUser = db.prepare('INSERT INTO users (student_id, name, email) VALUES (?, ?, ?)');
      const userResult = insertUser.run(studentId, `Student ${studentId}`, `${studentId}@student.edu`);
      user = { id: Number(userResult.lastInsertRowid), role: 'STUDENT' };
    }

    const conflict = db.prepare(`
      SELECT id FROM room_bookings 
      WHERE room_id = ? 
      AND status IN ('PENDING', 'APPROVED') 
      AND start_time < ? 
      AND end_time > ?
    `).get(roomId, endTime, startTime);

    if (conflict) {
      res.status(409).json({ error: 'Time slot conflict with an existing booking.' });
      return;
    }

    const insertBooking = db.prepare(
      'INSERT INTO room_bookings (room_id, user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)'
    );
    
    // Auto-approve if staff/admin, else PENDING
    const initialStatus = (user.role === 'STAFF' || user.role === 'ADMIN' || role === 'STAFF' || role === 'ADMIN') ? 'APPROVED' : 'PENDING';
    
    const result = insertBooking.run(roomId, user.id, startTime, endTime, initialStatus);
    const bookingId = result.lastInsertRowid;

    // Get room name
    const room = db.prepare('SELECT name FROM rooms WHERE id = ?').get(roomId) as any;
    
    // Create notification for user
    createNotification({
      userId: user.id,
      type: 'NEW_BOOKING',
      title: initialStatus === 'APPROVED' ? '✓ Room Booked' : '📝 Booking Requested',
      message: initialStatus === 'APPROVED' 
        ? `Your booking for ${room?.name || 'Room'} at ${startTime} has been confirmed.`
        : `Your booking request for ${room?.name || 'Room'} at ${startTime} is pending approval.`,
      priority: 'NORMAL',
      metadata: { bookingId: Number(bookingId), roomId, roomName: room?.name, startTime, endTime, status: initialStatus }
    });

    // Notify staff about new pending booking
    if (initialStatus === 'PENDING') {
      const staffUsers = db.prepare("SELECT id FROM users WHERE role IN ('STAFF', 'ADMIN')").all() as Array<{ id: number }>;
      for (const staff of staffUsers) {
        createNotification({
          userId: staff.id,
          type: 'NEW_BOOKING',
          title: '📋 New Booking Request',
          message: `New room booking request for ${room?.name || 'Room'} on ${startTime}.`,
          priority: 'NORMAL',
          metadata: { bookingId: Number(bookingId), roomId, roomName: room?.name, startTime, endTime }
        });
      }
    }
    
    io.emit('room:booking_updated');
    res.json({ success: true });
  } catch (err) {
    console.error('Error booking room:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/rooms/cancel', (req: Request, res: Response) => {
  const { bookingId, studentId } = req.body;
  if (!bookingId || !studentId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const updateBooking = db.prepare(
      'UPDATE room_bookings SET status = "CANCELLED" WHERE id = ? AND user_id = ? AND status IN ("PENDING", "APPROVED")'
    );
    const info = updateBooking.run(bookingId, user.id);
    if (info.changes > 0) {
      io.emit('room:booking_updated');
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Booking cannot be cancelled or does not exist.' });
    }
  } catch (err) {
    console.error('Error cancelling room booking:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/rooms/my-bookings/:studentId', (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const user = db.prepare('SELECT id FROM users WHERE student_id = ?').get(studentId) as any;
    if (!user) {
      res.json({ bookings: [] });
      return;
    }
    const bookings = db.prepare(`
      SELECT b.*, r.name as room_name 
      FROM room_bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ?
      ORDER BY b.start_time ASC
    `).all(user.id);
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching my bookings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/rooms/bookings', (_req: Request, res: Response) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, r.name as room_name, u.name as student_name, u.student_id 
      FROM room_bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `).all();
    res.json({ bookings });
  } catch (err) {
    console.error('Error fetching room bookings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/rooms/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  
  try {
    const booking = db.prepare(`
      SELECT b.*, r.name as room_name, u.name as student_name 
      FROM room_bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `).get(id) as any;

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const updateStatus = db.prepare('UPDATE room_bookings SET status = ? WHERE id = ?');
    updateStatus.run(status, id);
    
    // Notify user about booking status change
    let notificationTitle = '';
    let notificationMessage = '';
    let priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL';

    if (status === 'APPROVED') {
      notificationTitle = '✓ Booking Approved';
      notificationMessage = `Your booking for ${booking.room_name} has been approved for ${booking.start_time}.`;
      priority = 'NORMAL';
    } else if (status === 'REJECTED') {
      notificationTitle = '✗ Booking Rejected';
      notificationMessage = `Your booking request for ${booking.room_name} has been rejected.`;
      priority = 'HIGH';
    } else if (status === 'CANCELLED') {
      notificationTitle = 'Booking Cancelled';
      notificationMessage = `Your booking for ${booking.room_name} has been cancelled.`;
      priority = 'NORMAL';
    }

    if (notificationTitle) {
      createNotification({
        userId: booking.user_id,
        type: 'BOOKING_REMINDER',
        title: notificationTitle,
        message: notificationMessage,
        priority,
        metadata: { bookingId: id, roomName: booking.room_name, status }
      });
    }
    
    io.emit('room:booking_updated');
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Notification Routes ──────────────────────────────────────────────────────

// GET /api/notifications/:userId — Get all notifications for a user
app.get('/api/notifications/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(userId);

    const unreadCount = (db.prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as { cnt: number }).cnt;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/notifications/:id/read — Mark notification as read
app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const notification = db.prepare('SELECT user_id FROM notifications WHERE id = ?').get(id) as any;
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    
    // Broadcast updated count
    broadcastNotificationCount(notification.user_id);

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/notifications/mark-all-read — Mark all notifications as read for a user
app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(userId);
    
    // Broadcast updated count
    broadcastNotificationCount(userId);

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/notifications/:id — Delete a notification
app.delete('/api/notifications/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const notification = db.prepare('SELECT user_id FROM notifications WHERE id = ?').get(id) as any;
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
    
    // Broadcast updated count
    broadcastNotificationCount(notification.user_id);

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/notifications/system — Create system-wide notification (admin only)
app.post('/api/notifications/system', (req: Request, res: Response) => {
  const { title, message, priority, targetRole } = req.body;

  if (!title || !message) {
    res.status(400).json({ error: 'title and message are required' });
    return;
  }

  try {
    // Get all users or filtered by role
    let users: Array<{ id: number }>;
    if (targetRole && ['STUDENT', 'STAFF', 'ADMIN'].includes(targetRole)) {
      users = db.prepare('SELECT id FROM users WHERE role = ?').all(targetRole) as Array<{ id: number }>;
    } else {
      users = db.prepare('SELECT id FROM users').all() as Array<{ id: number }>;
    }

    // Create notification for each user
    for (const user of users) {
      createNotification({
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title,
        message,
        priority: priority || 'NORMAL',
        metadata: { targetRole: targetRole || 'ALL' }
      });
    }

    res.json({ success: true, notifiedUsers: users.length });
  } catch (err) {
    console.error('Error creating system notification:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Settings Routes ──────────────────────────────────────────────────────────

app.get('/api/settings', (_req: Request, res: Response) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all() as any[];
    const settingsObj: Record<string, any> = {};
    for (const s of settings) {
      try {
        settingsObj[s.key] = JSON.parse(s.value);
      } catch {
        settingsObj[s.key] = s.value;
      }
    }
    res.json(settingsObj);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/settings', (req: Request, res: Response) => {
  const settingsToUpdate = req.body;
  try {
    const updateSetting = db.prepare(
      'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at'
    );
    const updateAll = db.transaction(() => {
      for (const [key, value] of Object.entries(settingsToUpdate)) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        updateSetting.run(key, valStr);
      }
    });
    updateAll();
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
// ─── Activity Log Helper ──────────────────────────────────────────────────────

interface ActivityLogData {
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
}

const logActivity = (data: ActivityLogData) => {
  try {
    db.prepare(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.userId || null, data.action, data.entityType, data.entityId || null, data.details || null);

    // Broadcast to admin clients
    const log = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1').get();
    io.emit('admin:activity_logged', log);
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

// ─── Admin API Routes ─────────────────────────────────────────────────────────

// GET /api/admin/dashboard — Combined dashboard data
app.get('/api/admin/dashboard', (_req: Request, res: Response) => {
  try {
    const totalStudents = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'STUDENT'").get() as any).cnt;
    const totalStaff = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role IN ('STAFF', 'ADMIN')").get() as any).cnt;
    const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as any).cnt;
    const totalDesks = (db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as any).cnt;
    const freeDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'FREE'").get() as any).cnt;
    const occupiedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'OCCUPIED'").get() as any).cnt;
    const awayDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'AWAY'").get() as any).cnt;
    const abandonedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'ABANDONED'").get() as any).cnt;

    const todayBookings = (db.prepare(`
      SELECT COUNT(*) as cnt FROM room_bookings 
      WHERE date(start_time) = date('now') AND status IN ('PENDING', 'APPROVED')
    `).get() as any).cnt;

    const occupancyRate = totalDesks > 0 ? Math.round(((occupiedDesks + awayDesks) / totalDesks) * 100) : 0;

    // Peak hours
    const peakHours = db.prepare(`
      SELECT strftime('%H', start_time) as hour, COUNT(*) as count 
      FROM sessions GROUP BY hour ORDER BY count DESC LIMIT 5
    `).all();

    // Most used rooms
    const mostUsedRooms = db.prepare(`
      SELECT r.name, COUNT(b.id) as count 
      FROM rooms r LEFT JOIN room_bookings b ON r.id = b.room_id 
      GROUP BY r.id ORDER BY count DESC LIMIT 5
    `).all();

    // Most used desks
    const mostUsedDesks = db.prepare(`
      SELECT d.label, COUNT(s.id) as count 
      FROM desks d LEFT JOIN sessions s ON d.id = s.desk_id 
      GROUP BY d.id ORDER BY count DESC LIMIT 5
    `).all();

    // Recent activity
    const recentActivity = db.prepare(`
      SELECT al.*, u.name as user_name 
      FROM activity_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC LIMIT 20
    `).all();

    res.json({
      stats: {
        totalStudents, totalStaff, activeSessions, totalDesks,
        freeDesks, occupiedDesks, awayDesks, abandonedDesks,
        todayBookings, occupancyRate,
      },
      peakHours, mostUsedRooms, mostUsedDesks, recentActivity,
    });
  } catch (err) {
    console.error('Error fetching admin dashboard:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── User Management ──────────────────────────────────────────────────────────

// GET /api/admin/users — List all users with filters
app.get('/api/admin/users', (req: Request, res: Response) => {
  try {
    const { role, status, search } = req.query;
    let query = 'SELECT id, student_id, name, email, role, department, status, created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (role && ['STUDENT', 'STAFF', 'ADMIN'].includes(role as string)) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (status && ['ACTIVE', 'SUSPENDED'].includes(status as string)) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    query += ' ORDER BY created_at DESC';

    const users = db.prepare(query).all(...params);
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/admin/users — Create new user
app.post('/api/admin/users', (req: Request, res: Response) => {
  const { name, email, role, department, student_id, password } = req.body;

  if (!name || !email || !role || !student_id) {
    res.status(400).json({ error: 'name, email, role, and student_id are required' });
    return;
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR student_id = ?').get(email, student_id);
    if (existing) {
      res.status(409).json({ error: 'User with this email or ID already exists' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO users (student_id, name, email, password, role, department, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(student_id, name, email, password || 'password123', role, department || 'General', 'ACTIVE');

    const newUser = db.prepare('SELECT id, student_id, name, email, role, department, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    logActivity({ action: 'USER_CREATED', entityType: 'USER', entityId: Number(result.lastInsertRowid), details: `Created ${role} user: ${name}` });
    io.emit('admin:user_updated');

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/admin/users/:id — Edit user
app.put('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, department, status } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    db.prepare(`
      UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        department = COALESCE(?, department),
        status = COALESCE(?, status)
      WHERE id = ?
    `).run(name || null, email || null, role || null, department || null, status || null, id);

    const updatedUser = db.prepare('SELECT id, student_id, name, email, role, department, status, created_at FROM users WHERE id = ?').get(id);

    logActivity({ action: 'USER_UPDATED', entityType: 'USER', entityId: Number(id), details: `Updated user: ${user.name}` });
    io.emit('admin:user_updated');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/admin/users/:id — Delete user
app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // End any active sessions
    const activeSessions = db.prepare("SELECT id, desk_id FROM sessions WHERE user_id = ? AND status = 'ACTIVE'").all(id) as any[];
    for (const session of activeSessions) {
      db.prepare("UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?").run(session.id);
      db.prepare("UPDATE desks SET status = 'FREE', current_session_id = NULL, updated_at = datetime('now') WHERE id = ?").run(session.desk_id);
      broadcastDeskUpdate(session.desk_id);
    }

    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    logActivity({ action: 'USER_DELETED', entityType: 'USER', entityId: Number(id), details: `Deleted user: ${user.name} (${user.role})` });
    io.emit('admin:user_updated');
    broadcastAllDesks();
    broadcastAnalytics();

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/admin/users/:id/suspend — Suspend user
app.post('/api/admin/users/:id/suspend', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    db.prepare("UPDATE users SET status = 'SUSPENDED' WHERE id = ?").run(id);

    // End active sessions for suspended user
    const activeSessions = db.prepare("SELECT id, desk_id FROM sessions WHERE user_id = ? AND status = 'ACTIVE'").all(id) as any[];
    for (const session of activeSessions) {
      db.prepare("UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?").run(session.id);
      db.prepare("UPDATE desks SET status = 'FREE', current_session_id = NULL, updated_at = datetime('now') WHERE id = ?").run(session.desk_id);
      broadcastDeskUpdate(session.desk_id);
    }

    logActivity({ action: 'USER_SUSPENDED', entityType: 'USER', entityId: Number(id), details: `Suspended user: ${user.name}` });
    io.emit('admin:user_updated');
    broadcastAllDesks();
    broadcastAnalytics();

    res.json({ success: true });
  } catch (err) {
    console.error('Error suspending user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/admin/users/:id/activate — Activate user
app.post('/api/admin/users/:id/activate', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    db.prepare("UPDATE users SET status = 'ACTIVE' WHERE id = ?").run(id);

    logActivity({ action: 'USER_ACTIVATED', entityType: 'USER', entityId: Number(id), details: `Activated user: ${user.name}` });
    io.emit('admin:user_updated');

    res.json({ success: true });
  } catch (err) {
    console.error('Error activating user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Student Management ───────────────────────────────────────────────────────

app.get('/api/admin/students', (_req: Request, res: Response) => {
  try {
    const students = db.prepare(`
      SELECT u.id, u.student_id, u.name, u.email, u.department, u.status, u.created_at,
        (SELECT COUNT(*) FROM sessions WHERE user_id = u.id) as total_sessions,
        (SELECT COUNT(*) FROM sessions WHERE user_id = u.id AND status = 'ACTIVE') as active_sessions,
        (SELECT COUNT(*) FROM room_bookings WHERE user_id = u.id) as total_bookings
      FROM users u WHERE u.role = 'STUDENT'
      ORDER BY u.created_at DESC
    `).all();
    res.json({ students });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/students/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = db.prepare('SELECT id, student_id, name, email, department, status, created_at FROM users WHERE id = ? AND role = ?').get(id, 'STUDENT') as any;
    if (!student) { res.status(404).json({ error: 'Student not found' }); return; }

    const activeSession = db.prepare(`
      SELECT s.*, d.label as desk_label, d.number as desk_number
      FROM sessions s JOIN desks d ON s.desk_id = d.id
      WHERE s.user_id = ? AND s.status = 'ACTIVE'
    `).get(id);

    const sessionHistory = db.prepare(`
      SELECT s.*, d.label as desk_label FROM sessions s
      JOIN desks d ON s.desk_id = d.id WHERE s.user_id = ?
      ORDER BY s.start_time DESC LIMIT 20
    `).all(id);

    const bookings = db.prepare(`
      SELECT b.*, r.name as room_name FROM room_bookings b
      JOIN rooms r ON b.room_id = r.id WHERE b.user_id = ?
      ORDER BY b.start_time DESC LIMIT 20
    `).all(id);

    const notifications = db.prepare(`
      SELECT * FROM notifications WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 20
    `).all(id);

    res.json({ student, activeSession, sessionHistory, bookings, notifications });
  } catch (err) {
    console.error('Error fetching student details:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/students/:id/reset-session', (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const session = db.prepare("SELECT s.id, s.desk_id FROM sessions s WHERE s.user_id = ? AND s.status = 'ACTIVE'").get(id) as any;
    if (!session) { res.status(404).json({ error: 'No active session' }); return; }

    db.prepare("UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?").run(session.id);
    db.prepare("UPDATE desks SET status = 'FREE', current_session_id = NULL, updated_at = datetime('now') WHERE id = ?").run(session.desk_id);

    logActivity({ userId: Number(id), action: 'SESSION_RESET', entityType: 'SESSION', entityId: session.id, details: 'Admin reset student session' });
    broadcastDeskUpdate(session.desk_id);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('session:ended', { deskId: session.desk_id });

    res.json({ success: true });
  } catch (err) {
    console.error('Error resetting session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/students/:id/end-session', (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const session = db.prepare("SELECT s.id, s.desk_id FROM sessions s WHERE s.user_id = ? AND s.status = 'ACTIVE'").get(id) as any;
    if (!session) { res.status(404).json({ error: 'No active session' }); return; }

    db.prepare("UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?").run(session.id);
    db.prepare("UPDATE desks SET status = 'FREE', current_session_id = NULL, updated_at = datetime('now') WHERE id = ?").run(session.desk_id);

    createNotification({
      userId: Number(id),
      type: 'SESSION_EXPIRED',
      title: 'Session Ended by Admin',
      message: 'Your study session was ended by an administrator.',
      priority: 'HIGH'
    });

    logActivity({ action: 'SESSION_ENDED_BY_ADMIN', entityType: 'SESSION', entityId: session.id, details: 'Admin force-ended student session' });
    broadcastDeskUpdate(session.desk_id);
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('session:ended', { deskId: session.desk_id });

    res.json({ success: true });
  } catch (err) {
    console.error('Error ending session:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Staff Management ─────────────────────────────────────────────────────────

app.get('/api/admin/staff', (_req: Request, res: Response) => {
  try {
    const staff = db.prepare(`
      SELECT u.id, u.student_id, u.name, u.email, u.role, u.department, u.status, u.created_at,
        (SELECT COUNT(*) FROM activity_logs WHERE user_id = u.id AND action = 'DESK_RESET') as desk_resets,
        (SELECT COUNT(*) FROM activity_logs WHERE user_id = u.id AND action LIKE '%BOOKING%') as room_approvals,
        (SELECT COUNT(*) FROM activity_logs WHERE user_id = u.id) as total_actions
      FROM users u WHERE u.role IN ('STAFF', 'ADMIN')
      ORDER BY u.created_at DESC
    `).all();
    res.json({ staff });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/staff/:id/promote', (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    db.prepare("UPDATE users SET role = 'ADMIN' WHERE id = ?").run(id);
    logActivity({ action: 'STAFF_PROMOTED', entityType: 'USER', entityId: Number(id), details: `Promoted ${user.name} to ADMIN` });
    io.emit('admin:user_updated');

    res.json({ success: true });
  } catch (err) {
    console.error('Error promoting staff:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Desk Management (Admin) ──────────────────────────────────────────────────

app.post('/api/admin/desks', (req: Request, res: Response) => {
  const { number, label, room_id } = req.body;

  if (!number || !label || !room_id) {
    res.status(400).json({ error: 'number, label, and room_id are required' });
    return;
  }

  try {
    const existing = db.prepare('SELECT id FROM desks WHERE number = ?').get(number);
    if (existing) { res.status(409).json({ error: 'Desk number already exists' }); return; }

    const result = db.prepare(
      "INSERT INTO desks (number, label, room_id, status) VALUES (?, ?, ?, 'FREE')"
    ).run(number, label, room_id);

    logActivity({ action: 'DESK_CREATED', entityType: 'DESK', entityId: Number(result.lastInsertRowid), details: `Created desk ${label}` });
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('admin:desk_updated');

    const newDesk = db.prepare('SELECT d.*, r.zone, r.floor FROM desks d JOIN rooms r ON d.room_id = r.id WHERE d.id = ?').get(result.lastInsertRowid);
    res.json({ success: true, desk: newDesk });
  } catch (err) {
    console.error('Error creating desk:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/admin/desks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, room_id } = req.body;

  try {
    const desk = db.prepare('SELECT * FROM desks WHERE id = ?').get(id) as any;
    if (!desk) { res.status(404).json({ error: 'Desk not found' }); return; }

    db.prepare(`
      UPDATE desks SET 
        label = COALESCE(?, label),
        room_id = COALESCE(?, room_id),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(label || null, room_id || null, id);

    logActivity({ action: 'DESK_UPDATED', entityType: 'DESK', entityId: Number(id), details: `Updated desk ${desk.label}` });
    broadcastDeskUpdate(Number(id));
    broadcastAllDesks();
    io.emit('admin:desk_updated');

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating desk:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/admin/desks/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const desk = db.prepare('SELECT * FROM desks WHERE id = ?').get(id) as any;
    if (!desk) { res.status(404).json({ error: 'Desk not found' }); return; }

    // End any active session on this desk
    if (desk.current_session_id) {
      db.prepare("UPDATE sessions SET status = 'ENDED', end_time = datetime('now') WHERE id = ?").run(desk.current_session_id);
    }

    db.prepare('DELETE FROM desks WHERE id = ?').run(id);

    logActivity({ action: 'DESK_DELETED', entityType: 'DESK', entityId: Number(id), details: `Deleted desk ${desk.label}` });
    broadcastAllDesks();
    broadcastAnalytics();
    io.emit('admin:desk_updated');

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting desk:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Room Management (Admin) ──────────────────────────────────────────────────

app.post('/api/admin/rooms', (req: Request, res: Response) => {
  const { name, zone, floor, capacity } = req.body;

  if (!name || !zone || floor === undefined || !capacity) {
    res.status(400).json({ error: 'name, zone, floor, and capacity are required' });
    return;
  }

  try {
    const result = db.prepare(
      'INSERT INTO rooms (name, zone, floor, capacity) VALUES (?, ?, ?, ?)'
    ).run(name, zone, floor, capacity);

    logActivity({ action: 'ROOM_CREATED', entityType: 'ROOM', entityId: Number(result.lastInsertRowid), details: `Created room: ${name}` });
    io.emit('admin:room_updated');
    io.emit('room:booking_updated');

    const newRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, room: newRoom });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/admin/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, zone, floor, capacity } = req.body;

  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as any;
    if (!room) { res.status(404).json({ error: 'Room not found' }); return; }

    db.prepare(`
      UPDATE rooms SET 
        name = COALESCE(?, name),
        zone = COALESCE(?, zone),
        floor = COALESCE(?, floor),
        capacity = COALESCE(?, capacity)
      WHERE id = ?
    `).run(name || null, zone || null, floor !== undefined ? floor : null, capacity || null, id);

    logActivity({ action: 'ROOM_UPDATED', entityType: 'ROOM', entityId: Number(id), details: `Updated room: ${room.name}` });
    io.emit('admin:room_updated');
    io.emit('room:booking_updated');

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/admin/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id) as any;
    if (!room) { res.status(404).json({ error: 'Room not found' }); return; }

    // Check if room has desks
    const deskCount = (db.prepare('SELECT COUNT(*) as cnt FROM desks WHERE room_id = ?').get(id) as any).cnt;
    if (deskCount > 0) {
      res.status(400).json({ error: `Cannot delete room with ${deskCount} desks. Move or delete desks first.` });
      return;
    }

    // Cancel pending bookings
    db.prepare("UPDATE room_bookings SET status = 'CANCELLED' WHERE room_id = ? AND status IN ('PENDING', 'APPROVED')").run(id);
    db.prepare('DELETE FROM rooms WHERE id = ?').run(id);

    logActivity({ action: 'ROOM_DELETED', entityType: 'ROOM', entityId: Number(id), details: `Deleted room: ${room.name}` });
    io.emit('admin:room_updated');
    io.emit('room:booking_updated');

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Activity Logs (Admin) ────────────────────────────────────────────────────

app.get('/api/admin/activity', (req: Request, res: Response) => {
  try {
    const { action, entity_type, page = '1', limit = '50' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT al.*, u.name as user_name, u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }
    if (entity_type) {
      query += ' AND al.entity_type = ?';
      params.push(entity_type);
    }

    const totalQuery = query.replace('SELECT al.*, u.name as user_name, u.role as user_role', 'SELECT COUNT(*) as cnt');
    const total = (db.prepare(totalQuery).get(...params) as any).cnt;

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const logs = db.prepare(query).all(...params);

    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Enhanced Analytics (Admin) ───────────────────────────────────────────────

app.get('/api/admin/analytics', (_req: Request, res: Response) => {
  try {
    // Student analytics
    const totalStudents = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'STUDENT'").get() as any).cnt;
    const activeStudents = (db.prepare("SELECT COUNT(DISTINCT user_id) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as any).cnt;

    // Staff analytics
    const totalStaff = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role IN ('STAFF', 'ADMIN')").get() as any).cnt;

    // Desk analytics
    const totalDesks = (db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as any).cnt;
    const freeDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'FREE'").get() as any).cnt;
    const occupiedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'OCCUPIED'").get() as any).cnt;
    const awayDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'AWAY'").get() as any).cnt;
    const abandonedDesks = (db.prepare("SELECT COUNT(*) as cnt FROM desks WHERE status = 'ABANDONED'").get() as any).cnt;
    const occupancyRate = totalDesks > 0 ? Math.round(((occupiedDesks + awayDesks) / totalDesks) * 100) : 0;
    const abandonedRate = totalDesks > 0 ? Math.round((abandonedDesks / totalDesks) * 100) : 0;

    // Session analytics
    const totalSessions = (db.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as any).cnt;
    const activeSessions = (db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE status = 'ACTIVE'").get() as any).cnt;
    const avgDurationRow = db.prepare("SELECT AVG((julianday(end_time) - julianday(start_time)) * 24 * 60) as avg_mins FROM sessions WHERE status = 'ENDED'").get() as any;
    const avgDuration = avgDurationRow?.avg_mins ? Math.round(avgDurationRow.avg_mins) : 0;

    // Peak hours
    const peakHours = db.prepare(`
      SELECT strftime('%H', start_time) as hour, COUNT(*) as count 
      FROM sessions GROUP BY hour ORDER BY count DESC LIMIT 5
    `).all();

    // Room analytics
    const totalRooms = (db.prepare('SELECT COUNT(*) as cnt FROM rooms').get() as any).cnt;
    const totalBookings = (db.prepare('SELECT COUNT(*) as cnt FROM room_bookings').get() as any).cnt;
    const pendingBookings = (db.prepare("SELECT COUNT(*) as cnt FROM room_bookings WHERE status = 'PENDING'").get() as any).cnt;
    const approvedBookings = (db.prepare("SELECT COUNT(*) as cnt FROM room_bookings WHERE status = 'APPROVED'").get() as any).cnt;

    const roomUtilization = db.prepare(`
      SELECT r.name, r.capacity, COUNT(b.id) as booking_count
      FROM rooms r LEFT JOIN room_bookings b ON r.id = b.room_id AND b.status IN ('APPROVED', 'COMPLETED')
      GROUP BY r.id ORDER BY booking_count DESC
    `).all();

    // Most used desks
    const mostUsedDesks = db.prepare(`
      SELECT d.label, d.number, COUNT(s.id) as count 
      FROM desks d LEFT JOIN sessions s ON d.id = s.desk_id 
      GROUP BY d.id ORDER BY count DESC LIMIT 5
    `).all();

    res.json({
      students: { total: totalStudents, active: activeStudents },
      staff: { total: totalStaff },
      desks: { total: totalDesks, free: freeDesks, occupied: occupiedDesks, away: awayDesks, abandoned: abandonedDesks, occupancyRate, abandonedRate },
      sessions: { total: totalSessions, active: activeSessions, avgDuration, peakHours },
      rooms: { total: totalRooms, totalBookings, pendingBookings, approvedBookings, utilization: roomUtilization },
      mostUsedDesks,
    });
  } catch (err) {
    console.error('Error fetching admin analytics:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Notifications Management (Admin) ─────────────────────────────────────────

app.get('/api/admin/notifications', (_req: Request, res: Response) => {
  try {
    const notifications = db.prepare(`
      SELECT n.*, u.name as user_name, u.email as user_email 
      FROM notifications n 
      LEFT JOIN users u ON n.user_id = u.id 
      ORDER BY n.created_at DESC LIMIT 200
    `).all();
    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching admin notifications:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/notifications/broadcast', (req: Request, res: Response) => {
  const { title, message, priority, target_role } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: 'Title and message are required' });
    return;
  }

  try {
    let users = [] as any[];
    if (target_role && target_role !== 'ALL') {
      users = db.prepare("SELECT id FROM users WHERE role = ? AND status = 'ACTIVE'").all(target_role);
    } else {
      users = db.prepare("SELECT id FROM users WHERE status = 'ACTIVE'").all();
    }
    
    const insert = db.prepare('INSERT INTO notifications (user_id, type, title, message, priority) VALUES (?, ?, ?, ?, ?)');
    const sendAll = db.transaction(() => {
      for (const u of users) {
        insert.run(u.id, 'SYSTEM_BROADCAST', title, message, priority || 'NORMAL');
      }
    });
    sendAll();
    
    logActivity({ action: 'NOTIFICATION_BROADCAST', entityType: 'SYSTEM', details: `Broadcasted "${title}" to ${users.length} users` });
    io.emit('notification:new');
    
    res.json({ success: true, count: users.length });
  } catch (err) {
    console.error('Error broadcasting notification:', err);
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
    const warningThresholdMinutes = 15; // Warn at 15 minutes away

    // Find sessions close to expiring (15 min away) - send warning
    const warningSessions = db.prepare(`
      SELECT s.id, s.user_id, s.desk_id, d.label as desk_label
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      WHERE s.status = 'ACTIVE'
        AND s.away_start_time IS NOT NULL
        AND (julianday('now') - julianday(s.away_start_time)) * 1440 > ?
        AND (julianday('now') - julianday(s.away_start_time)) * 1440 <= ?
    `).all(warningThresholdMinutes, awayThresholdMinutes) as Array<{ id: number; user_id: number; desk_id: number; desk_label: string }>;

    // Send warning notifications
    for (const session of warningSessions) {
      // Check if warning already sent recently (within last 10 minutes)
      const recentWarning = db.prepare(`
        SELECT id FROM notifications 
        WHERE user_id = ? 
          AND type = 'AWAY_WARNING' 
          AND metadata LIKE ?
          AND (julianday('now') - julianday(created_at)) * 1440 < 10
      `).get(session.user_id, `%"sessionId":${session.id}%`);

      if (!recentWarning) {
        createNotification({
          userId: session.user_id,
          type: 'AWAY_WARNING',
          title: '⚠️ Return Soon!',
          message: `You've been away for 15 minutes at ${session.desk_label}. Return within 5 minutes or your session will expire.`,
          priority: 'HIGH',
          metadata: { sessionId: session.id, deskId: session.desk_id, deskLabel: session.desk_label }
        });
      }
    }

    // Find sessions that should be ended
    const expiredSessions = db.prepare(`
      SELECT s.id, s.user_id, s.desk_id, d.label as desk_label 
      FROM sessions s
      JOIN desks d ON s.desk_id = d.id
      WHERE s.status = 'ACTIVE'
        AND (
          (s.away_start_time IS NOT NULL
           AND (julianday('now') - julianday(s.away_start_time)) * 1440 > ?)
          OR
          (julianday('now') - julianday(s.last_check_in_time)) * 1440 > ?
        )
    `).all(awayThresholdMinutes, inactiveThresholdMinutes) as Array<{ id: number; user_id: number; desk_id: number; desk_label: string }>;

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

      // Emit socket events and create notifications for each expired session
      for (const session of expiredSessions) {
        broadcastDeskUpdate(session.desk_id);
        io.emit('session:expired', { deskId: session.desk_id, sessionId: session.id });

        // Notify student
        createNotification({
          userId: session.user_id,
          type: 'SESSION_EXPIRED',
          title: '❌ Session Expired',
          message: `Your session at ${session.desk_label} has been ended due to inactivity. The desk is now marked as abandoned.`,
          priority: 'HIGH',
          metadata: { sessionId: session.id, deskId: session.desk_id, deskLabel: session.desk_label }
        });

        // Notify staff about abandoned desk
        const staffUsers = db.prepare("SELECT id FROM users WHERE role IN ('STAFF', 'ADMIN')").all() as Array<{ id: number }>;
        for (const staff of staffUsers) {
          createNotification({
            userId: staff.id,
            type: 'ABANDONED_DESK',
            title: '🚨 Abandoned Desk',
            message: `Desk ${session.desk_label} has been abandoned and needs attention.`,
            priority: 'URGENT',
            metadata: { deskId: session.desk_id, deskLabel: session.desk_label, previousSessionId: session.id }
          });
        }
      }
      broadcastAllDesks();
      broadcastAnalytics();
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
httpServer.listen(PORT, () => {
  console.log("?? Locus backend running on http://localhost:");
  console.log("?? Socket.IO server ready for real-time connections");
  console.log("   Endpoints:");
  console.log("     GET  /api/desks          - List all desks");
  console.log("     GET  /api/desks/:id      - Get desk details");
  console.log("     POST /api/check-in       - Check into a desk");
  console.log("     POST /api/away           - Mark as away");
  console.log("     POST /api/here           - Return from away");
  console.log("     POST /api/reset          - Staff reset desk");
  console.log("     POST /api/end-session    - Staff end session");
  console.log("     POST /api/checkout       - Student checkout");
  console.log("     GET  /api/analytics      - Usage stats");
  console.log("     GET  /api/health         - Health check");
});
