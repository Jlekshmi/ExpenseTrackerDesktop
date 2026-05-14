# Expense Tracker Desktop 💰

A native Windows desktop app for tracking expenses, built with Electron + React + Vite.

## Features

- Add expenses with title, amount, category, date and notes
- Dashboard with total spent and category breakdown
- View all expenses grouped by date
- Delete expenses with confirmation
- Data stored permanently on disk (survives restarts and updates)
- Dark theme UI


## Tech Stack

- [Electron](https://www.electronjs.org/) — desktop app shell
- [React](https://react.dev/) + [Vite](https://vite.dev/) — UI
- [TypeScript](https://www.typescriptlang.org/) — type safety
- `localStorage` — persistent storage

## Getting Started

```bash
npm install
```

**Run in dev mode (open two terminals):**

Terminal 1:
```bash
npx vite
```

Terminal 2:
```bash
$env:NODE_ENV="development"; npx electron .
```

## Build Installer

```bash
npm run dist
```

Output: `release/Expense Tracker Setup 1.0.0.exe`

## Project Structure

```
electron/
  main.ts             — Electron main process
src/
  App.tsx             — all screens (Home, Add, All Expenses)
  App.css             — styles
  hooks/
    useExpenses.ts    — expense data logic with localStorage
  theme.ts            — colors and categories
  types.ts            — TypeScript types
```

## Related

- [Expense Tracker Mobile](https://github.com/YOUR_USERNAME/ExpenseTracker) — React Native version
