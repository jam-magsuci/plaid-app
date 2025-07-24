import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transaction-list"
import { transactions } from "@/lib/dummy-data"
import { PlusCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="container mx-auto p-4 py-8 md:p-8">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Transaction Tracker
            </h1>
            <p className="text-muted-foreground">
              A clear view of your financial transactions.
            </p>
          </div>
          <Button size="lg">
            <PlusCircle className="mr-2" />
            Link Bank Account
          </Button>
        </header>
        <main>
          <TransactionList transactions={transactions} />
        </main>
      </div>
    </div>
  )
}
