// Note: This is a simple client-side store for demo purposes.
// In production, use a proper database to store access tokens and institution IDs securely.

// Initialize from localStorage if available (client-side only)
const initializeStore = () => {
  if (typeof window === 'undefined') return { accessToken: null, institutionId: null };
  
  try {
    return {
      accessToken: localStorage.getItem('plaid_access_token'),
      institutionId: localStorage.getItem('plaid_institution_id')
    };
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return { accessToken: null, institutionId: null };
  }
};

let { accessToken, institutionId } = initializeStore();

export const plaidStore = {
  setAccessToken: (token: string) => {
    accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('plaid_access_token', token);
    }
    console.log('Access token set in store');
  },
  getAccessToken: () => {
    console.log('Getting access token from store:', accessToken ? 'token exists' : 'no token');
    return accessToken;
  },
  setInstitutionId: (id: string) => {
    institutionId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('plaid_institution_id', id);
    }
    console.log('Institution ID set in store');
  },
  getInstitutionId: () => {
    console.log('Getting institution ID from store:', institutionId ? 'ID exists' : 'no ID');
    return institutionId;
  },
};
