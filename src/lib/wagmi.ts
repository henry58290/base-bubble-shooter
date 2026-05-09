import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  base as baseSmartWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
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

// `base` is RainbowKit's dedicated Base Smart Wallet helper (rdns
// `app.base.account`). It supersedes the legacy `coinbaseWallet` helper for
// Smart Wallet flows. Configuration is set as a *property on the helper
// itself* — that's its public API per its TypeScript declaration:
//
//   interface Base extends AcceptedBaseParameters {
//     (params: BaseOptions): Wallet;
//   }
//
// `preference.options = 'all'` means: prefer an injected provider when one is
// available (e.g. inside the Base / Coinbase Wallet in-app browser), and fall
// back to the Smart Wallet passkey flow elsewhere. Without this, the SDK can
// race against the in-app browser's `window.ethereum` and fail to resolve.
baseSmartWallet.preference = { options: 'all' };

// `injectedWallet` is listed first so any in-app dapp browser's
// `window.ethereum` is picked up immediately. The Smart Wallet entry then
// covers the standalone-browser case via passkey.
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet, baseSmartWallet],
    },
    {
      groupName: 'Other',
      wallets: [metaMaskWallet, walletConnectWallet, rainbowWallet],
    },
  ],
  {
    appName: 'Neon Pop Arcade',
    appDescription: 'On-chain bubble shooter on Base Mainnet',
    projectId,
  },
);

export const wagmiConfig = createConfig({
  chains: [SUPPORTED_CHAIN],
  connectors,
  // EIP-6963 multi-injected discovery (default true) so pages where several
  // wallets compete for `window.ethereum` still surface every option.
  multiInjectedProviderDiscovery: true,
  transports: {
    [SUPPORTED_CHAIN.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  },
  ssr: true,
});
