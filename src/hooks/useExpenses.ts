import { useState, useCallback } from "react";
import type { Expense, NewExpense } from "../types";

const STORAGE_KEY = "expenses_data";

function loadFromStorage(): Expense[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadFromStorage);

  const addExpense = useCallback((newExpense: NewExpense) => {
    const expense: Expense = {
      ...newExpense,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setExpenses((prev) => {
      const updated = [expense, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  return { expenses, addExpense, deleteExpense, updateExpense };
}
