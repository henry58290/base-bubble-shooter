'use client';

import { useReadContract } from 'wagmi';

import {
  isLeaderboardConfigured,
  LEADERBOARD_ABI,
  LEADERBOARD_ADDRESS,
  type LeaderboardEntry,
} from '@/lib/contract';

type UseTopScoresResult = {
  entries: readonly LeaderboardEntry[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isConfigured: boolean;
};

/**
 * Reads the global top-20 from the GameLeaderboard contract on Base.
 * Falls back to an empty list if NEXT_PUBLIC_LEADERBOARD_ADDRESS isn't set yet.
 */
export function useTopScores(): UseTopScoresResult {
  const query = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: 'getTopScores',
    query: {
      enabled: isLeaderboardConfigured,
      refetchInterval: 15_000,
    },
  });

  return {
    entries: (query.data ?? []) as readonly LeaderboardEntry[],
    isLoading: isLeaderboardConfigured && query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    isConfigured: isLeaderboardConfigured,
  };
}
