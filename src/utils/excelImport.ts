import * as XLSX from "xlsx";
import type { Category, Transaction } from "../types";

const MONTH_NAMES_LONG  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_NAMES_SHORT = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

export type MonthGroup = {
  year: number;
  month: number;
  label: string;
  count: number;
};

export type ImportResult = {
  imported: Omit<Transaction, "id">[];
  monthGroups: MonthGroup[];
  skipped: number;
  errors: string[];
};

// ── Parse month index from sheet name ────────────────
// "Jan", "January", "Jan 2026", "02 - Feb" etc.
function parseSheetMonth(name: string): { year: number | null; month: number | null } {
  const lower = name.toLowerCase();
  const idx = MONTH_NAMES_SHORT.findIndex((m) => lower.includes(m));
  if (idx === -1) return { year: null, month: null };

  const yearMatch = name.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  return { year, month: idx };
}

// ── Parse date value from a cell ─────────────────────
function parseDate(raw: unknown): Date | null {
  if (raw === null || raw === undefined || raw === "") return null;

  if (typeof raw === "number") {
    const p = XLSX.SSF.parse_date_code(raw);
    if (!p) return null;
    return new Date(Date.UTC(p.y, p.m - 1, p.d));
  }

  const str = String(raw).trim();
  if (!str) return null;

  const patterns = [
    { re: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, y: 0, m: 1, d: 2 },
    { re: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, y: 2, m: 0, d: 1 },
  ];
  for (const { re, y, m, d } of patterns) {
    const match = str.match(re);
    if (match) {
      const p = match.slice(1).map(Number);
      return new Date(Date.UTC(p[y], p[m] - 1, p[d]));
    }
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// ── Match category name ───────────────────────────────
function matchCategory(raw: string, categories: Category[]): Category | null {
  const q = raw.trim().toLowerCase();
  if (!q) return null;
  return (
    categories.find((c) => c.name.toLowerCase() === q) ??
    categories.find((c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase())) ??
    null
  );
}

// ── Skip non-data rows ────────────────────────────────
function isSkippableRow(row: Record<string, unknown>, keys: string[]): boolean {
  // Row is empty
  if (keys.every((k) => !row[k] || String(row[k]).trim() === "")) return true;
  // Row looks like a header or summary line
  const first = String(Object.values(row)[0] ?? "").toLowerCase();
  const skip = ["total", "net", "income", "expense category", "date", "tracker", "summary"];
  if (skip.some((s) => first.includes(s))) return true;
  return false;
}

// ── Find header row and return column map ─────────────
function findColumns(ws: XLSX.WorkSheet): {
  dateCol: number; descCol: number; catCol: number; amtCol: number; typeCol: number; headerRow: number;
} | null {
  const ref = ws["!ref"];
  if (!ref) return null;
  const range = XLSX.utils.decode_range(ref);

  // Scan first 15 rows to find header row
  for (let r = range.s.r; r <= Math.min(range.s.r + 14, range.e.r); r++) {
    const cells: string[] = [];
    for (let c = range.s.c; c <= Math.min(range.s.c + 8, range.e.c); c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      cells.push(cell ? String(cell.v ?? "").toLowerCase().trim() : "");
    }

    const dateCol  = cells.findIndex((v) => v === "date");
    const catCol   = cells.findIndex((v) => v.includes("category") || v === "cat");
    const amtCol   = cells.findIndex((v) => v.includes("amount") || v === "amt");
    const typeCol  = cells.findIndex((v) => v.includes("type") || v.includes("income/expense"));
    const descCol  = cells.findIndex((v) => v.includes("desc") || v.includes("note") || v.includes("particular"));

    if (catCol >= 0 && amtCol >= 0) {
      return { dateCol, descCol, catCol, amtCol, typeCol, headerRow: r };
    }
  }
  return null;
}

// ── Process one sheet ─────────────────────────────────
function processSheet(
  ws: XLSX.WorkSheet,
  sheetName: string,
  fallbackYear: number,
  categories: Category[],
  result: ImportResult
) {
  const colMap = findColumns(ws);
  if (!colMap) return; // no recognisable header — skip sheet

  const { dateCol, descCol, catCol, amtCol, typeCol, headerRow } = colMap;
  const { month: sheetMonth, year: sheetYear } = parseSheetMonth(sheetName);
  const resolvedYear  = sheetYear  ?? fallbackYear;

  const ref   = ws["!ref"]!;
  const range = XLSX.utils.decode_range(ref);

  // Read every data row after the header
  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const cell = (c: number) => {
      if (c < 0) return "";
      const addr = XLSX.utils.encode_cell({ r, c: range.s.c + c });
      const v = ws[addr]?.v;
      return v === undefined || v === null ? "" : String(v).trim();
    };

    const rawCat  = cell(catCol);
    const rawAmt  = cell(amtCol);
    const rawDate = cell(dateCol);
    const rawType = cell(typeCol).toLowerCase();
    const rawDesc = cell(descCol);

    // Skip blank / summary rows
    if (!rawCat && !rawAmt) { result.skipped++; continue; }
    if (!rawCat) { result.skipped++; continue; }

    // Skip right-side summary rows (category total rows that have no amount in our column
    // or look like section headers)
    const catLower = rawCat.toLowerCase();
    if (["expense category","income category","category"].includes(catLower)) { result.skipped++; continue; }

    // Amount
    const amount = parseFloat(rawAmt.replace(/[$,\s]/g, ""));
    if (isNaN(amount) || amount <= 0) { result.skipped++; continue; }

    // Category
    const cat = matchCategory(rawCat, categories);
    if (!cat) {
      result.errors.push(`Sheet "${sheetName}" row ${r + 1}: unknown category "${rawCat}"`);
      result.skipped++;
      continue;
    }

    // Date — use cell date if present, otherwise fall back to sheet month
    let year  = resolvedYear;
    let month = sheetMonth ?? 0;
    let day   = 1;

    const parsedDate = parseDate(rawDate || (dateCol >= 0 ? ws[XLSX.utils.encode_cell({ r, c: range.s.c + dateCol })]?.v : ""));
    if (parsedDate) {
      year  = parsedDate.getUTCFullYear();
      month = parsedDate.getUTCMonth();
      day   = parsedDate.getUTCDate();
    } else if (sheetMonth === null) {
      result.errors.push(`Sheet "${sheetName}" row ${r + 1}: no date and could not determine month from sheet name`);
      result.skipped++;
      continue;
    }

    const type: "income" | "expense" = rawType.includes("income") ? "income" : "expense";

    result.imported.push({
      date: new Date(Date.UTC(year, month, day, 12, 0, 0)).toISOString(),
      description: rawDesc,
      categoryId: cat.id,
      amount: parseFloat(amount.toFixed(2)),
      type,
      year,
      month,
    });
  }
}

// ── Sheets to skip ────────────────────────────────────
const SKIP_SHEETS = ["yearly summary","yearly","summary","lookups","lookup","nl"];

// ── Main entry point ──────────────────────────────────
export function importFromExcel(file: File, categories: Category[]): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result: ImportResult = { imported: [], monthGroups: [], skipped: 0, errors: [] };

      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: "array", cellDates: false });
        const fallbackYear = new Date().getFullYear();

        wb.SheetNames.forEach((name) => {
          if (SKIP_SHEETS.includes(name.toLowerCase().trim())) return;
          processSheet(wb.Sheets[name], name, fallbackYear, categories, result);
        });

        if (result.imported.length === 0 && result.errors.length === 0) {
          result.errors.push("No valid transactions found. Make sure your sheets have Date, Category, Amount and Type columns.");
        }

        // Build month groups
        const groupMap = new Map<string, MonthGroup>();
        result.imported.forEach((t) => {
          const key = `${t.year}-${t.month}`;
          if (!groupMap.has(key)) {
            groupMap.set(key, { year: t.year, month: t.month, label: `${MONTH_NAMES_LONG[t.month]} ${t.year}`, count: 0 });
          }
          groupMap.get(key)!.count++;
        });

        result.monthGroups = Array.from(groupMap.values())
          .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

      } catch (err) {
        result.errors.push(`Failed to read file: ${String(err)}`);
      }

      resolve(result);
    };

    reader.readAsArrayBuffer(file);
  });
}
