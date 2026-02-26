import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        emotional_state TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS team_interest (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT DEFAULT '',
        organization TEXT DEFAULT '',
        contribution TEXT DEFAULT '',
        excitement TEXT DEFAULT '',
        skills TEXT DEFAULT '',
        wants_updates BOOLEAN DEFAULT false,
        phone TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    return res.status(200).json({ ok: true, message: 'Tables created successfully' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
