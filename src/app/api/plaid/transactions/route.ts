import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { plaidStore } from '@/lib/plaid-store';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

const client = new PlaidApi(configuration);

export async function GET() {
  try {
    const accessToken = plaidStore.getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available. Please link your bank account first.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30); // Get last 30 days of transactions

    const response = await client.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    });

    const transactions = response.data.transactions.map(transaction => ({
      id: transaction.transaction_id,
      date: transaction.date,
      description: transaction.name,
      amount: transaction.amount,
      pending: transaction.pending,
      category: transaction.category?.[0] || 'Other',
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
