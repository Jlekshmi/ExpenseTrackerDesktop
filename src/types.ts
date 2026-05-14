export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export type NewExpense = Omit<Expense, "id">;
