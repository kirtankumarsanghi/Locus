import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'locus.db');

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS desks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER UNIQUE NOT NULL,
      label TEXT NOT NULL,
      zone TEXT NOT NULL DEFAULT 'A',
      floor INTEGER NOT NULL DEFAULT 2,
      status TEXT NOT NULL DEFAULT 'FREE' CHECK(status IN ('FREE','OCCUPIED','AWAY','ABANDONED')),
      current_session_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desk_id INTEGER NOT NULL REFERENCES desks(id),
      student_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ENDED')),
      start_time TEXT DEFAULT (datetime('now')),
      away_start_time TEXT,
      last_check_in_time TEXT DEFAULT (datetime('now')),
      end_time TEXT
    );
  `);

  // Seed desks if table is empty
  const count = db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as { cnt: number };
  if (count.cnt === 0) {
    const insert = db.prepare(
      'INSERT INTO desks (number, label, zone, floor, status) VALUES (?, ?, ?, ?, ?)'
    );
    const seedDesks = db.transaction(() => {
      // Zone A desks (1-4)
      for (let i = 1; i <= 4; i++) {
        insert.run(i, `A-${(10 + i).toString().padStart(2, '0')}`, 'A', 2, 'FREE');
      }
      // Zone B desks (5-8)
      for (let i = 5; i <= 8; i++) {
        insert.run(i, `B-${(i - 4).toString().padStart(2, '0')}`, 'B', 2, 'FREE');
      }
    });
    seedDesks();
    console.log('Seeded 8 desks');
  }

  console.log('Database initialized');
}

export default db;
