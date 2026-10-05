export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ received: false, message: 'Method not allowed.' });
  // Keep the callback fast. Add durable transaction verification before production rollout.
  console.log('Swift Wallet callback received', { status: req.body?.status, transaction_id: req.body?.transaction_id, external_reference: req.body?.external_reference });
  return res.status(200).json({ received: true });
}
