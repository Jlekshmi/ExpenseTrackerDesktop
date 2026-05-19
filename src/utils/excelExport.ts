import * as XLSX from "xlsx";
import type { Category, Transaction } from "../types";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function exportYearToExcel(year: number, transactions: Transaction[], categories: Category[]) {
  const wb = XLSX.utils.book_new();
  const yearTx = transactions.filter((t) => t.year === year);

  // ── Sheet 1: All Transactions ──────────────────────────
  const txRows = yearTx
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const d = new Date(t.date);
      return {
        Date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        Description: t.description || "",
        Category: cat?.name ?? t.categoryId,
        Amount: t.amount,
        Type: t.type === "income" ? "Income" : "Expense",
        Month: MONTHS[d.getMonth()],
      };
    });

  const ws1 = XLSX.utils.json_to_sheet(txRows.length > 0 ? txRows : [{ Date: "", Description: "", Category: "", Amount: "", Type: "", Month: "" }]);

  // Column widths
  ws1["!cols"] = [{ wch: 12 }, { wch: 28 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Transactions");

  // ── Sheet 2: Monthly Summary ───────────────────────────
  const summaryRows = MONTHS_SHORT.map((m, i) => {
    const mx = yearTx.filter((t) => t.month === i);
    const income  = mx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = mx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return {
      Month: m,
      Income: income || 0,
      Expenses: expense || 0,
      "Net Savings": income - expense,
    };
  });

  // Totals row
  const totalIncome  = summaryRows.reduce((s, r) => s + r.Income, 0);
  const totalExpense = summaryRows.reduce((s, r) => s + r.Expenses, 0);
  summaryRows.push({ Month: "TOTAL", Income: totalIncome, Expenses: totalExpense, "Net Savings": totalIncome - totalExpense });

  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  ws2["!cols"] = [{ wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Monthly Summary");

  // ── Sheet 3: Category Breakdown ───────────────────────
  const expenseCats = categories.filter((c) => c.type === "expense");
  const catRows = expenseCats
    .map((cat) => {
      const row: Record<string, string | number> = { Category: cat.name };
      let total = 0;
      MONTHS_SHORT.forEach((m, i) => {
        const amt = yearTx
          .filter((t) => t.month === i && t.categoryId === cat.id && t.type === "expense")
          .reduce((s, t) => s + t.amount, 0);
        row[m] = amt || 0;
        total += amt;
      });
      row["Total"] = total;
      return row;
    })
    .filter((r) => (r["Total"] as number) > 0);

  if (catRows.length > 0) {
    const ws3 = XLSX.utils.json_to_sheet(catRows);
    ws3["!cols"] = [{ wch: 18 }, ...MONTHS_SHORT.map(() => ({ wch: 10 })), { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Category Breakdown");
  }

  XLSX.writeFile(wb, `Finance_Tracker_${year}.xlsx`);
}
