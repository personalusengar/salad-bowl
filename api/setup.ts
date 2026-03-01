import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const getDbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.saladbowl_DATABASE_URL || process.env.saladbowl_POSTGRES_URL || '';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const dbUrl = getDbUrl();
    if (!dbUrl) {
      const envKeys = Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('NEON') || k.includes('PG'));
      return res.status(500).json({ error: 'No database URL found', checked: ['DATABASE_URL', 'POSTGRES_URL', 'NEON_DATABASE_URL', 'POSTGRES_URL_NON_POOLING'], found_related_vars: envKeys });
    }
    const sql = neon(dbUrl);
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
