'use client';

import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAccount } from 'wagmi';

import { GameShell } from '@/components/game/GameShell';
import { NeonButton } from '@/components/ui/NeonButton';
import { Panel } from '@/components/ui/Panel';

export default function PlayPage() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:max-w-5xl lg:py-12 xl:max-w-6xl xl:py-16">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 lg:mb-10">
        <Link href="/">
          <NeonButton tone="secondary" size="sm">
            ← Menu
          </NeonButton>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {isConnected ? (
            <Link href="/leaderboard">
              <NeonButton tone="ghost" size="sm">
                🏆 Leaderboard
              </NeonButton>
            </Link>
          ) : null}
          <ConnectButton
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }}
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </header>

      {isConnected ? (
        <GameShell />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 items-center justify-center"
        >
          <Panel
            variant="glass"
            tone="sky"
            className="w-full max-w-md space-y-6 p-8 text-center lg:max-w-lg lg:space-y-8 lg:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-sky-600 shadow-[0_8px_24px_-6px_rgba(14,165,233,0.55)] lg:h-20 lg:w-20 lg:rounded-3xl">
              <span className="text-3xl lg:text-4xl">🔒</span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-gradient-ocean lg:text-3xl">
                Connect to play
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-600 lg:mt-3 lg:text-base">
                Bubble Pop runs on Base. Connect your wallet to enter the arcade and submit scores on-chain.
              </p>
            </div>
            <NeonButton
              tone="primary"
              size="lg"
              fullWidth
              onClick={() => openConnectModal?.()}
              className="lg:py-5 lg:text-lg"
            >
              🔗 Connect Wallet
            </NeonButton>
          </Panel>
        </motion.div>
      )}
    </main>
  );
}
