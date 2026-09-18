# Finance Tracker Desktop 💰

A professional personal finance tracking desktop app built with Electron + React + Vite + TypeScript. Installable as a native Windows application.

## Features

- **Month-by-month tracking** — navigate any month of any year via the sidebar
- **Income & Expense transactions** — add date, description, category and amount per entry
- **37 pre-loaded categories** — matching real-world Canadian personal finance (Rent, RRSP, TSFA, FHSA, Grocery, Health, etc.)
- **Category manager** — add, edit or delete categories anytime; changes reflect instantly in forms
- **Category breakdown panel** — always-visible right-side panel per month showing income and expense category totals
- **Yearly summary** — full year overview with income vs expenses per month and category breakdown
- **Monthly export to Excel** — exports current month's transactions + summary section (income categories, expense categories, totals, net savings)
- **Yearly export to Excel** — exports full year across 3 sheets: Transactions, Monthly Summary, Category Breakdown
- **Import from Excel** — import multi-sheet, multi-month Excel files; auto-detects header row, fuzzy category matching, infers month from sheet name when dates are blank
- **Search transactions** — filter by description or category with one-click clear
- **Light & Dark theme** — toggle via the ☀️/🌙 button; preference saved across sessions
- **Custom delete confirmation** — styled dialog instead of browser alert
- **Persistent storage** — all data saved locally on disk, survives app restarts and updates
- **Future year support** — current year and next year always available in sidebar

<!-- ## Screenshots

| Dark Theme | Light Theme | Add Transaction |
|---|---|---|
| ![Dark]() | ![Light]() | ![Add]() |
-->

## Tech Stack

- [Electron](https://www.electronjs.org/) v42 — native desktop shell
- [React](https://react.dev/) v19 + [Vite](https://vite.dev/) v8 — UI framework
- [TypeScript](https://www.typescriptlang.org/) — full type safety
- [SheetJS (xlsx)](https://sheetjs.com/) — Excel import and export
- `localStorage` — persistent data storage
- [electron-builder](https://www.electron.build/) — Windows installer packaging

## Getting Started

```bash
npm install
```

**Run in dev mode:**
```bash
npm run dev
```

This starts the Vite dev server and launches the Electron window together.

## Build Windows Installer

```bash
npm run dist
```

Output: `release/Expense Tracker Setup 1.0.0.exe`

Share the `.exe` directly — recipients double-click to install, no other setup needed.

## Excel Import Format

Each sheet should have columns: **Date**, **Category**, **Amount**, **Type** (and optionally **Description**).

- Sheets named after months (e.g. `Jan`, `February`, `Mar 2026`) are auto-detected
- Rows without a date are assigned to the sheet's month with day 1
- Right-side summary columns in your Excel are automatically ignored
- Sheets named `Yearly Summary`, `Lookups`, `NL` are skipped

## Branch Strategy

```
main          ← stable releases
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
    Sidebar.tsx             — year/month navigation, theme toggle, import button
    MonthView.tsx           — transaction table, search, category breakdown panel, month export
    YearlySummary.tsx       — yearly income/expense/net breakdown + yearly export
    AddTransactionModal.tsx — add/edit transaction form
    CategoryManager.tsx     — add, edit and delete expense/income categories
    ConfirmDialog.tsx       — custom styled delete confirmation dialog
    ImportModal.tsx         — 3-step Excel import wizard (select → preview → done)
  utils/
    excelImport.ts          — multi-sheet Excel parser with header auto-detection
    excelExport.ts          — monthly and yearly Excel export
```

## Categories

**Expense (34):** Rent, Subscription, Loan, Amazon, Uber Eats, Grocery, Restaurants, Car Parking, Petrol, Office Supplies, Insurance, Hydro, Health, Mobile, Home Support, Internet, 401 Highway, Other, Shopping, Trip, Charity, Car Service, Sports, Tax, Auctions, Savings, Beauty, Tim Hortens, RRSP, TSFA, FHSA, Iphone, Entertainment

**Income (3):** Salary, Canada Carbon Rebate, Carry Fwd

## Related

- [Expense Tracker Mobile](https://github.com/Jlekshmi/ExpenseTracker) — React Native version for iOS & Android
