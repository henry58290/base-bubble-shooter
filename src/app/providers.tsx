'use client';

import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { WagmiProvider } from 'wagmi';

import { wagmiConfig } from '@/lib/wagmi';

export function Providers({ children }: { children: ReactNode }) {
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
          theme={lightTheme({
            accentColor: '#0ea5e9',
            accentColorForeground: '#ffffff',
            borderRadius: 'large',
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
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#0c4a6e',
                border: '1px solid rgba(186, 230, 253, 0.7)',
                borderRadius: '14px',
                boxShadow:
                  '0 12px 32px -8px rgba(14, 165, 233, 0.25), 0 4px 12px -4px rgba(2, 132, 199, 0.18)',
                fontFamily: 'var(--font-sans), Inter, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                padding: '12px 16px',
                backdropFilter: 'blur(12px)',
              },
              success: {
                iconTheme: { primary: '#0ea5e9', secondary: '#ffffff' },
              },
              error: {
                iconTheme: { primary: '#fb7185', secondary: '#ffffff' },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
