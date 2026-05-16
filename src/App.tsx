import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { MonthView } from "./components/MonthView";
import { YearlySummary } from "./components/YearlySummary";
import { CategoryManager } from "./components/CategoryManager";
import { useTransactions } from "./hooks/useTransactions";
import { useCategories } from "./hooks/useCategories";
import "./App.css";

type View =
  | { type: "month"; year: number; month: number }
  | { type: "yearly"; year: number }
  | { type: "categories" };

type Theme = "dark" | "light";

function getSavedTheme(): Theme {
  return (localStorage.getItem("et_theme") as Theme) ?? "dark";
}

export default function App() {
  const now = new Date();
  const [view, setView] = useState<View>({ type: "month", year: now.getFullYear(), month: now.getMonth() });
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories, addCategory, deleteCategory } = useCategories();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("et_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => t === "dark" ? "light" : "dark");

  return (
    <div className="layout">
      <Sidebar
        transactions={transactions}
        view={view}
        theme={theme}
        onSelect={setView}
        onThemeToggle={toggleTheme}
      />
      <main className="content-area">
        {view.type === "month" && (
          <MonthView
            year={view.year}
            month={view.month}
            transactions={transactions}
            categories={categories}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        )}
        {view.type === "yearly" && (
          <YearlySummary
            year={view.year}
            transactions={transactions}
            categories={categories}
          />
        )}
        {view.type === "categories" && (
          <CategoryManager
            categories={categories}
            onAdd={addCategory}
            onDelete={deleteCategory}
          />
        )}
      </main>
    </div>
  );
}
