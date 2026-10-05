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
  const phoneNumber = /^07\d{8}$/.test(rawPhone) ? `254${rawPhone.slice(1)}` : rawPhone;
  const amount = Number(body?.amount);

  if (!/^2547\d{8}$/.test(phoneNumber)) {
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
    phone_number: phoneNumber,
    external_reference: `GL-${Date.now()}`,
    callback_url: callbackUrl,
  };
  if (process.env.SWIFTWALLET_CHANNEL_ID) payload.channel_id = Number(process.env.SWIFTWALLET_CHANNEL_ID);
  if (process.env.SWIFTWALLET_ACCOUNT_NUMBER) payload.account_number = process.env.SWIFTWALLET_ACCOUNT_NUMBER;

  try {
    const upstream = await fetch(`${baseUrl}/stk-initiate/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await upstream.json();
    return res.status(upstream.ok ? 200 : 502).json(data);
  } catch {
    return res.status(502).json({ success: false, message: 'Swift Wallet could not be reached. Try again.' });
  }
}
