'use client';

import { useEffect, Suspense } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useRouter, useSearchParams } from 'next/navigation';

function OAuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { open, ready } = usePlaidLink({
    token: null, // Leave this as null for OAuth redirect
    receivedRedirectUri: window.location.href,
    onSuccess: async (public_token, metadata) => {
      try {
        // Exchange the public token for an access token
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

        // Redirect back to home page
        router.push('/');
      } catch (error) {
        console.error('Error exchanging token:', error);
        // TODO: Show error to user
        router.push('/');
      }
    },
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to your bank...</h1>
        <p className="text-muted-foreground">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
}

export default function OAuthRedirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuthRedirectContent />
    </Suspense>
  );
}
