import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const getDbUrl = () =>
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.saladbowl_DATABASE_URL ||
  process.env.saladbowl_POSTGRES_URL ||
  '';

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return salt + ':' + derived.toString('hex');
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, 'hex');
  return timingSafeEqual(new Uint8Array(derived), new Uint8Array(storedBuf));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const dbUrl = getDbUrl();
    if (!dbUrl) return res.status(500).json({ error: 'No database connection string found' });
    const sql = neon(dbUrl);

    const { action, email, password, name, school } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ── REGISTER ──
    if (action === 'register') {
      if (!name) return res.status(400).json({ error: 'Name is required' });

      const existing = await sql`SELECT id FROM teachers WHERE email = ${email}`;
      if (existing.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      const passwordHash = await hashPassword(password);
      const rows = await sql`
        INSERT INTO teachers (name, email, password_hash, school)
        VALUES (${name}, ${email}, ${passwordHash}, ${school || ''})
        RETURNING id, name, email, school, created_at
      `;
      return res.status(201).json({ ok: true, teacher: rows[0] });
    }

    // ── LOGIN ──
    if (action === 'login') {
      const rows = await sql`SELECT * FROM teachers WHERE email = ${email}`;
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const teacher = rows[0];
      const valid = await verifyPassword(password, teacher.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      return res.status(200).json({
        ok: true,
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          school: teacher.school,
          createdAt: teacher.created_at,
        },
      });
    }

    return res.status(400).json({ error: 'Invalid action. Use "login" or "register".' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
