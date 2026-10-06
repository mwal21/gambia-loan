import { randomBytes } from 'node:crypto';
import { getDb, setSessionCookie } from '../../lib/mongodb.js';
import { hashPassword } from '../../lib/password.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const name = String(body.name || '').trim(); const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || '');
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ message: 'Enter a valid name, email and password of at least 8 characters.' });
  try { const db = await getDb(); const users = db.collection('users'); if (await users.findOne({ email })) return res.status(409).json({ message: 'An account with this email already exists.' }); const result = await users.insertOne({ name, email, passwordHash: await hashPassword(password), createdAt: new Date() }); const token = randomBytes(32).toString('hex'); await db.collection('sessions').insertOne({ token, userId: result.insertedId, createdAt: new Date(), expiresAt: new Date(Date.now() + 2592000000) }); setSessionCookie(res, token); return res.status(201).json({ user: { id: result.insertedId.toString(), name, email } }); } catch (error) { console.error('Registration failed', error.message); return res.status(503).json({ message: error.message.includes('MongoDB') ? error.message : 'Account service is temporarily unavailable.' }); }
}
