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

export async function POST(request: Request) {
  try {
    const { public_token } = await request.json();

    const response = await client.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = response.data.access_token;
    // Store the access token in our simple store
    plaidStore.setAccessToken(accessToken);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
