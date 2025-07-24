"use client"

import { useState, useMemo, type FC } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { TransactionIcon } from "./transaction-icon"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "description-asc"
  | "description-desc"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const TransactionList: FC<{ transactions: Transaction[] }> = ({
  transactions,
}) => {
  const [sort, setSort] = useState<SortOption>("date-desc")

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "amount-desc":
          return b.amount - a.amount
        case "amount-asc":
          return a.amount - b.amount
        case "description-asc":
          return a.description.localeCompare(b.description)
        case "description-desc":
          return b.description.localeCompare(a.description)
        case "date-desc":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
  }, [transactions, sort])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <div className="w-full md:w-[240px]">
          <Select
            onValueChange={(value) => setSort(value as SortOption)}
            defaultValue="date-desc"
          >
            <SelectTrigger aria-label="Sort transactions">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (Newest first)</SelectItem>
              <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
              <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
              <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
              <SelectItem value="description-asc">Description (A-Z)</SelectItem>
              <SelectItem value="description-desc">
                Description (Z-A)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Date
              </TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <TransactionIcon category={transaction.category} />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {transaction.description}
                      </span>
                      <span className="text-sm text-muted-foreground md:hidden">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-right md:table-cell">
                  {format(new Date(transaction.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono",
                    transaction.amount > 0 ? "text-chart-2" : "text-foreground"
                  )}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="hidden text-right lg:table-cell">
                  <Badge
                    variant={
                      transaction.status === "pending" ? "secondary" : "outline"
                    }
                    className="capitalize"
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
