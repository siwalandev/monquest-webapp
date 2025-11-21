'use client';

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { type ReactNode } from 'react';

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        // Appearance
        appearance: {
          theme: 'dark',
          accentColor: '#22c55e',
        },
        // Login methods
        loginMethods: ['wallet'],
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
