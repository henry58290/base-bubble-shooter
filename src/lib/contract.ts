import type { Address } from 'viem';

/**
 * Address of the deployed GameLeaderboard contract on Base Mainnet.
 * Set NEXT_PUBLIC_LEADERBOARD_ADDRESS in `.env.local` after deploying.
 */
// `||` so an empty-string env var (`NEXT_PUBLIC_LEADERBOARD_ADDRESS=`) also falls
// through to the zero-address default; downstream code uses `isLeaderboardConfigured`.
export const LEADERBOARD_ADDRESS = (process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS ||
  '0x0000000000000000000000000000000000000000') as Address;

export const isLeaderboardConfigured =
  LEADERBOARD_ADDRESS !== '0x0000000000000000000000000000000000000000';

/**
 * ABI for GameLeaderboard.sol — kept inline so the frontend has no build-time
 * dependency on the contracts package. Keep in sync with `contracts/src/GameLeaderboard.sol`.
 */
export const LEADERBOARD_ABI = [
  {
    type: 'function',
    name: 'submitScore',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newScore', type: 'uint256' }],
    outputs: [],
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
