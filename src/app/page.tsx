'use client';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';

import { NeonButton } from '@/components/ui/NeonButton';

export default function HomePage() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-glass-lg sm:p-12">
          <header className="space-y-5 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200/60 via-white/70 to-sky-100/60 shadow-[0_12px_32px_-8px_rgba(14,165,233,0.4)] ring-1 ring-white/70 sm:h-28 sm:w-28"
            >
              <Image
                src="/basedlogo.png"
                alt="Bubble Pop on Base"
                width={112}
                height={112}
                priority
                className="h-full w-full object-contain p-1"
              />
            </motion.div>

            <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-gradient-ocean sm:text-6xl">
              Bubble Pop
            </h1>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-600 sm:text-base">
              Pop bubbles, chain combos, climb the on-chain leaderboard.
            </p>
          </header>

          <div className="mt-10 flex flex-col gap-3">
            {isConnected ? (
              <>
                <Link href="/play" className="w-full">
                  <NeonButton tone="primary" size="lg" fullWidth>
                    <span className="text-lg">▶</span>
                    Play Now
                  </NeonButton>
                </Link>
                <Link href="/leaderboard" className="w-full">
                  <NeonButton tone="secondary" size="md" fullWidth>
                    🏆 Leaderboard
                  </NeonButton>
                </Link>
              </>
            ) : (
              <>
                <NeonButton
                  tone="primary"
                  size="lg"
                  fullWidth
                  onClick={() => openConnectModal?.()}
                >
                  <span className="text-lg">🔗</span>
                  Connect Wallet to Play
                </NeonButton>
                <p className="text-center text-[11px] leading-relaxed text-ink-400">
                  Connect your wallet on Base to enter the arcade.
                </p>
              </>
            )}
          </div>
        </div>

        <footer className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium tracking-wide text-sky-700/70">
          <span>Built on</span>
          <span className="rounded-full bg-white/70 px-2.5 py-0.5 font-semibold text-sky-700 ring-1 ring-sky-200">
            Base
          </span>
          <span>· Next.js · wagmi · viem</span>
        </footer>
      </motion.section>
    </main>
  );
}
