import { type Address, getAddress, parseEther } from 'viem';

/**
 * Protocol fee charged per on-chain score submission. Must match
 * `SUBMISSION_FEE` in `contracts/src/GameLeaderboard.sol`.
 */
export const SUBMISSION_FEE_ETH = '0.000009';
export const SUBMISSION_FEE_WEI = parseEther(SUBMISSION_FEE_ETH);

/**
 * Address of the deployed GameLeaderboard contract on Base Mainnet.
 * Set NEXT_PUBLIC_LEADERBOARD_ADDRESS in `.env` after deploying.
 */
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

// `||` so an empty-string env var (`NEXT_PUBLIC_LEADERBOARD_ADDRESS=`) also falls
// through to the zero-address default; downstream code uses `isLeaderboardConfigured`.
const rawAddress = (process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS || ZERO_ADDRESS).trim();

/**
 * Normalize through viem's `getAddress` so any case (lower / upper / mixed) in
 * the env file resolves to the canonical EIP-55 checksum. Without this,
 * `writeContract` rejects the address before even sending the tx.
 */
function safeChecksum(input: string): Address {
  try {
    return getAddress(input);
  } catch {
    return ZERO_ADDRESS;
  }
}

export const LEADERBOARD_ADDRESS: Address = safeChecksum(rawAddress);

export const isLeaderboardConfigured = LEADERBOARD_ADDRESS !== ZERO_ADDRESS;

/**
 * ABI for GameLeaderboard.sol — kept inline so the frontend has no build-time
 * dependency on the contracts package. Keep in sync with `contracts/src/GameLeaderboard.sol`.
 */
export const LEADERBOARD_ABI = [
  {
    type: 'function',
    name: 'submitScore',
    stateMutability: 'payable',
    inputs: [{ name: 'newScore', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdrawFees',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'transferOwnership',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newOwner', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'SUBMISSION_FEE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getTopScores',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'player', type: 'address' },
          { name: 'score', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getHighScore',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'leaderboardLength',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'LEADERBOARD_SIZE',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'ScoreSubmitted',
    anonymous: false,
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'score', type: 'uint256', indexed: false },
      { name: 'newHighScore', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'LeaderboardUpdated',
    anonymous: false,
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'score', type: 'uint256', indexed: false },
      { name: 'rank', type: 'uint256', indexed: false },
    ],
  },
] as const;

export type LeaderboardEntry = {
  player: Address;
  score: bigint;
};
