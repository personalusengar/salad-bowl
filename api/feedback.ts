import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { message, emotionalState } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required' });
      await sql`INSERT INTO feedback (message, emotional_state) VALUES (${message}, ${emotionalState || null})`;
      return res.status(201).json({ ok: true });
    }

    const { rows } = await sql`SELECT * FROM feedback ORDER BY created_at DESC`;
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
