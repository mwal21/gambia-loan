import { randomBytes } from 'node:crypto';
import { getDb, setSessionCookie } from '../../lib/mongodb.js';
import { verifyPassword } from '../../lib/password.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || '');
  try { const db = await getDb(); const user = await db.collection('users').findOne({ email }); if (!user || !(await verifyPassword(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' }); const token = randomBytes(32).toString('hex'); await db.collection('sessions').insertOne({ token, userId: user._id, createdAt: new Date(), expiresAt: new Date(Date.now() + 2592000000) }); setSessionCookie(res, token); return res.status(200).json({ user: { id: user._id.toString(), name: user.name, email: user.email } }); } catch (error) { console.error('Login failed', error.message); return res.status(503).json({ message: error.message.includes('MongoDB') ? error.message : 'Account service is temporarily unavailable.' }); }
}
