# Neon Pop — On-chain Leaderboard

Solidity contracts for the Neon Pop Arcade game. Built with Foundry.

## Setup

```bash
cd contracts

# Install Foundry if you don't have it: https://book.getfoundry.sh/getting-started/installation
forge install foundry-rs/forge-std --no-commit
```

## Test

```bash
forge test -vv
```

## Deploy to Base Mainnet

Set environment variables (do **not** commit a real key):

```bash
export DEPLOYER_PRIVATE_KEY=0x...
export BASE_RPC_URL=https://mainnet.base.org
export BASESCAN_API_KEY=...   # only needed for --verify
```

Then run:

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url base \
  --broadcast \
  --verify
```

After the deploy succeeds, copy the printed address into the frontend's
`.env.local` as `NEXT_PUBLIC_LEADERBOARD_ADDRESS`.

## Contract surface

| Function                            | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| `submitScore(uint256)`              | Record caller's score; reverts unless it's a new PB. |
| `getTopScores()`                    | Returns the (≤20) globally sorted leaderboard.       |
| `getHighScore(address)`             | Returns a single player's all-time best.             |
| `leaderboardLength()`               | Number of populated leaderboard slots.               |
| `LEADERBOARD_SIZE` (constant)       | Hard cap on leaderboard length (20).                 |
