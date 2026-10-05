# Gambia Loan

A responsive, no-database GMD loan application for The Gambia with Kenya M-Pesa fee collection.

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

## Swift Wallet STK payments

The selected architecture is **Gambia loans in GMD + Kenya M-Pesa fee collection in KES**. The production UI collects a Kenyan phone number and KES fee amount, then calls `/api/swiftwallet/stk-initiate` so the Swift Wallet key remains server-side. Configure these Vercel variables:

```env
SWIFTWALLET_API_BASE_URL=https://swiftwallet.co.ke/v3
SWIFTWALLET_API_KEY=...
SWIFTWALLET_CALLBACK_URL=https://your-domain.vercel.app/api/swiftwallet/callback
```

Optional: `SWIFTWALLET_CHANNEL_ID` and `SWIFTWALLET_ACCOUNT_NUMBER`. Swift Wallet’s documentation describes a Kenya M-Pesa gateway with KES amounts and Kenyan phone formats (`254...` / `07...`). Define how any GMD fee is converted or quoted in KES, who bears FX movement, and whether the borrower is a Kenya-based payer. The callback endpoint acknowledges status messages; add durable transaction verification and reconciliation before handling production money flows. Never commit the Swift Wallet API key or embed it in `app.js`.

## Important

Before enabling customer lending, confirm lender identity, eligibility and KYC rules, validate all fee/tax/APR/effective-cost treatment, publish the correct support and complaints channels, and obtain appropriate Gambian legal, tax and regulatory review.
