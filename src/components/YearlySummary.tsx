import { useMemo } from "react";
import type { Category, Transaction } from "../types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type Props = {
  year: number;
  transactions: Transaction[];
  categories: Category[];
};

export function YearlySummary({ year, transactions, categories }: Props) {
  const yearTx = useMemo(() => transactions.filter((t) => t.year === year), [transactions, year]);

  const monthlyTotals = useMemo(() =>
    MONTHS.map((_, i) => {
      const mx = yearTx.filter((t) => t.month === i);
      const income = mx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = mx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { income, expense, net: income - expense };
    }), [yearTx]
  );

  const expenseCats = categories.filter((c) => c.type === "expense");

  const catMonthTotals = useMemo(() =>
    expenseCats.map((cat) => ({
      cat,
      months: MONTHS.map((_, i) =>
        yearTx.filter((t) => t.month === i && t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0)
      ),
      total: yearTx.filter((t) => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0),
    })).filter((r) => r.total > 0),
    [yearTx, expenseCats]
  );

  const yearIncome = monthlyTotals.reduce((s, m) => s + m.income, 0);
  const yearExpense = monthlyTotals.reduce((s, m) => s + m.expense, 0);

  const fmt = (n: number) => n === 0 ? "—" : `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Yearly Summary — {year}</h1>
          <p className="page-sub">Income vs Expenses by month</p>
        </div>
      </div>

      <div className="summary-bar">
        <div className="summary-stat">
          <span className="stat-label">Total Income</span>
          <span className="stat-value income">${yearIncome.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-stat">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value expense">${yearExpense.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-stat">
          <span className="stat-label">Net Savings</span>
          <span className={`stat-value ${yearIncome - yearExpense >= 0 ? "income" : "expense"}`}>
            {yearIncome - yearExpense < 0 ? "-" : ""}${Math.abs(yearIncome - yearExpense).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="table-wrapper yearly-table-wrapper">
        <table className="tx-table yearly-table">
          <thead>
            <tr>
              <th className="sticky-col">Month</th>
              <th className="text-right income">Income</th>
              <th className="text-right expense">Expenses</th>
              <th className="text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((m, i) => {
              const r = monthlyTotals[i];
              return (
                <tr key={m} className={r.income === 0 && r.expense === 0 ? "tx-row muted-row" : "tx-row"}>
                  <td className="sticky-col">{m}</td>
                  <td className="text-right income">{r.income > 0 ? fmt(r.income) : "—"}</td>
                  <td className="text-right expense">{r.expense > 0 ? fmt(r.expense) : "—"}</td>
                  <td className={`text-right ${r.net >= 0 ? "income" : "expense"}`}>
                    {r.income === 0 && r.expense === 0 ? "—" : (r.net < 0 ? "-" : "") + "$" + Math.abs(r.net).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td className="sticky-col">TOTAL</td>
              <td className="text-right income">{fmt(yearIncome)}</td>
              <td className="text-right expense">{fmt(yearExpense)}</td>
              <td className={`text-right ${yearIncome - yearExpense >= 0 ? "income" : "expense"}`}>
                {(yearIncome - yearExpense < 0 ? "-" : "") + "$" + Math.abs(yearIncome - yearExpense).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {catMonthTotals.length > 0 && (
        <>
          <h2 className="section-heading">Expenses by Category</h2>
          <div className="table-wrapper yearly-table-wrapper">
            <table className="tx-table yearly-table">
              <thead>
                <tr>
                  <th className="sticky-col">Category</th>
                  {MONTHS.map((m) => <th key={m} className="text-right">{m}</th>)}
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {catMonthTotals.map(({ cat, months, total }) => (
                  <tr key={cat.id} className="tx-row">
                    <td className="sticky-col">{cat.name}</td>
                    {months.map((v, i) => (
                      <td key={i} className="text-right">{v > 0 ? `$${v.toLocaleString("en-CA", { minimumFractionDigits: 2 })}` : "—"}</td>
                    ))}
                    <td className="text-right expense">${total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
