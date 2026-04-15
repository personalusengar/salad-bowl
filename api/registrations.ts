import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const ADMIN_EMAILS = ['urvi@saladbowl.life', 'akriti@saladbowl.life', 'admin@saladbowl.life'];
const getDbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.saladbowl_DATABASE_URL || process.env.saladbowl_POSTGRES_URL || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Email');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminEmail = req.headers['x-admin-email'] as string;
  if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const dbUrl = getDbUrl();
  if (!dbUrl) return res.status(500).json({ error: 'No database URL' });

  try {
    const sql = neon(dbUrl);

    if (req.method === 'DELETE') {
      const { emails } = req.body || {};
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ error: 'Provide an array of emails to delete' });
      }
      const deleted = await sql`DELETE FROM teachers WHERE email = ANY(${emails}) RETURNING email`;
      return res.status(200).json({ deleted: deleted.map((r: any) => r.email), count: deleted.length });
    }

    const rows = await sql`SELECT id, name, email, school, created_at FROM teachers ORDER BY created_at DESC`;
    return res.status(200).json({ registrations: rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Database error' });
  }
}
