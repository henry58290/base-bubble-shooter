'use client';

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';

import { wagmiConfig } from '@/lib/wagmi';

export function Providers({ children }: { children: ReactNode }) {
  // QueryClient is intentionally constructed inside state so it survives
  // React Strict Mode double-invocation but isn't shared across requests on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00ff9d',
            accentColorForeground: '#05070a',
            borderRadius: 'medium',
            overlayBlur: 'small',
            fontStack: 'system',
          })}
          modalSize="compact"
        >
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#0c1117',
                color: '#00ff9d',
                border: '1px solid rgba(0,255,157,0.35)',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '12px',
                letterSpacing: '0.05em',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
