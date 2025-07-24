import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

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

export async function POST() {
  try {
    const request = {
      user: {
        client_user_id: 'user-' + Math.random().toString(36).substring(2, 15),
      },
      client_name: 'Transaction Tracker',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/oauth-redirect`
    };

    const response = await client.linkTokenCreate(request);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating link token:', {
      error: error.response?.data || error,
      status: error.response?.status
    });
    return NextResponse.json(
      { error: error.response?.data?.error_message || 'Failed to create link token' },
      { status: error.response?.status || 500 }
    );
  }
}
