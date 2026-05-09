# Neon Pop Arcade

A neon-cyberpunk browser arcade game with an on-chain leaderboard living on **Base Mainnet**.

```
src/         Next.js 15 (App Router) + TypeScript + Tailwind + wagmi/viem/RainbowKit
contracts/   Foundry project — GameLeaderboard.sol + tests + deploy script
public/      static assets (drop /sounds/hit.mp3 etc. here in Step 4)
```

## Status

- [x] **Step 1** — Project scaffold + Web3 providers
- [x] **Step 2** — `GameLeaderboard.sol` + Foundry tests + deploy script
- [x] **Step 3** — Home, Game Over, and Leaderboard views
- [x] **Step 4** — Canvas game loop, hit detection, audio
- [x] **Step 5** — `submitScore` wiring + leaderboard reads

## On-chain submission flow

The Game Over screen runs the score through `submitScore()` on the deployed
GameLeaderboard contract. The button label tracks tx state:

| State            | Label                       | Toast                              |
| ---------------- | --------------------------- | ---------------------------------- |
| `idle`           | Submit Score On-Chain       | —                                  |
| `awaitingWallet` | Awaiting Wallet…            | `Awaiting wallet…`                 |
| `submitting`     | Submitting Transaction…     | `Submitting transaction…`          |
| `confirmed`      | Confirmed ⚡                | `Score recorded on Base ⚡`        |
| `error`          | Try Again                   | Decoded error (rejected, reverted, etc.) |

After confirmation the leaderboard query is invalidated and refetches
automatically. A `view on basescan ↗` link appears under the buttons once a
tx hash exists.

## Audio

The game expects two files under `public/sounds/`:

| File                       | Trigger                       |
| -------------------------- | ----------------------------- |
| `public/sounds/hit.mp3`    | Played on every successful pop |
| `public/sounds/gameover.mp3` | Played when a run ends       |

Drop your own sound files at those paths. Missing files are handled
silently — the game still runs, just without audio. Adjust volumes /
add new effects in `src/game/engine/audio.ts`.

## Frontend setup

```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_WC_PROJECT_ID (https://cloud.walletconnect.com)
# After deploying the contract, fill in NEXT_PUBLIC_LEADERBOARD_ADDRESS
npm run dev
```

Visit http://localhost:3000 — the landing screen renders the cyberpunk shell
with a working RainbowKit Connect button locked to Base Mainnet.

### Scripts

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Next.js dev server with hot reload.       |
| `npm run build`    | Production build.                         |
| `npm run start`    | Run the production build.                 |
| `npm run lint`     | ESLint via `next lint`.                   |
| `npm run typecheck`| Strict TypeScript check (`tsc --noEmit`). |

## Smart contract

See [`contracts/README.md`](./contracts/README.md) for build / test / deploy.

Quick version:

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
forge test -vv
```

## Tech stack

- **Frontend** — Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Web3** — wagmi 2, viem 2, RainbowKit 2, react-query 5
- **Toasts** — react-hot-toast (used in Step 5 for tx state)
- **Game** — HTML5 `<canvas>` (added in Step 4)
- **Contracts** — Solidity 0.8.24 + Foundry
- **Network** — Base Mainnet (chainId 8453)
