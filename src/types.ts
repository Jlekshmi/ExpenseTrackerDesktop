export type CategoryType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  categoryId: string;
  amount: number;
  type: CategoryType;
  year: number;
  month: number;
};
