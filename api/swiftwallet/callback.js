import { getDb } from '../../lib/mongodb.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ received: false, message: 'Method not allowed.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const reference = String(body.external_reference || body.reference || '');
  const rawStatus = String(body.status || body.transaction_status || '').toUpperCase();
  const status = ['SUCCESS', 'PAID', 'COMPLETED'].includes(rawStatus) ? 'SUCCESS' : ['FAILED', 'CANCELLED', 'REJECTED'].includes(rawStatus) ? 'FAILED' : 'PENDING';
  try { const db = await getDb(); if (reference) await db.collection('payments').updateOne({ reference }, { $set: { status, providerPayload: body, updatedAt: new Date() } }); } catch (error) { console.error('Callback persistence failed', error.message); return res.status(503).json({ received: false }); }
  return res.status(200).json({ received: true });
}
