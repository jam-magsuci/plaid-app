'use client';

import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transaction-list"
import { PlusCircle } from "lucide-react"
import { usePlaidLink } from "react-plaid-link"
import { useState, useCallback, useEffect } from "react"
import type { Transaction } from "@/lib/types"

export default function Home() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/plaid/transactions');
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400) {
          // No access token yet, this is expected for new users
          setIsLoading(false);
          return;
        }
        throw new Error(error.message || 'Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const response = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }

        // Fetch updated transactions
        await fetchTransactions();
      } catch (error) {
        console.error('Error exchanging token:', error);
      }
    },
  });

  const fetchLinkToken = useCallback(async () => {
    try {
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
      });
      const { link_token } = await response.json();
      setLinkToken(link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
    }
  }, []);

  // Fetch link token on mount
  useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  const handleClick = useCallback(() => {
    if (ready) {
      open();
    }
  }, [open, ready]);

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
          <Button 
            size="lg" 
            onClick={handleClick}
            disabled={!ready}
          >
            <PlusCircle className="mr-2" />
            Link Bank Account
          </Button>
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
