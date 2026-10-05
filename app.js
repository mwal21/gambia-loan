const products = [
  { name: 'Starter', amount: 2864, term: 30, fee: 143.2, tax: 286.5, repayment: 3293.7, note: 'The smallest loan amount.', taxCaption: 'Starter charge' },
  { name: 'Starter Plus', amount: 3500, term: 30, fee: 175, tax: 350, repayment: 4025, note: 'A little more room for the month.' },
  { name: 'Basic', amount: 5000, term: 30, fee: 250, tax: 500, repayment: 5750, note: 'A straightforward everyday option.' },
  { name: 'Basic Plus', amount: 7500, term: 30, fee: 375, tax: 750, repayment: 8625, note: 'For a plan with a few more moving parts.' },
  { name: 'Standard', amount: 10000, term: 45, fee: 500, tax: 1000, repayment: 11500, note: 'A 45-day option for a little more room.' },
  { name: 'Standard Plus', amount: 15000, term: 45, fee: 750, tax: 1500, repayment: 17250, note: 'More breathing space, same clear view.' },
  { name: 'Plus', amount: 20000, term: 60, fee: 1000, tax: 2000, repayment: 23000, note: 'A longer repayment period for a bigger plan.' },
  { name: 'Plus 25', amount: 25000, term: 60, fee: 1250, tax: 2500, repayment: 28750, note: 'For an investment in your next step.' },
  { name: 'Growth', amount: 30000, term: 60, fee: 1500, tax: 3000, repayment: 34500, note: 'An option for forward motion.' },
  { name: 'Growth 35', amount: 35000, term: 60, fee: 1750, tax: 3500, repayment: 40250, note: 'A little more scale for a clear plan.' },
  { name: 'Premium', amount: 40000, term: 90, fee: 2000, tax: 4000, repayment: 46000, note: 'A 90-day repayment period.' },
  { name: 'Premium 50', amount: 50000, term: 90, fee: 2500, tax: 5000, repayment: 57500, note: 'For plans with a longer horizon.' },
  { name: 'Business 60', amount: 60000, term: 90, fee: 3000, tax: 6000, repayment: 69000, note: 'A larger business loan option.' },
  { name: 'Business 75', amount: 75000, term: 90, fee: 3750, tax: 7500, repayment: 86250, note: 'For a well-considered growth plan.' },
  { name: 'Business 85', amount: 85000, term: 120, fee: 4250, tax: 8500, repayment: 97750, note: 'A 120-day repayment period.' },
  { name: 'Maximum', amount: 100000, term: 120, fee: 5000, tax: 10000, repayment: 115000, note: 'The maximum loan amount.', max: true },
];

