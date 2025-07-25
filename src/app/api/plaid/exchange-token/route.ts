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
    const itemId = response.data.item_id;

    // Get item information to retrieve institution ID
    const itemResponse = await client.itemGet({
      access_token: accessToken
    });

    const institutionId = itemResponse.data.item.institution_id;
    if (!institutionId) {
      throw new Error('No institution ID found for this item');
    }

    // Store the access token and institution ID in our simple store
    plaidStore.setAccessToken(accessToken);
    plaidStore.setInstitutionId(institutionId);
    
    console.log('Successfully stored access token and institution ID:', { accessToken, institutionId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error exchanging public token:', {
      error: error.response?.data || error,
      status: error.response?.status
    });
    return NextResponse.json(
      { error: error.response?.data?.error_message || 'Failed to exchange token' },
      { status: error.response?.status || 500 }
    );
  }
}
