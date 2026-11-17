# Pay Yourself Smart

**Live site:** https://w4v3y.github.io/pay-yourself-smart/

A niche website for US small-business owners that answers one question with real math: *when does electing S-Corp status actually save money compared with a single-member LLC?*

It has two parts:

- **[LLC vs S-Corp Calculator](https://w4v3y.github.io/pay-yourself-smart/llc-vs-s-corp-calculator/):** an interactive tool that compares the full 2026 federal tax bill under each structure and draws a break-even chart that updates as you type.
- **[2026 Break-Even Article](https://w4v3y.github.io/pay-yourself-smart/articles/s-corp-break-even/):** an SEO-focused guide whose every figure comes from the same tax engine as the calculator.

## What the calculator models

Most online calculators only compare 15.3% self-employment tax with payroll tax on a lower salary. This one also includes the costs that appear once you become an S-Corp:

| Item | LLC | S-Corp |
| --- | --- | --- |
| Self-employment tax (Social Security wage base $184,500) | ✔ | |
| Payroll tax (FICA) on the owner's W-2 salary, both halves | | ✔ |
| Federal and state unemployment taxes | | ✔ |
| QBI deduction (Section 199A) with W-2 wage limit and service-business phase-out | ✔ | ✔ |
| 2026 federal brackets and standard deduction (Rev. Proc. 2025-32) | ✔ | ✔ |
| Payroll software, extra accounting and state S-Corp fees | | ✔ |

It also warns when the salary is under ~30% of profit (a common audit flag) or when payroll costs exceed profit.

## Tech

- Vanilla HTML, CSS and JavaScript. No framework and no build step.
- `src/calc.js`: a pure tax engine with no DOM access, shared by the browser and the tests.
- Hand-drawn SVG chart with automatic break-even detection.
- Responsive layout with light and dark themes, accessible form labels and live result regions.
- `tests/calc.test.js`: unit tests with Node's built-in test runner that check the engine against every figure published in the article.

```bash
node --test   # runs the test suite (Node 18+)
```

To preview locally, serve the folder with any static server, for example `npx serve .`, and open `http://localhost:3000`.

## Project structure

```
index.html                        landing page
llc-vs-s-corp-calculator/         calculator page
articles/s-corp-break-even/       break-even article
src/calc.js                       tax engine
tests/calc.test.js                unit tests
```

## Roadmap

- [ ] State income tax module
- [ ] Payroll software comparison article
- [ ] Downloadable Excel template
- [ ] Custom domain (payyourselfsmart.com)

## Disclaimer

Educational estimate only, not tax, legal or accounting advice.

---

**Autor:** Josue Banda Aguirre, estudiante de Ingeniería de Sistemas de Información (UPC, Lima). Proyecto personal de desarrollo web y modelado de reglas tributarias de EE. UU.
