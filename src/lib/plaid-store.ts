// Note: This is a simple in-memory store for demo purposes.
// In production, use a proper database to store access tokens securely.
let accessToken: string | null = null;

export const plaidStore = {
  setAccessToken: (token: string) => {
    accessToken = token;
  },
  getAccessToken: () => accessToken,
};
