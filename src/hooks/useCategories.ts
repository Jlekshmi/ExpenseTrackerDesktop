import { useState, useCallback } from "react";
import type { Category, CategoryType } from "../types";
import { SEED_CATEGORIES } from "../constants/seedCategories";

const KEY = "et_categories";

function load(): Category[] {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(KEY, JSON.stringify(SEED_CATEGORIES));
    return SEED_CATEGORIES;
  } catch {
    return SEED_CATEGORIES;
  }
}

function save(cats: Category[]) {
  localStorage.setItem(KEY, JSON.stringify(cats));
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(load);

  const addCategory = useCallback((name: string, type: CategoryType) => {
    const cat: Category = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      type,
    };
    setCategories((prev) => {
      const updated = [...prev, cat];
      save(updated);
      return updated;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  return { categories, addCategory, deleteCategory };
}
