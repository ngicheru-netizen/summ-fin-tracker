# Student Finance Tracker

A responsive, accessible, vanilla **HTML/CSS/JavaScript** app for tracking student spending — transactions, budgets, regex-powered search, multi-currency support, and JSON import/export. No frameworks.

**Theme:** Student Finance Tracker
**Live site (GitHub Pages):** https://ngicheru-netizen.github.io/summ-fin-tracker/dashboard.html
**Repository:** https://github.com/ngicheru-netizen/summ-fin-tracker
**Demo video:** (TBD)
**Author:** Nadiv Gicheru — n.gicheru@alustudent.com

---

## Features

- **Transactions** — add, edit, and delete records (id + `createdAt`/`updatedAt` timestamps), auto-saved to `localStorage`.
- **Regex search** — live, case-insensitive-toggleable pattern search over description / category / id, with `<mark>` highlighting and a safe `try/catch` compiler (invalid patterns never crash the page).
- **Sorting** — sort the history table by id, amount, category, or date (ascending/descending, keyboard-accessible headers).
- **Form validation** — four regex rules including an **advanced back-reference** (duplicate-word detection).
- **Dashboard / stats** — total spent, spend this month, spending by category, and total shown simultaneously in **USD / KES / RwF**.
- **Last-7-days trend chart** — a CSS/JS bar chart of daily spending over the past week, with day labels and per-day totals.
- **Budget page** — budget status card, an animated **progress bar** (with over-80% warning), and a **Spending-by-Category breakdown** table (amount + % of cap).
- **Budget cap** — set a monthly cap; remaining/overage is announced via an ARIA live region (polite when under, assertive when over), with an over-budget warning.
- **Multi-currency** — base currency (USD / KES / RwF) with **manual conversion rates** set in Settings. Amounts are stored in USD and converted for display; entering a transaction in another currency normalizes it to USD on save.
- **Category management** — add / rename / delete spending categories (persisted).
- **Import / Export** — JSON export of transactions, and import with structure validation.
- **Persistence** — all data saved to `localStorage`.
- **Responsive & accessible** — mobile-first layout, semantic landmarks, labelled inputs, ARIA status regions, and CSS animations/transitions.

## Pages

| Page                | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| `index.html`        | Home — recent transaction cards                         |
| `transactions.html` | Full history table, search, sort, add/edit/delete       |
| `dashboard.html`    | Stats and spending breakdown                            |
| `budgets.html`      | Budget status and progress                              |
| `settings.html`     | Currency + rates, budget cap, categories, import/export |
| `about.html`        | Purpose and contact                                     |
| `tests.html`        | Validator & search unit tests                           |

## Project structure

```
index.html, transactions.html, dashboard.html, budgets.html, settings.html, about.html
tests.html
seed.json
styles/   base.css, components.css, responsive.css
scripts/
  app.js         page bootstrap (home) + seed loading
  storage.js     localStorage read/write
  state.js       data layer (transactions, budget, currency, categories)
  ui.js          DOM rendering, events, handlers
  search.js      safe regex compiler + highlighter
  validators.js  form validation rules
Assets/
```

The code is split data-vs-display: `storage.js`/`state.js`/`validators.js`/`search.js` hold pure logic (no DOM), and `ui.js` owns all DOM and event handling.

---

## Regex catalog

### Validation rules (`scripts/validators.js`)

| Field                                                             | Pattern                                              | Passes                                  | Fails                         |
| ----------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- | ----------------------------- |
| Description — no edge spaces                                      | `/^\S(?:.*\S)?$/`                                    | `Lunch at cafe`                         | `" Lunch"`, `"Lunch "`        |
| Description — **no duplicate words** _(advanced: back-reference)_ | `/\b(\w+)\s+\1\b/i` (match = invalid)                | `the cafe`                              | `the the cafe`, `Lunch lunch` |
| Amount                                                            | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/`                      | `12`, `12.5`, `12.50`, `0`              | `007`, `12.555`, `abc`        |
| Date (YYYY-MM-DD, real ranges)                                    | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | `2025-09-25`                            | `2025-99-99`, `2025/09/25`    |
| Category (letters, spaces, hyphens)                               | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`                    | `Food`, `Self-Care`, `Public Transport` | `Food123`, `Food!`            |

**Advanced regex:** `\b(\w+)\s+\1\b` uses a **back-reference** (`\1`) — it captures a word and requires the _same_ word to repeat, catching accidental duplicates like "the the". A standard pattern cannot match "the same text seen earlier"; the back-reference is what makes this possible.

### Search patterns (`scripts/search.js`)

Search compiles whatever pattern the user types via `compileRegex(input, flags)`, wrapped in `try/catch` so invalid patterns return `null` (the list simply shows all records instead of crashing). The "Ignore case" toggle adds the `i` flag; the `g` flag is always on for highlighting.

Example patterns to try in the search box:

| Pattern          | Finds                                |
| ---------------- | ------------------------------------ |
| `coffee\|tea`    | beverages                            |
| `\.\d{2}\b`      | amounts with cents                   |
| `^Lunch`         | descriptions starting with "Lunch"   |
| `\b(\w+)\s+\1\b` | records containing a duplicated word |

---

## Keyboard map

| Key                                 | Action                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| `Tab` (first focus)                 | Reveals the **Skip to content** link; `Enter` jumps to `<main>`|
| `Tab` / `Shift+Tab`                 | Move between links, inputs, buttons                            |
| `Enter` / `Space`                   | Activate the focused button/link                               |
| `Enter` on a sortable column header | Sort by that column (headers are focusable via `tabindex="0"`) |
| `Tab` into search box, type         | Live-filter the table as you type                              |
| `Space` on "Ignore case" checkbox   | Toggle case-insensitive search                                 |

## Accessibility notes

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` with proper headings.
- **Skip-to-content link** on every page (visible on focus) jumps past the nav to `#main-content`.
- **Visible focus styles** via `:focus-visible` on interactive elements.
- All inputs have associated `<label>`s.
- Search results and status messages use `role="status"` / `aria-live` so screen readers announce them.
- The budget cap message uses an ARIA live region that switches **polite ↔ assertive** depending on whether spending is under or over the cap.
- Color palette uses the ALU primary navy with adequate contrast against white surfaces.
- Fully operable with the keyboard (see map above).

---

## Running the app

It's static — no build step.

1. Clone the repo:
   ```bash
   git clone https://github.com/ngicheru-netizen/summ-fin-tracker.git
   ```
2. Serve it locally (modules need HTTP, not `file://`):
   ```bash
   # any static server, e.g.
   npx serve .
   # or VS Code "Live Server"
   ```
3. Open `index.html` in the browser.

On first load with empty storage, the app seeds ~16 demo transactions from `seed.json`.

## Running the tests

Open **`tests.html`** in the browser (served over HTTP as above). It imports `validators.js` and `search.js` and runs assertions, printing a green ✅ / red ❌ line per case. All assertions should pass.

---

## Data model

```json
{
  "id": "txn_001",
  "description": "Coffee",
  "amount": 5.5,
  "category": "Food",
  "date": "2025-09-25",
  "createdAt": "2025-09-25T08:00:00Z",
  "updatedAt": "2025-09-25T08:00:00Z"
}
```

Amounts are stored in **USD** (the base currency) and converted to the selected display currency at render time using the manual rates set in Settings.

## Constraints

Built with vanilla HTML/CSS/JS and ES modules — no frameworks, no build tooling.
