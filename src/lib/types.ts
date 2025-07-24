export type TransactionCategory =
  | "Groceries"
  | "Income"
  | "Utilities"
  | "Entertainment"
  | "Shopping"
  | "Gas"
  | "Food"
  | "Subscription"
  | "Transport"

export type Transaction = {
  id: string
  date: string // ISO date string
  description: string
  amount: number // positive for income, negative for expense
  status: "posted" | "pending"
  category: TransactionCategory
}
