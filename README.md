# Gambia Loan

A responsive, step-by-step GMD loan application for The Gambia with MongoDB Atlas accounts and Kenya M-Pesa fee collection.

## Source of truth

The 16 hardcoded products in `app.js` mirror `Gambia_Loan_App_Specification-1.xlsx`:

- Range: **GMD 2,864–100,000**
- Service fee: **5%**
- Terms: **30, 45, 60, 90 or 120 days**
- Starter charge: **GMD 286.50**, treated as an applicable charge and never labelled a government tax

## Local development

```bash
npm run dev
```

The preview server listens on `0.0.0.0:3000` and serves the static app. `npm run build` writes the Vercel-ready output to `dist/`.

## Vercel

The included `vercel.json` uses `npm run build` and publishes `dist/`. No database, API keys or runtime secrets are required.

## Account storage with MongoDB Atlas

The login and account creation pages use the Vercel API routes in `api/auth/`. Passwords are hashed with Node's `scrypt` and never stored in plain text. Successful login creates an HTTP-only session cookie stored in the `sessions` collection. Configure these Vercel variables:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=gambia_loan
```

Create a MongoDB Atlas database user with only the permissions required for this database, add your Vercel deployment IP/network access according to your Atlas policy, and rotate credentials if they are ever exposed. The local app will show an account-service error until `MONGODB_URI` is configured.

## M-Pesa STK payments

The selected architecture is **Gambia loans in GMD + Kenya M-Pesa fee collection in KES**. The wizard carries the selected applicable charge into the KES payment step, then calls the secure payment endpoint so the provider key remains server-side. The current quote rounds the selected charge to a whole KES amount; replace this with an approved FX/fee quote before production. Configure these Vercel variables:

```env
SWIFTWALLET_API_BASE_URL=https://swiftwallet.co.ke/v3
SWIFTWALLET_API_KEY=...
SWIFTWALLET_CALLBACK_URL=https://your-domain.vercel.app/api/swiftwallet/callback
```

Optional: `SWIFTWALLET_CHANNEL_ID` and `SWIFTWALLET_ACCOUNT_NUMBER`. The payment provider’s documentation describes a Kenya M-Pesa gateway with KES amounts and Kenyan phone formats (`07...`, `01...`, `254...` or `+254...`). The callback is persisted in MongoDB and exposed through `/api/swiftwallet/status`. Define how any GMD charge is converted or quoted in KES, who bears FX movement, and whether the borrower is a Kenya-based payer. Never commit the payment provider API key or embed it in `app.js`.

## Important

Before enabling customer lending, confirm lender identity, eligibility and KYC rules, validate all fee/tax/APR/effective-cost treatment, publish the correct support and complaints channels, and obtain appropriate Gambian legal, tax and regulatory review. The application intentionally does not claim approval before lender review. Any pre-disbursement charge must be lawful, disclosed in the agreement, paid only through a verified channel, and reconciled to the correct application reference.
