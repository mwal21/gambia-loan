export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const apiKey = process.env.SWIFTWALLET_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'Payment service is not configured.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const rawPhone = String(body?.phone_number || '').replace(/[\s()-]/g, '');
  const normalizedPhone = rawPhone.startsWith('+') ? rawPhone.slice(1) : rawPhone;
  const phoneNumber = /^0(?:1|7)\d{8}$/.test(normalizedPhone) ? `254${normalizedPhone.slice(1)}` : normalizedPhone;
  const amount = Number(body?.amount);
  const application = body?.application && typeof body.application === 'object' ? body.application : {};

  if (!/^254(?:1|7)\d{8}$/.test(phoneNumber)) {
    return res.status(400).json({ success: false, message: 'Enter a valid Kenyan M-Pesa number.' });
  }
  if (!Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({ success: false, message: 'Enter a whole-number fee amount in KES.' });
  }

  const baseUrl = (process.env.SWIFTWALLET_API_BASE_URL || 'https://swiftwallet.co.ke/v3').replace(/\/$/, '');
  const callbackUrl = process.env.SWIFTWALLET_CALLBACK_URL;
  if (!callbackUrl) {
    return res.status(503).json({ success: false, message: 'Payment callback is not configured.' });
  }

  const payload = {
    amount,
    currency: 'KES',
    phone_number: phoneNumber,
    external_reference: `GL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    callback_url: callbackUrl,
  };
  if (process.env.SWIFTWALLET_CHANNEL_ID) payload.channel_id = Number(process.env.SWIFTWALLET_CHANNEL_ID);
  if (process.env.SWIFTWALLET_ACCOUNT_NUMBER) payload.account_number = process.env.SWIFTWALLET_ACCOUNT_NUMBER;

  try {
    const upstream = await fetch(`${baseUrl}/stk-initiate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const responseText = await upstream.text();
    let data;
    try { data = responseText ? JSON.parse(responseText) : {}; } catch { data = {}; }
    if (!upstream.ok) {
      const message = data.message || data.detail || data.error || `Swift Wallet rejected the request (${upstream.status}).`;
      return res.status(502).json({ success: false, message });
    }
    try {
      const { getDb } = await import('../../lib/mongodb.js');
      const db = await getDb();
      await db.collection('payments').updateOne({ reference: payload.external_reference }, { $set: { reference: payload.external_reference, phoneNumber, amount, application, status: 'INITIATED', createdAt: new Date(), updatedAt: new Date() } }, { upsert: true });
    } catch (storageError) { console.warn('Payment status storage unavailable', storageError.message); }
    return res.status(200).json({ ...data, external_reference: data.external_reference || payload.external_reference, status: data.status || 'INITIATED' });
  } catch (error) {
    console.error('Swift Wallet STK initiation failed', error?.message || error);
    return res.status(502).json({ success: false, message: 'Swift Wallet could not be reached. Try again.' });
  }
}
