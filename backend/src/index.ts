import express from 'express';
import cors from 'cors';
import { pool, initDB } from './db';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Initialize DB on start
initDB();

// API Routes
app.get('/api/desks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM desks ORDER BY number ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/check-in', async (req, res) => {
  const { deskNumber, studentId } = req.body;
  try {
    const deskRes = await pool.query('SELECT * FROM desks WHERE number = $1', [deskNumber]);
    if (deskRes.rowCount === 0) {
      return res.status(404).json({ error: 'Desk not found' });
    }
    const desk = deskRes.rows[0];
    if (desk.status !== 'FREE') {
      return res.status(400).json({ error: 'Desk is not free' });
    }
    
    const sessionRes = await pool.query(
      `INSERT INTO sessions (desk_id, student_id, status) VALUES ($1, $2, 'ACTIVE') RETURNING id`,
      [desk.id, studentId]
    );
    const sessionId = sessionRes.rows[0].id;
    
    await pool.query(
      `UPDATE desks SET status = 'OCCUPIED', current_session_id = $1 WHERE id = $2`,
      [sessionId, desk.id]
    );
    
    res.json({ success: true, sessionId });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/away', async (req, res) => {
  const { sessionId } = req.body;
  try {
    await pool.query(
      `UPDATE sessions SET away_start_time = NOW() WHERE id = $1 AND status = 'ACTIVE'`,
      [sessionId]
    );
    await pool.query(
      `UPDATE desks SET status = 'AWAY' WHERE current_session_id = $1`,
      [sessionId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/here', async (req, res) => {
  const { sessionId } = req.body;
  try {
    await pool.query(
      `UPDATE sessions SET away_start_time = NULL, last_check_in_time = NOW() WHERE id = $1 AND status = 'ACTIVE'`,
      [sessionId]
    );
    await pool.query(
      `UPDATE desks SET status = 'OCCUPIED' WHERE current_session_id = $1`,
      [sessionId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/reset', async (req, res) => {
  const { deskId } = req.body;
  try {
    await pool.query(
      `UPDATE desks SET status = 'FREE', current_session_id = NULL WHERE id = $1`,
      [deskId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Simple sweeper function to mark Abandoned desks
const sweepAbandonedDesks = async () => {
  try {
    // 2-hour timeout for check-ins, 20-minute timeout for away
    await pool.query(`
      UPDATE sessions 
      SET status = 'ENDED', end_time = NOW()
      WHERE status = 'ACTIVE' 
        AND ((away_start_time IS NOT NULL AND NOW() - away_start_time > interval '20 minutes')
             OR (NOW() - last_check_in_time > interval '2 hours'));
    `);

    await pool.query(`
      UPDATE desks 
      SET status = 'ABANDONED', current_session_id = NULL
      WHERE current_session_id IN (
        SELECT id FROM sessions WHERE status = 'ENDED'
      ) AND status != 'ABANDONED' AND status != 'FREE';
    `);
  } catch (err) {
    console.error('Sweeper error:', err);
  }
};

// Run sweeper every minute
setInterval(sweepAbandonedDesks, 60000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
