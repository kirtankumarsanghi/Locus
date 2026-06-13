import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create tables if they don't exist
export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS desks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'FREE',
        current_session_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        desk_id UUID REFERENCES desks(id),
        student_id VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        start_time TIMESTAMP DEFAULT NOW(),
        away_start_time TIMESTAMP,
        last_check_in_time TIMESTAMP DEFAULT NOW(),
        end_time TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database', err);
  } finally {
    client.release();
  }
};