const money = (value) => `GMD ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const whole = (value) => Number(value).toLocaleString('en-US');
const amountRange = document.querySelector('#amount-range');
const amountOutput = document.querySelector('#amount-output');
const productName = document.querySelector('#product-name');
const productNote = document.querySelector('#product-note');
const productTerm = document.querySelector('#product-term');
const totalRepayment = document.querySelector('#total-repayment');
const dueDate = document.querySelector('#due-date');
const principalValue = document.querySelector('#principal-value');
const serviceFee = document.querySelector('#service-fee');
const taxValue = document.querySelector('#tax-value');
const taxCaption = document.querySelector('#tax-caption');
const totalCost = document.querySelector('#total-cost');
const effectiveCost = document.querySelector('#effective-cost');
const productRows = document.querySelector('#product-rows');
const mobileProductList = document.querySelector('#mobile-product-list');
let selectedProduct = products[4];

function nearestProduct(amount) {
  return products.reduce((closest, product) => Math.abs(product.amount - amount) < Math.abs(closest.amount - amount) ? product : closest, products[0]);
}

function getDueDate(term) {
  const date = new Date();
  date.setDate(date.getDate() + term);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderResult(product) {
  selectedProduct = product;
  amountRange.value = product.amount;
  amountOutput.textContent = whole(product.amount);
  productName.textContent = product.name;
  productNote.textContent = product.note;
  productTerm.textContent = `${product.term} days`;
  totalRepayment.textContent = money(product.repayment);
  dueDate.textContent = getDueDate(product.term);
  principalValue.textContent = money(product.amount);
  serviceFee.textContent = money(product.fee);
  taxValue.textContent = money(product.tax);
  taxCaption.textContent = product.taxCaption || 'Subject to law';
  totalCost.textContent = money(product.repayment - product.amount);
  effectiveCost.innerHTML = `${(((product.repayment - product.amount) / product.amount) * (365 / product.term) * 100).toFixed(2)}% <sup>simple annualized</sup>`;
  document.querySelectorAll('.quick-amounts button').forEach((button) => button.classList.toggle('active', Number(button.dataset.amount) === product.amount));
  updateDemo();
}

function renderProducts() {
  productRows.innerHTML = products.map((product) => `<tr><td>${product.name}${product.max ? ' <span class="table-badge">MAX</span>' : ''}</td><td>${money(product.amount)}</td><td>${product.term} days</td><td>${money(product.fee)}</td><td>${money(product.repayment)}</td><td><button class="select-product" data-product="${product.amount}">View option ↗</button></td></tr>`).join('');
  mobileProductList.innerHTML = products.map((product) => `<article class="mobile-product-card"><div><strong>${product.name}</strong><span>${money(product.amount)} · ${product.term} days</span></div><span class="mobile-repay">${money(product.repayment)}</span><button data-product="${product.amount}">View option ↗</button></article>`).join('');
  document.querySelectorAll('[data-product]').forEach((button) => button.addEventListener('click', () => { renderResult(products.find((product) => product.amount === Number(button.dataset.product))); document.querySelector('#calculator').scrollIntoView({ behavior: 'smooth' }); }));
}

amountRange.addEventListener('input', (event) => renderResult(nearestProduct(Number(event.target.value))));
document.querySelectorAll('.quick-amounts button').forEach((button) => button.addEventListener('click', () => renderResult(products.find((product) => product.amount === Number(button.dataset.amount)))));
renderProducts();
renderResult(selectedProduct);

const modal = document.querySelector('#demo-modal');
const steps = [...document.querySelectorAll('[data-demo-step]')];
const progress = [...document.querySelectorAll('.demo-progress span')];
let currentStep = 1;
function updateDemo() {
  document.querySelector('#demo-amount').textContent = money(selectedProduct.amount);
  document.querySelector('#demo-product').textContent = `${selectedProduct.name} · ${selectedProduct.term} days`;
  document.querySelector('#demo-principal').textContent = money(selectedProduct.amount);
  document.querySelector('#demo-fee').textContent = money(selectedProduct.fee);
  document.querySelector('#demo-tax').textContent = money(selectedProduct.tax);
  document.querySelector('#demo-total').textContent = money(selectedProduct.repayment);
}
function showStep(step) {
  currentStep = step;
  steps.forEach((element) => { element.hidden = Number(element.dataset.demoStep) !== step; });
  progress.forEach((element, index) => element.classList.toggle('active', index < step));
}
function openDemo() { updateDemo(); showStep(1); modal.hidden = false; document.querySelector('.modal-close').focus(); }
function closeDemo() { modal.hidden = true; }
document.querySelectorAll('[data-open-demo]').forEach((button) => button.addEventListener('click', openDemo));
document.querySelectorAll('[data-close-demo]').forEach((button) => button.addEventListener('click', closeDemo));
document.querySelectorAll('[data-next-demo]').forEach((button) => button.addEventListener('click', () => showStep(Math.min(4, currentStep + 1))));
const stkForm = document.querySelector('#stk-form');
const stkStatus = document.querySelector('#stk-status');
const stkSubmit = document.querySelector('#stk-submit');
function normalizeKenyanPhone(value) {
  const compact = value.replace(/[\s()-]/g, '');
  const normalized = compact.startsWith('+') ? compact.slice(1) : compact;
  if (/^0(?:1|7)\d{8}$/.test(normalized)) return `254${normalized.slice(1)}`;
  if (/^254(?:1|7)\d{8}$/.test(normalized)) return normalized;
  return null;
}
stkForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const phone = normalizeKenyanPhone(document.querySelector('#stk-phone').value);
  const amount = Number(document.querySelector('#stk-amount').value);
  if (!phone) { stkStatus.textContent = 'Enter a valid Kenyan M-Pesa number.'; stkStatus.className = 'form-status error'; return; }
  if (!Number.isInteger(amount) || amount < 1) { stkStatus.textContent = 'Enter a whole-number fee amount in KES.'; stkStatus.className = 'form-status error'; return; }
  stkSubmit.disabled = true;
  stkStatus.textContent = 'Sending the STK prompt…';
  stkStatus.className = 'form-status';
  try {
    const response = await fetch('/api/swiftwallet/stk-initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone_number: phone, amount }) });
    const data = await response.json();
    if (!response.ok || data.success === false) throw new Error(data.message || 'The payment request could not be started.');
    stkStatus.textContent = data.message || 'STK prompt sent. Check the phone and enter the M-Pesa PIN.';
    stkStatus.className = 'form-status success';
  } catch (error) {
    stkStatus.textContent = error.message || 'Unable to send the STK prompt. Try again.';
    stkStatus.className = 'form-status error';
  } finally { stkSubmit.disabled = false; }
});
modal.addEventListener('click', (event) => { if (event.target === modal) closeDemo(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeDemo(); });
