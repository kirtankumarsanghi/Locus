import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'locus.db');

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'password123',
      role TEXT NOT NULL DEFAULT 'STUDENT' CHECK(role IN ('STUDENT', 'STAFF', 'ADMIN')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      zone TEXT NOT NULL,
      floor INTEGER NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 1,
      noise_level TEXT DEFAULT 'Moderate',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS desks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER UNIQUE NOT NULL,
      label TEXT NOT NULL,
      room_id INTEGER REFERENCES rooms(id),
      status TEXT NOT NULL DEFAULT 'FREE' CHECK(status IN ('FREE','OCCUPIED','AWAY','ABANDONED')),
      current_session_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      desk_id INTEGER NOT NULL REFERENCES desks(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ENDED')),
      start_time TEXT DEFAULT (datetime('now')),
      away_start_time TEXT,
      last_check_in_time TEXT DEFAULT (datetime('now')),
      end_time TEXT
    );

    CREATE TABLE IF NOT EXISTS room_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED','CANCELLED','COMPLETED')),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL CHECK(type IN ('SESSION_STARTED','AWAY_WARNING','SESSION_EXPIRED','BOOKING_REMINDER','ABANDONED_DESK','NEW_BOOKING','SYSTEM_ALERT')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'NORMAL' CHECK(priority IN ('LOW','NORMAL','HIGH','URGENT')),
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: Add department and status columns to users table
  const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const columnNames = userColumns.map(c => c.name);

  if (!columnNames.includes('department')) {
    db.exec(`ALTER TABLE users ADD COLUMN department TEXT DEFAULT 'General'`);
    console.log('Migration: Added department column to users');
  }
  if (!columnNames.includes('status')) {
    db.exec(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE'`);
    console.log('Migration: Added status column to users');
  }

  // Migration: Add noise_level column to rooms table
  const roomColumns = db.prepare("PRAGMA table_info(rooms)").all() as Array<{ name: string }>;
  const roomColumnNames = roomColumns.map(c => c.name);

  if (!roomColumnNames.includes('noise_level')) {
    db.exec(`ALTER TABLE rooms ADD COLUMN noise_level TEXT DEFAULT 'Moderate'`);
    console.log('Migration: Added noise_level column to rooms');
  }

  // Seed settings
  db.exec(`
    INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('library_hours', '{"open": "08:00", "close": "22:00"}'),
    ('max_away_minutes', '20'),
    ('max_inactive_minutes', '120'),
    ('library_name', 'Main Library'),
    ('location', 'Main Campus'),
    ('total_desks', '8'),
    ('away_timeout', '30'),
    ('auto_release', '60'),
    ('open_time', '07:00'),
    ('close_time', '23:00');
  `);

  // Seed demo users
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (userCount.cnt === 0) {
    db.exec(`
      INSERT INTO users (student_id, name, email, password, role) VALUES 
      ('DEMO-STUDENT', 'Demo Student', 'student@locus.edu', 'password123', 'STUDENT'),
      ('DEMO-STAFF', 'Demo Staff', 'staff@locus.edu', 'password123', 'STAFF'),
      ('DEMO-ADMIN', 'Demo Admin', 'admin@locus.edu', 'password123', 'ADMIN');
    `);
    console.log('Seeded 3 demo users');
  }

  // Seed default rooms if empty
  const roomCount = db.prepare('SELECT COUNT(*) as cnt FROM rooms').get() as { cnt: number };
  if (roomCount.cnt === 0) {
    db.exec(`
      INSERT INTO rooms (name, zone, floor, capacity, noise_level) VALUES 
      ('Main Reading Room A', 'A', 2, 50, 'Quiet'),
      ('Quiet Study Zone B', 'B', 2, 30, 'Quiet'),
      ('Discussion Room 1', 'C', 3, 4, 'Collaborative');
    `);
    console.log('Seeded 3 rooms');
  }

  // Seed desks if table is empty
  const count = db.prepare('SELECT COUNT(*) as cnt FROM desks').get() as { cnt: number };
  if (count.cnt === 0) {
    const insert = db.prepare(
      'INSERT INTO desks (number, label, room_id, status) VALUES (?, ?, ?, ?)'
    );
    const seedDesks = db.transaction(() => {
      // Assuming Room 1 is 'Main Reading Room A'
      for (let i = 1; i <= 4; i++) {
        insert.run(i, `A-${(10 + i).toString().padStart(2, '0')}`, 1, 'FREE');
      }
      // Assuming Room 2 is 'Quiet Study Zone B'
      for (let i = 5; i <= 8; i++) {
        insert.run(i, `B-${(i - 4).toString().padStart(2, '0')}`, 2, 'FREE');
      }
    });
    seedDesks();
    console.log('Seeded 8 desks');
  }

  console.log('Database initialized');
}

export default db;
