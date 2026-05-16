# Finance Tracker Desktop 💰

A professional personal finance tracking desktop app built with Electron + React + Vite + TypeScript. Installable as a native Windows application.

## Features

- **Month-by-month tracking** — navigate any month of any year via the sidebar
- **Income & Expense transactions** — add date, description, category and amount per entry
- **37 pre-loaded categories** — matching real-world Canadian personal finance (Rent, RRSP, TSFA, FHSA, Grocery, Health, etc.)
- **Category manager** — add or remove categories anytime; changes reflect instantly in forms
- **Yearly summary** — full year overview with income vs expenses per month and category breakdown
- **Light & Dark theme** — toggle via the ☀️/🌙 button; preference saved across sessions
- **Custom delete confirmation** — styled dialog instead of browser alert
- **Persistent storage** — all data saved locally on disk, survives app restarts and updates
- **Future year support** — current year and next year always available in sidebar

## Screenshots

| Dark Theme | Light Theme | Add Transaction |
|---|---|---|
| ![Dark](screenshots/dark.png) | ![Light](screenshots/light.png) | ![Add](screenshots/add.png) |

## Tech Stack

- [Electron](https://www.electronjs.org/) v42 — native desktop shell
- [React](https://react.dev/) v19 + [Vite](https://vite.dev/) v8 — UI framework
- [TypeScript](https://www.typescriptlang.org/) — full type safety
- `localStorage` — persistent data storage
- [electron-builder](https://www.electron.build/) — Windows installer packaging

## Getting Started

```bash
npm install
```

**Run in dev mode (two terminals):**

Terminal 1 — start Vite dev server:
```bash
npx vite
```

Terminal 2 — launch Electron (after Terminal 1 is ready):
```powershell
$env:NODE_ENV="development"; npx electron .
```

## Build Windows Installer

```bash
npm run dist
```

Output: `release/Expense Tracker Setup 1.0.0.exe`

Share the `.exe` directly — recipients double-click to install, no other setup needed.

## Branch Strategy

```
main          ← stable releases
develop       ← integration branch
feature/*     ← individual features
```

## Project Structure

```
electron/
  main.ts                   — Electron main process (window, loading)
src/
  App.tsx                   — root layout, theme management, routing
  App.css                   — all styles with CSS variables for theming
  index.css                 — global reset and CSS variable definitions
  types.ts                  — shared TypeScript types
  constants/
    seedCategories.ts       — 37 default categories seeded on first launch
  hooks/
    useTransactions.ts      — transaction CRUD with localStorage
    useCategories.ts        — category CRUD with localStorage + seeding
  components/
    Sidebar.tsx             — year/month navigation, theme toggle
    MonthView.tsx           — transaction table with search, edit, delete
    YearlySummary.tsx       — yearly income/expense/net breakdown
    AddTransactionModal.tsx — add/edit transaction form
    CategoryManager.tsx     — manage expense and income categories
    ConfirmDialog.tsx       — custom styled delete confirmation dialog
```

## Categories

**Expense (34):** Rent, Subscription, Loan, Amazon, Uber Eats, Grocery, Restaurants, Car Parking, Petrol, Office Supplies, Insurance, Hydro, Health, Mobile, Home Support, Internet, 401 Highway, Other, Shopping, Trip, Charity, Car Service, Sports, Tax, Auctions, Savings, Beauty, Tim Hortens, RRSP, TSFA, FHSA, Iphone, Entertainment

**Income (3):** Salary, Canada Carbon Rebate, Carry Fwd

## Related

- [Expense Tracker Mobile](https://github.com/Jlekshmi/ExpenseTracker) — React Native version for iOS & Android
