import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode } from 'plaid';
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
    const institutionId = plaidStore.getInstitutionId();
    
    if (!institutionId) {
      return NextResponse.json(
        { error: 'No institution ID found' },
        { status: 400 }
      );
    }

    const response = await client.institutionsGetById({
      institution_id: institutionId,
      country_codes: ['US' as CountryCode],
      options: {
        include_optional_metadata: true
      }
    });



    const institution = response.data.institution;

    console.log('institution', institution);
    
    
    return NextResponse.json({
      name: institution.name,
      logo: institution.logo ? `data:image/png;base64,${institution.logo}` : null,
      primaryColor: institution.primary_color,
    });
  } catch (error: any) {
    console.error('Error fetching institution:', {
      error: error.response?.data || error,
      status: error.response?.status
    });
    return NextResponse.json(
      { error: error.response?.data?.error_message || 'Failed to fetch institution' },
      { status: error.response?.status || 500 }
    );
  }
}
