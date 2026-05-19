import { useMemo, useState } from "react";
import type { Category, Transaction } from "../types";
import { AddTransactionModal } from "./AddTransactionModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImportModal } from "./ImportModal";

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


type Props = {
  year: number;
  month: number;
  transactions: Transaction[];
  categories: Category[];
  onAdd: (t: Omit<Transaction, "id">) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
};

export function MonthView({ year, month, transactions, categories, onAdd, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");

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

  const getCat = (id: string) => categories.find((c) => c.id === id);
  const fmt = (n: number) => n.toLocaleString("en-CA", { minimumFractionDigits: 2 });

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{MONTHS[month]} {year}</h1>
          <p className="page-sub">{monthTx.length} transaction{monthTx.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Transaction</button>
      </div>

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

      <div className="table-toolbar">
        <input
          className="search-input"
          placeholder="Search description or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-outline" onClick={() => setShowImport(true)}>⬆ Import Excel</button>
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
              <tr>
                <td colSpan={6} className="empty-row">
                  {monthTx.length === 0
                    ? "No transactions yet — click '+ Add Transaction' to start"
                    : "No results found"}
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const cat = getCat(t.categoryId);
                return (
                  <tr key={t.id} className="tx-row">
                    <td className="date-cell">
                      {new Date(t.date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                    </td>
                    <td className="desc-cell">{t.description || <span className="muted">—</span>}</td>
                    <td><span className="cat-badge">{cat?.name ?? "—"}</span></td>
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

      {(showAdd || editing) && (
        <AddTransactionModal
          year={year}
          month={month}
          categories={categories}
          initial={editing ?? undefined}
          onSave={editing
            ? (data) => { onUpdate(editing.id, data); setEditing(null); }
            : onAdd}
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

      {showImport && (
        <ImportModal
          categories={categories}
          onImport={(txs) => { txs.forEach((t) => onAdd(t)); }}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
