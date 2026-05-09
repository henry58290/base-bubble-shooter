import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {other: {"base:app_id": "69fece45de2c01f9557d2dd8"},
  title: 'Neon Pop Arcade — On-chain Bubble Shooter on Base',
  description:
    'A neon arcade bubble shooter with an on-chain leaderboard living on Base Mainnet.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  // Lock to portrait-friendly viewport for mobile gameplay; canvas scales itself.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#05070a',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-neon-green antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
