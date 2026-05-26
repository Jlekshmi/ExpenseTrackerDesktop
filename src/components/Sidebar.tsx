import type { Transaction } from "../types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type View = { type: "month"; year: number; month: number } | { type: "yearly"; year: number } | { type: "categories" };

type Props = {
  transactions: Transaction[];
  view: View;
  theme: "dark" | "light";
  onSelect: (v: View) => void;
  onThemeToggle: () => void;
  onImport: () => void;
};

export function Sidebar({ transactions, view, theme, onSelect, onThemeToggle, onImport }: Props) {
  const currentYear = new Date().getFullYear();
  const dataYears = transactions.map((t) => t.year);
  const yearSet = new Set([...dataYears, currentYear, currentYear + 1]);
  const years = Array.from(yearSet).sort((a, b) => b - a);
  const selectedYear = view.type === "categories" ? currentYear : view.year;

  const handleYearChange = (y: number) => {
    onSelect({ type: "month", year: y, month: new Date().getMonth() });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">&#128176;</span>
        <span className="logo-text">Finance Tracker</span>
        <button className="theme-toggle" onClick={onThemeToggle} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Year</div>
        <div className="year-row">
          <select
            className="year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Months</div>
        {MONTHS.map((m, i) => {
          const isActive = view.type === "month" && view.year === selectedYear && view.month === i;
          const hasData = transactions.some((t) => t.year === selectedYear && t.month === i);
          return (
            <button
              key={m}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => onSelect({ type: "month", year: selectedYear, month: i })}
            >
              <span>{m}</span>
              {hasData && <span className="dot" />}
            </button>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Reports</div>
        <button
          className={`sidebar-item ${view.type === "yearly" ? "active" : ""}`}
          onClick={() => onSelect({ type: "yearly", year: selectedYear })}
        >
          &#128202; Yearly Summary
        </button>
        <button
          className={`sidebar-item ${view.type === "categories" ? "active" : ""}`}
          onClick={() => onSelect({ type: "categories" })}
        >
          &#127991; Categories
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Data</div>
        <button className="sidebar-import-btn" onClick={onImport}>
          &#11014; Import Excel
        </button>
      </div>
    </aside>
  );
}
