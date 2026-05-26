import { useMemo, useState } from "react";
import type { Category, Transaction } from "../types";
import { AddTransactionModal } from "./AddTransactionModal";
import { ConfirmDialog } from "./ConfirmDialog";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ChevronUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

type Props = {
  year: number;
  month: number;
  transactions: Transaction[];
  categories: Category[];
  onAdd: (t: Omit<Transaction, "id">) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
};

// Assign a colour dot to each category based on its name
const CAT_COLORS: Record<string, string> = {
  rent:"#4ECDC4", subscription:"#C7A6FF", loan:"#FF9A3C", amazon:"#FFE66D",
  ubereats:"#FF6B6B", grocery:"#A8E6CF", restaurants:"#FF8B94", carparking:"#B2BEC3",
  petrol:"#74B9FF", officesupplies:"#DFE6E9", insurance:"#FDCB6E", hydro:"#81ECEC",
  health:"#FF7675", mobile:"#6C5CE7", homesupport:"#E17055", internet:"#00CEC9",
  highway401:"#636E72", other:"#B2BEC3", shopping:"#FD79A8", trip:"#55EFC4",
  charity:"#FAB1A0", carservice:"#74B9FF", sports:"#00B894", tax:"#D63031",
  auctions:"#E84393", savings:"#34EAA0", beauty:"#FD79A8", timhortens:"#D35400",
  rrsp:"#2980B9", tsfa:"#27AE60", fhsa:"#8E44AD", iphone:"#636E72",
  entertainment:"#9B59B6", salary:"#34EAA0", carboncrebate:"#00B894", carryfwd:"#74B9FF",
};

function getCatColor(catId: string): string {
  return CAT_COLORS[catId.toLowerCase()] ?? "#B2BEC3";
}

export function MonthView({ year, month, transactions, categories, onAdd, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd]         = useState(false);
  const [editing, setEditing]         = useState<Transaction | null>(null);
  const [deleting, setDeleting]       = useState<Transaction | null>(null);
  const [search, setSearch]           = useState("");
  const [showSummary, setShowSummary] = useState(true);

  const monthTx = useMemo(() =>
    transactions
      .filter((t) => t.year === year && t.month === month)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, year, month]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return monthTx;
    const q = search.toLowerCase();
    return monthTx.filter((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      return t.description.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
    });
  }, [monthTx, search, categories]);

  const summary = useMemo(() => {
    const income  = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [monthTx]);

  // Aggregate by category
  const { expenseGroups, incomeGroups } = useMemo(() => {
    const map = new Map<string, { cat: Category | undefined; total: number; count: number; type: string }>();
    monthTx.forEach((t) => {
      const ex = map.get(t.categoryId);
      if (ex) { ex.total += t.amount; ex.count++; }
      else map.set(t.categoryId, { cat: categories.find((c) => c.id === t.categoryId), total: t.amount, count: 1, type: t.type });
    });
    const all = Array.from(map.values()).filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
    return {
      expenseGroups: all.filter((r) => r.type === "expense"),
      incomeGroups:  all.filter((r) => r.type === "income"),
    };
  }, [monthTx, categories]);

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const fmt = (n: number) => n.toLocaleString("en-CA", { minimumFractionDigits: 2 });

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{MONTHS[month]} {year}</h1>
          <p className="page-sub">{monthTx.length} transaction{monthTx.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Transaction</button>
      </div>

      {/* Summary bar */}
      <div className="summary-bar">
        <div className="summary-stat">
          <span className="stat-label">Total Income</span>
          <span className="stat-value income">${fmt(summary.income)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-stat">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value expense">${fmt(summary.expense)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-stat">
          <span className="stat-label">Net Savings</span>
          <span className={`stat-value ${summary.net >= 0 ? "income" : "expense"}`}>
            {summary.net < 0 ? "-" : ""}${fmt(Math.abs(summary.net))}
          </span>
        </div>
      </div>

      {/* Search + Table */}
      <div className="table-toolbar">
        <div className="search-wrap">
          <input
            className="search-input"
            placeholder="Search description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")} title="Clear">✕</button>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th className="text-right">Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="empty-row">
                {monthTx.length === 0 ? "No transactions yet — click '+ Add Transaction' to start" : "No results found"}
              </td></tr>
            ) : (
              filtered.map((t) => {
                const cat = getCat(t.categoryId);
                return (
                  <tr key={t.id} className="tx-row">
                    <td className="date-cell">{new Date(t.date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</td>
                    <td className="desc-cell">{t.description || <span className="muted">—</span>}</td>
                    <td>
                      <span className="cat-badge">
                        <span className="cat-dot" style={{ background: getCatColor(t.categoryId) }} />
                        {cat?.name ?? "—"}
                      </span>
                    </td>
                    <td><span className={`type-badge ${t.type}`}>{t.type === "income" ? "Income" : "Expense"}</span></td>
                    <td className={`amount-cell text-right ${t.type}`}>
                      {t.type === "expense" ? "-" : "+"}${fmt(t.amount)}
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn edit" title="Edit" onClick={() => setEditing(t)}><EditIcon /></button>
                      <button className="action-btn del" title="Delete" onClick={() => setDeleting(t)}><TrashIcon /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Category breakdown — collapsible, below table, full width */}
      {monthTx.length > 0 && (
        <div className="cat-breakdown-section">
          <button className="cat-breakdown-toggle" onClick={() => setShowSummary((v) => !v)}>
            <span>Category Breakdown</span>
            <span className="cat-breakdown-meta">
              {expenseGroups.length} expense · {incomeGroups.length} income categories
            </span>
            <span className="cat-breakdown-chevron">{showSummary ? <ChevronUp /> : <ChevronDown />}</span>
          </button>

          {showSummary && (
            <div className="cat-breakdown-grid">
              {/* Expenses */}
              <div className="cat-breakdown-col">
                <div className="cat-breakdown-col-header expense">Expense Categories</div>
                {expenseGroups.map(({ cat, total, count }) => (
                  <div key={cat?.id ?? "unk"} className="cat-breakdown-row">
                    <span className="cat-dot" style={{ background: getCatColor(cat?.id ?? "") }} />
                    <span className="cat-breakdown-name">{cat?.name ?? "Unknown"}</span>
                    {count > 1 && <span className="cat-count">{count}x</span>}
                    <span className="cat-breakdown-amount expense">${fmt(total)}</span>
                  </div>
                ))}
              </div>

              {/* Income */}
              <div className="cat-breakdown-col">
                <div className="cat-breakdown-col-header income">Income Categories</div>
                {incomeGroups.length === 0
                  ? <p className="cat-breakdown-empty">No income recorded</p>
                  : incomeGroups.map(({ cat, total, count }) => (
                    <div key={cat?.id ?? "unk"} className="cat-breakdown-row">
                      <span className="cat-dot" style={{ background: getCatColor(cat?.id ?? "") }} />
                      <span className="cat-breakdown-name">{cat?.name ?? "Unknown"}</span>
                      {count > 1 && <span className="cat-count">{count}x</span>}
                      <span className="cat-breakdown-amount income">${fmt(total)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}

      {(showAdd || editing) && (
        <AddTransactionModal
          year={year} month={month} categories={categories}
          initial={editing ?? undefined}
          onSave={editing ? (data) => { onUpdate(editing.id, data); setEditing(null); } : onAdd}
          onClose={() => { setShowAdd(false); setEditing(null); }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete Transaction"
          message={`Are you sure you want to delete "${deleting.description || deleting.categoryId}"? This cannot be undone.`}
          onConfirm={() => { onDelete(deleting.id); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
