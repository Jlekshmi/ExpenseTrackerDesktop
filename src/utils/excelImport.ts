import * as XLSX from "xlsx";
import type { Category, Transaction } from "../types";

export type ImportResult = {
  imported: Omit<Transaction, "id">[];
  skipped: number;
  errors: string[];
};

function parseDate(raw: unknown): Date | null {
  if (!raw) return null;

  // Excel serial number
  if (typeof raw === "number") {
    return XLSX.SSF.parse_date_code(raw) ? new Date(Date.UTC(
      XLSX.SSF.parse_date_code(raw).y,
      XLSX.SSF.parse_date_code(raw).m - 1,
      XLSX.SSF.parse_date_code(raw).d
    )) : null;
  }

  // String date — try multiple formats
  const str = String(raw).trim();
  const formats = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,   // 2026-01-15
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // 01/15/2026
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,    // 01-15-2026
  ];

  for (const fmt of formats) {
    const m = str.match(fmt);
    if (m) {
      const [, a, b, c] = m.map(Number);
      // YYYY-MM-DD
      if (a > 1000) return new Date(Date.UTC(a, b - 1, c));
      // DD/MM/YYYY or MM/DD/YYYY — assume MM/DD/YYYY
      return new Date(Date.UTC(c, a - 1, b));
    }
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function matchCategory(raw: string, categories: Category[]): Category | null {
  const q = raw.trim().toLowerCase();
  return (
    categories.find((c) => c.name.toLowerCase() === q) ??
    categories.find((c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase())) ??
    null
  );
}

export function importFromExcel(file: File, categories: Category[]): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result: ImportResult = { imported: [], skipped: 0, errors: [] };

      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: false });

        // Use first sheet
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (rows.length === 0) {
          result.errors.push("No data found in the first sheet.");
          resolve(result);
          return;
        }

        // Detect columns (case-insensitive)
        const firstRow = rows[0];
        const keys = Object.keys(firstRow);

        const col = (names: string[]) =>
          keys.find((k) => names.some((n) => k.toLowerCase().includes(n.toLowerCase()))) ?? "";

        const dateCol   = col(["date"]);
        const descCol   = col(["description", "desc", "note", "details"]);
        const catCol    = col(["category", "cat"]);
        const amtCol    = col(["amount", "amt", "price", "cost"]);
        const typeCol   = col(["type", "income/expense", "in/ex"]);

        if (!dateCol || !catCol || !amtCol) {
          result.errors.push("Could not find required columns (Date, Category, Amount). Please check your Excel format.");
          resolve(result);
          return;
        }

        rows.forEach((row, i) => {
          const rawDate   = row[dateCol];
          const rawCat    = String(row[catCol] || "").trim();
          const rawAmt    = row[amtCol];
          const rawType   = String(row[typeCol] || "expense").trim().toLowerCase();
          const rawDesc   = String(row[descCol] || "").trim();

          // Skip empty rows
          if (!rawDate && !rawCat && !rawAmt) { result.skipped++; return; }

          const date = parseDate(rawDate);
          if (!date) { result.errors.push(`Row ${i + 2}: invalid date "${rawDate}"`); result.skipped++; return; }

          const amount = parseFloat(String(rawAmt).replace(/[,$]/g, ""));
          if (isNaN(amount) || amount <= 0) { result.errors.push(`Row ${i + 2}: invalid amount "${rawAmt}"`); result.skipped++; return; }

          if (!rawCat) { result.errors.push(`Row ${i + 2}: missing category`); result.skipped++; return; }

          const cat = matchCategory(rawCat, categories);
          if (!cat) { result.errors.push(`Row ${i + 2}: unknown category "${rawCat}" — add it in Categories first`); result.skipped++; return; }

          const type: "income" | "expense" = rawType.includes("income") ? "income" : "expense";

          result.imported.push({
            date: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0)).toISOString(),
            description: rawDesc,
            categoryId: cat.id,
            amount: parseFloat(amount.toFixed(2)),
            type,
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
          });
        });
      } catch (err) {
        result.errors.push(`Failed to read file: ${err}`);
      }

      resolve(result);
    };
    reader.readAsArrayBuffer(file);
  });
}
