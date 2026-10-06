import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const read = (file) => readFileSync(resolve(root, file), 'utf8');

const app = read('app.js');
const html = read('index.html');
const css = read('styles.css');
const manifest = JSON.parse(read('manus-routes.json'));

const productBlock = app.match(/const products = \[(.*?)\n\];/s)?.[1] ?? '';
const products = [...productBlock.matchAll(/\{ name: '([^']+)', amount: (\d+), term: (\d+), fee: ([\d.]+), tax: ([\d.]+), repayment: ([\d.]+)/g)].map((match) => ({
  name: match[1], amount: Number(match[2]), term: Number(match[3]), fee: Number(match[4]), tax: Number(match[5]), repayment: Number(match[6]),
}));

assert.equal(products.length, 16, 'The hardcoded product catalog must contain 16 products');
assert.equal(products[0].amount, 2864, 'Minimum loan must be GMD 2,864');
assert.equal(products.at(-1).amount, 100000, 'Maximum loan must be GMD 100,000');
for (const product of products) {
  assert.equal(Number((product.amount + product.fee + product.tax).toFixed(2)), product.repayment, `${product.name} repayment does not reconcile`);
}

assert(html.includes('id="login-form"'), 'Login form is missing');
assert(html.includes('id="register-form"'), 'Account creation form is missing');
assert(html.includes('data-step="2"'), 'Country step is missing');
assert(html.includes('data-purpose="Personal loan"'), 'Personal loan choice is missing');
assert(html.includes('data-purpose="Business loan"'), 'Business loan choice is missing');
assert(html.includes('data-purpose="Hospital loan"'), 'Hospital loan choice is missing');
assert(html.includes('id="loan-options"'), 'Loan amount selection is missing');
assert(html.includes('id="review-confirm"'), 'Loan review confirmation is missing');
assert(html.includes('data-delivery="Bank account"'), 'Bank delivery choice is missing');
assert(html.includes('data-delivery="Airtel Money"'), 'Airtel Money delivery choice is missing');
assert(html.includes('id="payment-form"'), 'Payment form is missing');
assert(html.includes('data-step="10"'), 'Disbursement progress screen is missing');
assert(html.includes('data-step="11"'), 'Payment failure screen is missing');
assert(html.includes('id="payment-phone"'), 'Kenyan phone field is missing');
assert(app.includes('paymentFeeKes(state.product)'), 'Selected product fee is not connected to payment amount');
assert(app.includes("api('/api/swiftwallet/stk-initiate'"), 'Frontend is not connected to the STK endpoint');
assert(!/support@example|prototype|illustrative|This is a design and product prototype/i.test(html), 'Legacy placeholder copy remains in the customer-facing page');
assert(css.length > 10000 && css.includes('.loan-option') && css.includes('.waiting-card'), 'Wizard stylesheet is missing');
assert.deepEqual(manifest.routes, [{ path: '/', title: 'Gambia Loan' }], 'Route manifest is incorrect');
for (const file of ['dist/index.html', 'dist/styles.css', 'dist/app.js', 'dist/logo.svg', 'api/auth/register.js', 'api/auth/login.js', 'api/auth/logout.js', 'api/auth/me.js', 'api/swiftwallet/stk-initiate.js', 'api/swiftwallet/status.js', 'api/swiftwallet/callback.js', 'lib/mongodb.js', 'lib/password.js']) {
  assert(existsSync(resolve(root, file)) && statSync(resolve(root, file)).size > 0, `Missing build/runtime file: ${file}`);
}

process.env.SWIFTWALLET_API_KEY = 'test-key';
process.env.SWIFTWALLET_API_BASE_URL = 'https://swiftwallet.test/v3';
process.env.SWIFTWALLET_CALLBACK_URL = 'https://gambia-loan.test/api/swiftwallet/callback';
let lastRequest;
globalThis.fetch = async (url, options) => {
  lastRequest = { url, options, body: JSON.parse(options.body) };
  return { ok: true, text: async () => JSON.stringify({ success: true, status: 'INITIATED', message: 'sent' }) };
};
const { default: stkHandler } = await import('../api/swiftwallet/stk-initiate.js');
const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
for (const [input, expected] of [['0712345678', '254712345678'], ['0112345678', '254112345678'], ['254712345678', '254712345678'], ['+254112345678', '254112345678']]) {
  const res = response();
  await stkHandler({ method: 'POST', body: { phone_number: input, amount: 100 } }, res);
  assert.equal(res.statusCode, 200, `${input} should be accepted`);
  assert.equal(lastRequest.body.phone_number, expected, `${input} should normalize to ${expected}`);
}
assert.equal(lastRequest.body.currency, 'KES', 'STK request must declare KES currency');
const invalid = response();
await stkHandler({ method: 'POST', body: { phone_number: '0201234567', amount: 100 } }, invalid);
assert.equal(invalid.statusCode, 400, 'Invalid Kenyan phone should be rejected');

console.log(`Production checks passed: ${products.length} products, reconciled pricing, STK formats, build assets and copy audit.`);
