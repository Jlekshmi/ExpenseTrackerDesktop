import { useState } from "react";
import type { Category, CategoryType } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

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
  categories: Category[];
  onAdd: (name: string, type: CategoryType) => void;
  onUpdate: (id: string, name: string, type: CategoryType) => void;
  onDelete: (id: string) => void;
};

export function CategoryManager({ categories, onAdd, onUpdate, onDelete }: Props) {
  const [name, setName]       = useState("");
  const [type, setType]       = useState<CategoryType>("expense");
  const [error, setError]     = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editName, setEditName]       = useState("");
  const [editType, setEditType]       = useState<CategoryType>("expense");
  const [editError, setEditError]     = useState("");

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats  = categories.filter((c) => c.type === "income");

  const handleAdd = () => {
    setError("");
    if (!name.trim()) { setError("Please enter a category name."); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A category with this name already exists."); return;
    }
    onAdd(name.trim(), type);
    setName("");
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditType(c.type);
    setEditError("");
  };

  const cancelEdit = () => { setEditingId(null); setEditError(""); };

  const saveEdit = () => {
    setEditError("");
    if (!editName.trim()) { setEditError("Name cannot be empty."); return; }
    if (categories.some((c) => c.id !== editingId && c.name.toLowerCase() === editName.trim().toLowerCase())) {
      setEditError("A category with this name already exists."); return;
    }
    onUpdate(editingId!, editName, editType);
    setEditingId(null);
  };

  const renderItem = (c: Category) => {
    if (editingId === c.id) {
      return (
        <div key={c.id} className="cat-item cat-item-editing">
          <input
            className="input cat-edit-input"
            value={editName}
            autoFocus
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
          />
          <div className="type-toggle cat-edit-toggle">
            <button className={editType === "expense" ? "active expense" : ""} onClick={() => setEditType("expense")}>Exp</button>
            <button className={editType === "income"  ? "active income"  : ""} onClick={() => setEditType("income")}>Inc</button>
          </div>
          <button className="btn-primary cat-edit-save" onClick={saveEdit}>Save</button>
          <button className="btn-secondary cat-edit-cancel" onClick={cancelEdit}>✕</button>
          {editError && <span className="error-text" style={{ fontSize: 11 }}>{editError}</span>}
        </div>
      );
    }
    return (
      <div key={c.id} className="cat-item">
        <span>{c.name}</span>
        <div className="cat-item-actions">
          <button className="action-btn edit" title="Edit" onClick={() => startEdit(c)}><EditIcon /></button>
          <button className="action-btn del" title="Delete" onClick={() => setDeleting(c)}><TrashIcon /></button>
        </div>
      </div>
    );
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
            <button className={type === "income"  ? "active income"  : ""} onClick={() => setType("income")}>Income</button>
          </div>
          <button className="btn-primary" onClick={handleAdd}>Add</button>
        </div>
        {error && <div className="error-text" style={{ marginTop: 8 }}>{error}</div>}
      </div>

      <div className="cat-columns">
        <div className="cat-group">
          <h3 className="cat-group-title expense">Expense Categories <span>{expenseCats.length}</span></h3>
          <div className="cat-list">{expenseCats.map(renderItem)}</div>
        </div>

        <div className="cat-group">
          <h3 className="cat-group-title income">Income Categories <span>{incomeCats.length}</span></h3>
          <div className="cat-list">{incomeCats.map(renderItem)}</div>
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
