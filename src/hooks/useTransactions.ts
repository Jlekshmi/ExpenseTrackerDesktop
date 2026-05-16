import { useState, useCallback } from "react";
import type { Transaction } from "../types";

const KEY = "et_transactions";

function load(): Transaction[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function save(transactions: Transaction[]) {
  localStorage.setItem(KEY, JSON.stringify(transactions));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(load);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    const newT: Transaction = {
      ...t,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setTransactions((prev) => {
      const updated = [newT, ...prev];
      save(updated);
      return updated;
    });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      save(updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  const getByMonth = useCallback((year: number, month: number) =>
    transactions
      .filter((t) => t.year === year && t.month === month)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  return { transactions, addTransaction, updateTransaction, deleteTransaction, getByMonth };
}
