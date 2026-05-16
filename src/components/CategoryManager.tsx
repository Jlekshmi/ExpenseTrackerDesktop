import { useState } from "react";
import type { Category, CategoryType } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  categories: Category[];
  onAdd: (name: string, type: CategoryType) => void;
  onDelete: (id: string) => void;
};

export function CategoryManager({ categories, onAdd, onDelete }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  const handleAdd = () => {
    setError("");
    if (!name.trim()) { setError("Please enter a category name."); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A category with this name already exists."); return;
    }
    onAdd(name.trim(), type);
    setName("");
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Manage Categories</h1>
          <p className="page-sub">{categories.length} categories total</p>
        </div>
      </div>

      <div className="cat-add-card">
        <h3>Add New Category</h3>
        <div className="cat-add-row">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name..."
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="type-toggle">
            <button className={type === "expense" ? "active expense" : ""} onClick={() => setType("expense")}>Expense</button>
            <button className={type === "income" ? "active income" : ""} onClick={() => setType("income")}>Income</button>
          </div>
          <button className="btn-primary" onClick={handleAdd}>Add</button>
        </div>
        {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
      </div>

      <div className="cat-columns">
        <div className="cat-group">
          <h3 className="cat-group-title expense">Expense Categories <span>{expenseCats.length}</span></h3>
          <div className="cat-list">
            {expenseCats.map((c) => (
              <div key={c.id} className="cat-item">
                <span>{c.name}</span>
                <button className="action-btn del" title="Delete" onClick={() => setDeleting(c)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="cat-group">
          <h3 className="cat-group-title income">Income Categories <span>{incomeCats.length}</span></h3>
          <div className="cat-list">
            {incomeCats.map((c) => (
              <div key={c.id} className="cat-item">
                <span>{c.name}</span>
                <button className="action-btn del" title="Delete" onClick={() => setDeleting(c)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {deleting && (
        <ConfirmDialog
          title="Delete Category"
          message={`Are you sure you want to delete "${deleting.name}"? Existing transactions using this category will not be affected.`}
          onConfirm={() => { onDelete(deleting.id); setDeleting(null); }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
