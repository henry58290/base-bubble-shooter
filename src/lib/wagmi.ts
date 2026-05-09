import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { base } from 'wagmi/chains';

// We deliberately ship a *single* chain (Base Mainnet, chainId 8453) so that
// RainbowKit's network switcher cannot accidentally land the user on a chain
// where the leaderboard contract isn't deployed.
export const SUPPORTED_CHAIN = base;

// Use `||` (not `??`) so an empty-string env var (`NEXT_PUBLIC_WC_PROJECT_ID=`)
// also falls through to the dev fallback. RainbowKit rejects `""` outright.
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'NEON_POP_ARCADE_DEV';

if (projectId === 'NEON_POP_ARCADE_DEV' && typeof window !== 'undefined') {
  // Surfaced in the browser console only — keeps SSR logs quiet.
  // eslint-disable-next-line no-console
  console.warn(
    '[wagmi] NEXT_PUBLIC_WC_PROJECT_ID is not set. WalletConnect features will be limited.',
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Neon Pop Arcade',
  projectId,
  chains: [SUPPORTED_CHAIN],
  transports: {
    [SUPPORTED_CHAIN.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  },
  ssr: true,
});
