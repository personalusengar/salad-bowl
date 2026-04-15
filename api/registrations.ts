import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const ADMIN_EMAILS = ['urvi@saladbowl.life', 'akriti@saladbowl.life', 'admin@saladbowl.life'];
const getDbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.saladbowl_DATABASE_URL || process.env.saladbowl_POSTGRES_URL || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminEmail = req.headers['x-admin-email'] as string;
  if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const dbUrl = getDbUrl();
  if (!dbUrl) return res.status(500).json({ error: 'No database URL' });

  const sql = neon(dbUrl);
  const rows = await sql`SELECT id, name, email, school, created_at FROM teachers ORDER BY created_at DESC`;
  return res.status(200).json(rows);
}
