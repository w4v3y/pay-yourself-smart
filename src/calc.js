/*
 * Pay Yourself Smart — LLC vs S-Corp tax engine (2026 federal tax year).
 *
 * Pure functions with no DOM access, so the same code runs in the browser
 * calculator and in the Node test suite.
 */

const TAX2026 = {
  ssBase: 184500,
  std: { single: 16100, mfj: 32200 },
  brackets: {
    single: [[12400, .10], [50400, .12], [105700, .22], [201775, .24], [256225, .32], [640600, .35], [Infinity, .37]],
    mfj:    [[24800, .10], [100800, .12], [211400, .22], [403550, .24], [512450, .32], [768700, .35], [Infinity, .37]]
  },
  addMedicare: { single: 200000, mfj: 250000 },
  qbi: { single: [201750, 75000], mfj: [403500, 150000] },
  futaRate: 0.006, futaBase: 7000
};

/** Progressive federal income tax on taxable income `ti` for filing status `st`. */
function incomeTax(ti, st) {
  let tax = 0, prev = 0;
  for (const [top, rate] of TAX2026.brackets[st]) {
    if (ti > prev) tax += (Math.min(ti, top) - prev) * rate;
    if (ti <= top) break;
    prev = top;
  }
  return tax;
}

/** Section 199A qualified business income deduction, with wage limit and SSTB phase-out. */
function qbiDeduction(qbi, tiBefore, wages, st, sstb) {
  if (qbi <= 0 || tiBefore <= 0) return 0;
  const [thr, range] = TAX2026.qbi[st];
  let d;
  if (tiBefore <= thr) {
    d = 0.2 * qbi;
  } else {
    const pct = Math.min(1, (tiBefore - thr) / range);
    const keep = sstb ? Math.max(0, 1 - pct) : 1;
    const tentative = 0.2 * qbi * keep;
    const wageLimit = 0.5 * wages * keep;
    if (tentative <= wageLimit) d = tentative;
    else if (pct >= 1) d = wageLimit;
    else d = tentative - (tentative - wageLimit) * pct;
  }
  return Math.max(0, Math.min(d, 0.2 * tiBefore));
}

/** Total federal tax for a single-member LLC taxed as a sole proprietorship. */
function asLLC(profit, other, st, sstb) {
  const seBase = Math.max(0, profit) * 0.9235;
  const ss = 0.124 * Math.min(seBase, TAX2026.ssBase);
  const med = 0.029 * seBase;
  const addMed = 0.009 * Math.max(0, seBase - TAX2026.addMedicare[st]);
  const seTax = ss + med + addMed;
  const halfSE = (ss + med) / 2;
  const tiBefore = Math.max(0, profit + other - halfSE - TAX2026.std[st]);
  const qbi = qbiDeduction(Math.max(0, profit - halfSE), tiBefore, 0, st, sstb);
  const it = incomeTax(Math.max(0, tiBefore - qbi), st);
  return { seTax, it, qbi, total: seTax + it };
}

/** Total federal tax plus running costs for the same business taxed as an S-Corp. */
function asSCorp(profit, salary, other, st, sstb, c) {
  const ssWages = Math.min(salary, TAX2026.ssBase);
  const employer = 0.062 * ssWages + 0.0145 * salary;
  const employee = 0.062 * ssWages + 0.0145 * salary + 0.009 * Math.max(0, salary - TAX2026.addMedicare[st]);
  const unemployment = TAX2026.futaRate * Math.min(salary, TAX2026.futaBase) + (salary > 0 ? c.suta : 0);
  const fees = c.payroll + c.cpa + c.state;
  const k1 = profit - salary - employer - unemployment - fees;
  const tiBefore = Math.max(0, salary + k1 + other - TAX2026.std[st]);
  const qbi = qbiDeduction(Math.max(0, k1), tiBefore, salary, st, sstb);
  const it = incomeTax(Math.max(0, tiBefore - qbi), st);
  const fica = employer + employee;
  return { fica, unemployment, fees, it, qbi, k1, total: fica + unemployment + fees + it };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TAX2026, incomeTax, qbiDeduction, asLLC, asSCorp };
}
