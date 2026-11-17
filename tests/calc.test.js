// Run with: node --test
// Checks the tax engine against the figures published in the break-even article.
const test = require("node:test");
const assert = require("node:assert/strict");
const { incomeTax, qbiDeduction, asLLC, asSCorp } = require("../src/calc.js");

const COSTS = { payroll: 660, cpa: 1200, suta: 300, state: 0 };
const savings = (profit, salary, st = "single", other = 0, sstb = false) =>
  asLLC(profit, other, st, sstb).total - asSCorp(profit, salary, other, st, sstb, COSTS).total;
const round = Math.round;

test("income tax follows the 2026 single brackets", () => {
  assert.equal(incomeTax(0, "single"), 0);
  assert.equal(incomeTax(12400, "single"), 1240);
  assert.equal(round(incomeTax(50400, "single")), 1240 + 4560);
});

test("QBI deduction is 20% of business income below the threshold", () => {
  assert.equal(qbiDeduction(50000, 100000, 0, "single", false), 10000);
  assert.equal(qbiDeduction(50000, 20000, 0, "single", false), 4000); // capped at 20% of taxable income
  assert.equal(qbiDeduction(0, 100000, 0, "single", false), 0);
});

test("service businesses lose QBI above the phase-out range", () => {
  assert.equal(qbiDeduction(300000, 400000, 100000, "single", true), 0);
});

test("article example: $100k profit, $50k salary, single filer", () => {
  const llc = asLLC(100000, 0, "single", false);
  const s = asSCorp(100000, 50000, 0, "single", false, COSTS);
  assert.equal(round(llc.seTax), 14130);
  assert.equal(round(llc.total), 22365);
  assert.equal(round(s.fica), 7650);
  assert.equal(round(s.unemployment), 342);
  assert.equal(round(s.total), 19761);
  assert.equal(round(llc.qbi), 15367);
  assert.equal(round(s.qbi), 8795);
  assert.ok(Math.abs(savings(100000, 50000) - 2603) <= 1);
});

test("article savings table by salary share", () => {
  const rows = [
    [40000, 0.4, 1059], [40000, 0.6, -295],
    [70000, 0.4, 3061], [120000, 0.5, 3345],
    [200000, 0.5, 5886], [200000, 0.6, 2160],
  ];
  for (const [profit, share, expected] of rows) {
    assert.ok(Math.abs(savings(profit, profit * share) - expected) <= 1, `${profit} @ ${share}`);
  }
});

test("fixed $60k salary and married filing jointly examples", () => {
  assert.ok(Math.abs(savings(80000, 60000) - -1429) <= 1);
  assert.ok(Math.abs(savings(200000, 60000) - 13339) <= 1);
  assert.ok(Math.abs(savings(100000, 50000, "mfj") - 3751) <= 1);
});
