import { useState } from "react";
import type { Category, Transaction } from "../types";

type Props = {
  year: number;
  month: number;
  categories: Category[];
  onSave: (t: Omit<Transaction, "id">) => void;
  onClose: () => void;
  initial?: Transaction;
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function AddTransactionModal({ year, month, categories, onSave, onClose, initial }: Props) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthStr = pad(month + 1);
  const minDate = `${year}-${monthStr}-01`;
  const maxDate = `${year}-${monthStr}-${pad(daysInMonth(year, month))}`;
  const defaultDate = initial?.date.substring(0, 10) ?? minDate;

  const [date, setDate] = useState(initial?.date.substring(0, 10) ?? defaultDate);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [type, setType] = useState<"income" | "expense">(initial?.type ?? "expense");
  const [error, setError] = useState("");

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");
  const activeCats = type === "expense" ? expenseCats : incomeCats;

  const handleTypeChange = (t: "income" | "expense") => {
    setType(t);
    const first = (t === "expense" ? expenseCats : incomeCats)[0];
    if (first) setCategoryId(first.id);
  };

  const handleSave = () => {
    setError("");
    if (!date) { setError("Please select a date."); return; }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount."); return;
    }
    if (!categoryId) { setError("Please select a category."); return; }

    const [y, m, d] = date.split("-").map(Number);
    onSave({
      date: new Date(y, m - 1, d, 12, 0, 0).toISOString(),
      description: description.trim(),
      categoryId,
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      type,
      year: y,
      month: m - 1,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? "Edit Transaction" : `Add — ${MONTHS[month]} ${year}`}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="field">
              <label className="field-label">Type</label>
              <div className="type-toggle">
                <button className={type === "expense" ? "active expense" : ""} onClick={() => handleTypeChange("expense")}>Expense</button>
                <button className={type === "income" ? "active income" : ""} onClick={() => handleTypeChange("income")}>Income</button>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Date</label>
              <input className="input" type="date" value={date} min={minDate} max={maxDate} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Description (optional)</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. North Dental, Kaspersky 1yr..." />
          </div>

          <div className="form-row">
            <div className="field" style={{ flex: 2 }}>
              <label className="field-label">Category</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {activeCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Amount ($)</label>
              <input className="input" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>{initial ? "Save Changes" : "Add Transaction"}</button>
        </div>
      </div>
    </div>
  );
}
