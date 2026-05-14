import { useState, useMemo } from "react";
import { useExpenses } from "./hooks/useExpenses";
import { CATEGORIES, getCategoryById } from "./theme";
import type { Expense } from "./types";
import "./App.css";

type Screen = "home" | "add" | "all";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const { expenses, addExpense, deleteExpense } = useExpenses();

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          expenses={expenses}
          onAdd={() => setScreen("add")}
          onSeeAll={() => setScreen("all")}
          onDelete={deleteExpense}
        />
      )}
      {screen === "add" && (
        <AddScreen
          onBack={() => setScreen("home")}
          onSave={(data) => { addExpense(data); setScreen("home"); }}
        />
      )}
      {screen === "all" && (
        <AllScreen
          expenses={expenses}
          onBack={() => setScreen("home")}
          onDelete={deleteExpense}
        />
      )}
    </div>
  );
}

function HomeScreen({ expenses, onAdd, onSeeAll, onDelete }: {
  expenses: Expense[];
  onAdd: () => void;
  onSeeAll: () => void;
  onDelete: (id: string) => void;
}) {
  const totals = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = CATEGORIES.map((cat) => ({
      ...cat,
      total: expenses.filter((e) => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0),
    }));
    const recent = [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return { total, byCategory, recent };
  }, [expenses]);

  return (
    <div className="screen">
      <div className="header">
        <div>
          <div className="header-title">My Expenses</div>
          <div className="header-sub">Track every dollar</div>
        </div>
        <button className="add-btn" onClick={onAdd}>+ Add</button>
      </div>

      <div className="scroll-content">
        <div className="balance-card">
          <div className="balance-label">Total Spent</div>
          <div className="balance-amount">${totals.total.toFixed(2)}</div>
          <div className="balance-count">
            {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="section-title">By Category</div>
        <div className="category-row">
          {totals.byCategory.filter((c) => c.total > 0).map((cat) => (
            <div key={cat.id} className="summary-card" style={{ borderColor: cat.color + "55" }}>
              <div className="summary-icon" style={{ background: cat.color + "22" }}>{cat.icon}</div>
              <div className="summary-label">{cat.label}</div>
              <div className="summary-amount" style={{ color: cat.color }}>${cat.total.toFixed(2)}</div>
            </div>
          ))}
          {totals.byCategory.every((c) => c.total === 0) && (
            <div className="muted-text">Add expenses to see category breakdown</div>
          )}
        </div>

        <div className="section-header">
          <div className="section-title" style={{ marginBottom: 0 }}>Recent</div>
          {expenses.length > 5 && (
            <button className="link-btn" onClick={onSeeAll}>See all →</button>
          )}
        </div>

        <div className="expense-list">
          {totals.recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💸</div>
              <div className="empty-text">No expenses yet</div>
              <div className="empty-hint">Click "+ Add" to get started</div>
            </div>
          ) : (
            totals.recent.map((e) => (
              <ExpenseRow key={e.id} expense={e} onDelete={() => onDelete(e.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AddScreen({ onBack, onSave }: {
  onBack: () => void;
  onSave: (data: { title: string; amount: number; category: string; note: string; date: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    if (!title.trim()) { setError("Please enter a title."); return; }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount."); return;
    }
    onSave({
      title: title.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      category,
      note: note.trim(),
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="header-title">New Expense</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="scroll-content">
        <div className="field">
          <label className="field-label">Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Coffee, Groceries, Uber..."
            maxLength={40}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field-label">Amount ($)</label>
          <div className="amount-row">
            <span className="currency">$</span>
            <input
              className="input amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Category</label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => {
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  className="cat-btn"
                  onClick={() => setCategory(cat.id)}
                  style={selected ? { background: cat.color + "33", borderColor: cat.color, color: cat.color } : {}}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Note (optional)</label>
          <textarea
            className="input textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
          />
        </div>

        {error && <div className="error-text">{error}</div>}
        <button className="save-btn" onClick={handleSave}>Save Expense</button>
      </div>
    </div>
  );
}

function AllScreen({ expenses, onBack, onDelete }: {
  expenses: Expense[];
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const sorted = [...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const groups: { title: string; items: Expense[] }[] = [];
    const seen = new Set<string>();
    sorted.forEach((e) => {
      const key = new Date(e.date).toDateString();
      if (!seen.has(key)) {
        seen.add(key);
        groups.push({ title: formatDateHeader(new Date(e.date)), items: [] });
      }
      groups[groups.length - 1].items.push(e);
    });
    return groups;
  }, [expenses]);

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="header-title">All Expenses</div>
        <div className="accent-text">${total.toFixed(2)}</div>
      </div>

      <div className="scroll-content">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No expenses yet</div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.title}>
              <div className="date-header">{group.title}</div>
              {group.items.map((e) => (
                <ExpenseRow key={e.id} expense={e} onDelete={() => onDelete(e.id)} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ExpenseRow({ expense, onDelete }: { expense: Expense; onDelete: () => void }) {
  const cat = getCategoryById(expense.category);
  const time = new Date(expense.date).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  const handleDelete = () => {
    if (window.confirm(`Delete "${expense.title}"?`)) onDelete();
  };

  return (
    <div className="expense-row">
      <div className="expense-icon" style={{ background: cat.color + "22" }}>{cat.icon}</div>
      <div className="expense-info">
        <div className="expense-title">{expense.title}</div>
        <div className="expense-meta">{cat.label}{expense.note ? ` · ${expense.note}` : ""} · {time}</div>
      </div>
      <div className="expense-right">
        <div className="expense-amount">-${expense.amount.toFixed(2)}</div>
        <button className="delete-btn" onClick={handleDelete}>✕</button>
      </div>
    </div>
  );
}

function formatDateHeader(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}
