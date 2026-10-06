import { MongoClient } from 'mongodb';

let cached;
export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MongoDB is not configured. Set MONGODB_URI in Vercel.');
  if (!cached) {
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 });
    cached = client.connect().then(() => client.db(process.env.MONGODB_DB || 'gambia_loan'));
  }
  return cached;
}
export function parseCookies(header = '') { return Object.fromEntries(header.split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter(([key, value]) => key && value)); }
export function setSessionCookie(res, token) { res.setHeader('Set-Cookie', `gambia_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`); }
export function clearSessionCookie(res) { res.setHeader('Set-Cookie', 'gambia_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'); }
export async function sessionUser(req) { const cookies = parseCookies(req.headers?.cookie); if (!cookies.gambia_session) return null; const db = await getDb(); const session = await db.collection('sessions').findOne({ token: cookies.gambia_session, expiresAt: { $gt: new Date() } }); if (!session) return null; return db.collection('users').findOne({ _id: session.userId }, { projection: { passwordHash: 0 } }); }
