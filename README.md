# Gambia Loan

A responsive, no-database prototype for exploring illustrative GMD-denominated loan products in The Gambia.

## Source of truth

The 16 hardcoded products in `app.js` mirror `Gambia_Loan_App_Specification-1.xlsx`:

- Range: **GMD 2,864–100,000**
- Illustrative service fee: **5%**
- Terms: **30, 45, 60, 90 or 120 days**
- Starter example charge: **GMD 286.50**, shown as an illustrative tax/charge and never labelled a government tax

## Local development

```bash
npm run dev
```

The preview server listens on `0.0.0.0:3000` and serves the static app. `npm run build` writes the Vercel-ready output to `dist/`.

## Vercel

The included `vercel.json` uses `npm run build` and publishes `dist/`. No database, API keys or runtime secrets are required.

## Swift Wallet handoff

Swift Wallet is intentionally **not called from the browser** in this prototype. When payment collection is added on Vercel, place the Swift Wallet secret in Vercel Environment Variables and call the provider from a Vercel serverless function or other server-side route. The browser should receive only a short-lived, non-sensitive payment state or redirect URL. Add signature verification for callbacks, idempotency protection, amount/currency validation, timeout handling and a user-visible receipt state before enabling real fee payments. Never commit the Swift Wallet API key or embed it in `app.js`.

## Important

This is a design and product prototype. It does not submit applications, collect real customer data or provide financial advice. Before production use, replace sample lender details and support contacts, confirm eligibility and KYC rules, validate all fee/tax/APR/effective-cost treatment, and obtain appropriate Gambian legal, tax and regulatory review.
