import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const getDbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.saladbowl_DATABASE_URL || process.env.saladbowl_POSTGRES_URL || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const dbUrl = getDbUrl();
    if (!dbUrl) return res.status(500).json({ error: 'No database connection string found' });
    const sql = neon(dbUrl);
    if (req.method === 'POST') {
      const { name, email, interestType, phone, position, organization, comments, contactPermission } = req.body;
      if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
      await sql`
        INSERT INTO team_interest (name, email, interest_type, phone, position, organization, comments, contact_permission)
        VALUES (${name}, ${email}, ${interestType || ''}, ${phone || ''}, ${position || ''}, ${organization || ''}, ${comments || ''}, ${contactPermission || false})
      `;
      return res.status(201).json({ ok: true });
    }

    const rows = await sql`SELECT * FROM team_interest ORDER BY created_at DESC`;
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
