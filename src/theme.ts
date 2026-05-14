export const COLORS = {
  bg: "#0C0E14",
  card: "#13161F",
  border: "#1E2230",
  text: "#E8ECF4",
  muted: "#5A6478",
  accent: "#34EAA0",
};

export const CATEGORIES = [
  { id: "food",          label: "Food",      icon: "🍔", color: "#FF6B6B" },
  { id: "transport",     label: "Transport", icon: "🚗", color: "#4ECDC4" },
  { id: "shopping",      label: "Shopping",  icon: "🛍️",  color: "#FFE66D" },
  { id: "health",        label: "Health",    icon: "💊", color: "#A8E6CF" },
  { id: "entertainment", label: "Fun",       icon: "🎮", color: "#C7A6FF" },
  { id: "bills",         label: "Bills",     icon: "🧾", color: "#FF9A3C" },
  { id: "education",     label: "Education", icon: "📚", color: "#74B9FF" },
  { id: "other",         label: "Other",     icon: "📦", color: "#B2BEC3" },
];

export function getCategoryById(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
