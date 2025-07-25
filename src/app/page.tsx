'use client';

import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transaction-list"
import { PlusCircle } from "lucide-react"
import { usePlaidLink } from "react-plaid-link"
import { useEffect, useState } from 'react';
import { usePlaidLinkToken, useExchangeToken, useTransactions } from "@/hooks/use-plaid"
import { useQueryClient } from "@tanstack/react-query";
import { DateRangeDialog } from "@/components/date-range-dialog";

export default function Home() {
  const queryClient = useQueryClient();
  const { mutate: getLinkToken, data: linkToken } = usePlaidLinkToken();
  const { mutate: exchangeToken } = useExchangeToken();
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>();
  const [showDateDialog, setShowDateDialog] = useState(false);
  const { data: transactions = [], isLoading } = useTransactions(dateRange);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? null,
    onSuccess: async (public_token) => {
      try {
        await exchangeToken(public_token);
      } catch (error) {
        console.error('Error exchanging token:', error);
      }
    },
    onExit: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['institution'] });
    }
  });

  useEffect(() => {
    if (!linkToken) {
      getLinkToken();
    }
  }, [getLinkToken, linkToken]);

  const handleConnectBank = () => {
    if (!ready || !linkToken) return;
    setShowDateDialog(true); // Open the date picker dialog
  };

  const handleDateSelected = (range: { startDate: string; endDate: string }) => {
    setDateRange(range);
    if (ready && linkToken) {
      open(); // Only open Plaid after dates are confirmed
    }
  };

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
          <div className="flex gap-2">
            <Button 
              size="lg" 
              onClick={handleConnectBank}
              disabled={!ready}
            >
              <PlusCircle className="mr-2" />
              Link Bank Account
            </Button>
            <DateRangeDialog 
              open={showDateDialog}
              onOpenChange={setShowDateDialog}
              onDateRangeSelected={handleDateSelected}
            />
          </div>
        </header>
        <main>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <TransactionList transactions={transactions} />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-2">
                No transactions yet. Link your bank account to get started.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
