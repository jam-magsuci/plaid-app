import type { FC } from "react"
import {
  ShoppingCart,
  CircleDollarSign,
  Zap,
  Clapperboard,
  Fuel,
  Utensils,
  Sandwich,
  RefreshCw,
  Train,
} from "lucide-react"
import type { TransactionCategory } from "@/lib/types"

const iconMap: Record<TransactionCategory, React.ElementType> = {
  Shopping: ShoppingCart,
  Income: CircleDollarSign,
  Utilities: Zap,
  Entertainment: Clapperboard,
  Gas: Fuel,
  Groceries: Utensils,
  Food: Sandwich,
  Subscription: RefreshCw,
  Transport: Train,
}

export const TransactionIcon: FC<{ category: TransactionCategory }> = ({
  category,
}) => {
  const Icon = iconMap[category] || ShoppingCart
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}
