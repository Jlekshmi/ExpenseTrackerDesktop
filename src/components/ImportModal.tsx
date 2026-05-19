import { useState, useRef } from "react";
import type { Category, Transaction } from "../types";
import { importFromExcel, type ImportResult } from "../utils/excelImport";

type Props = {
  categories: Category[];
  onImport: (transactions: Omit<Transaction, "id">[]) => void;
  onClose: () => void;
};

type Step = "select" | "preview" | "done";

export function ImportModal({ categories, onImport, onClose }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    const res = await importFromExcel(file, categories);
    setResult(res);
    setLoading(false);
    setStep("preview");
  };

  const handleConfirm = () => {
    if (!result) return;
    onImport(result.imported);
    setStep("done");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import from Excel</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── STEP 1: Select File ── */}
        {step === "select" && (
          <div className="modal-body">
            <div className="import-format-box">
              <p className="import-note">Your Excel file should have these columns:</p>
              <table className="format-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2026-01-15</td>
                    <td>North Dental</td>
                    <td>Health</td>
                    <td>88.00</td>
                    <td>Expense</td>
                  </tr>
                  <tr>
                    <td>2026-01-31</td>
                    <td>Payroll</td>
                    <td>Salary</td>
                    <td>10353</td>
                    <td>Income</td>
                  </tr>
                </tbody>
              </table>
              <p className="import-hint">Category names must match your existing categories. Type defaults to "Expense" if not provided.</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={handleFile}
            />

            {loading ? (
              <div className="import-loading">Reading file...</div>
            ) : (
              <button className="btn-primary import-select-btn" onClick={() => fileRef.current?.click()}>
                Choose Excel File
              </button>
            )}
          </div>
        )}

        {/* ── STEP 2: Preview Results ── */}
        {step === "preview" && result && (
          <div className="modal-body">
            <div className="import-stats">
              <div className="import-stat success">
                <span className="import-stat-num">{result.imported.length}</span>
                <span className="import-stat-label">Ready to import</span>
              </div>
              <div className="import-stat warn">
                <span className="import-stat-num">{result.skipped}</span>
                <span className="import-stat-label">Skipped</span>
              </div>
            </div>

            <p className="import-filename">📄 {fileName}</p>

            {result.errors.length > 0 && (
              <div className="import-errors">
                <p className="import-errors-title">⚠️ Issues found ({result.errors.length}):</p>
                <div className="import-errors-list">
                  {result.errors.slice(0, 8).map((e, i) => <p key={i}>{e}</p>)}
                  {result.errors.length > 8 && <p>...and {result.errors.length - 8} more</p>}
                </div>
              </div>
            )}

            {result.imported.length === 0 && (
              <p className="error-text">No valid transactions found. Check the issues above.</p>
            )}
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === "done" && result && (
          <div className="modal-body import-done">
            <div className="done-icon">✅</div>
            <h3>Import Complete!</h3>
            <p>{result.imported.length} transaction{result.imported.length !== 1 ? "s" : ""} added successfully.</p>
          </div>
        )}

        <div className="modal-footer">
          {step === "select" && (
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          )}
          {step === "preview" && (
            <>
              <button className="btn-secondary" onClick={() => setStep("select")}>← Back</button>
              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={!result || result.imported.length === 0}
              >
                Import {result?.imported.length} Transactions
              </button>
            </>
          )}
          {step === "done" && (
            <button className="btn-primary" onClick={onClose}>Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
