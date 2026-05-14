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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-10 lg:py-16 xl:py-20">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl"
      >
        <div className="glass-strong neon-border rounded-[28px] p-7 sm:p-10 lg:rounded-[32px] lg:p-14 xl:p-16">
          <header className="space-y-6 text-center lg:space-y-8">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_30%_20%,rgba(74,222,128,0.18),rgba(8,14,22,0.92))] ring-1 ring-emerald-400/45 shadow-[0_0_40px_-6px_rgba(74,222,128,0.55),inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:h-28 sm:w-28 lg:h-32 lg:w-32 lg:rounded-[26px] xl:h-36 xl:w-36"
            >
              <Image
                src="/basedlogo.png"
                alt="Bubble Pop on Base"
                width={144}
                height={144}
                priority
                className="h-full w-full object-contain p-1.5"
              />
            </motion.div>

            <div className="space-y-3 lg:space-y-4">
              <h1 className="font-display text-[44px] font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                Bubble <span className="text-gradient-neon">Pop</span>
              </h1>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-300/85 sm:text-base lg:max-w-sm lg:text-lg xl:max-w-md xl:text-xl">
                Pop bubbles, chain combos, climb the on-chain leaderboard.
              </p>
            </div>
          </header>

          <div className="mt-9 flex flex-col gap-3.5 lg:mt-12 lg:gap-4">
            {isConnected ? (
              <>
                <Link href="/play" className="w-full">
                  <NeonButton tone="primary" size="lg" fullWidth className="lg:py-5 lg:text-lg">
                    <span className="text-lg lg:text-xl">▶</span>
                    Play Now
                  </NeonButton>
                </Link>
                <Link href="/leaderboard" className="w-full">
                  <NeonButton tone="secondary" size="md" fullWidth className="lg:py-4 lg:text-base">
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
                  className="uppercase tracking-[0.18em] lg:py-5 lg:text-lg"
                >
                  Connect Wallet
                </NeonButton>
                <p className="mt-1 text-center text-[11px] leading-relaxed text-slate-400 lg:text-xs">
                  Mandatory wallet connection · Base mainnet
                </p>
              </>
            )}
          </div>
        </div>

        <footer className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium tracking-wide text-slate-500 lg:mt-8 lg:text-xs">
          <span>Built on</span>
          <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 font-semibold text-emerald-300 ring-1 ring-emerald-400/35 shadow-[0_0_14px_-4px_rgba(74,222,128,0.6)]">
            Base
          </span>
          <span>· Next.js · wagmi</span>
        </footer>
      </motion.section>
    </main>
  );
}
