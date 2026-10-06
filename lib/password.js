import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export async function hashPassword(password) { const salt = randomBytes(16).toString('hex'); const derived = await scrypt(password, salt, 64); return `${salt}:${derived.toString('hex')}`; }
export async function verifyPassword(password, stored) { const [salt, key] = String(stored || '').split(':'); if (!salt || !key) return false; const derived = await scrypt(password, salt, 64); const expected = Buffer.from(key, 'hex'); return expected.length === derived.length && timingSafeEqual(expected, derived); }
