// Note: This is a simple in-memory store for demo purposes.
// In production, use a proper database to store access tokens securely.
let accessToken: string | null = null;

export const plaidStore = {
  setAccessToken: (token: string) => {
    accessToken = token;
    console.log('Access token set in store');
  },
  getAccessToken: () => {
    console.log('Getting access token from store:', accessToken ? 'token exists' : 'no token');
    return accessToken;
  },
};
