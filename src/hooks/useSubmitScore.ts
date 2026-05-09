'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

import {
  isLeaderboardConfigured,
  LEADERBOARD_ABI,
  LEADERBOARD_ADDRESS,
} from '@/lib/contract';
import { SUPPORTED_CHAIN } from '@/lib/wagmi';

const TOAST_ID = 'submit-score';

export type SubmitState =
  | 'idle'
  | 'awaitingWallet'
  | 'submitting'
  | 'confirmed'
  | 'error';

export type UseSubmitScoreResult = {
  submit: (score: number) => Promise<void>;
  reset: () => void;
  state: SubmitState;
  txHash?: `0x${string}`;
  explorerUrl?: string;
};

/**
 * Encapsulates the full flow for `submitScore` on the GameLeaderboard contract:
 *
 *   click → wallet sig → tx broadcast → receipt → success | revert | reject
 *
 * Surfaces a single `state` enum the UI can render against, and drives toast
 * notifications for every transition. On confirmation it invalidates wagmi
 * read queries so the leaderboard refreshes immediately.
 */
export function useSubmitScore(): UseSubmitScoreResult {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { switchChainAsync } = useSwitchChain();

  const {
    writeContractAsync,
    data: txHash,
    isPending: isAwaitingWallet,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isWaitingReceipt,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const isConfirmed = receipt?.status === 'success';
  const isReverted = receipt?.status === 'reverted';

  // Fire each transition exactly once.
  const lastFiredRef = useRef<{ confirmed: boolean; reverted: boolean }>({
    confirmed: false,
    reverted: false,
  });

  useEffect(() => {
    if (isConfirmed && !lastFiredRef.current.confirmed) {
      lastFiredRef.current.confirmed = true;
      toast.success('Score recorded on Base ⚡', { id: TOAST_ID });
      // Force the leaderboard + any high-score reads to refetch instantly.
      queryClient.refetchQueries({ queryKey: ['readContract'] });
    }
  }, [isConfirmed, queryClient]);

  useEffect(() => {
    if (isReverted && !lastFiredRef.current.reverted) {
      lastFiredRef.current.reverted = true;
      toast.error('Tx reverted — score may not have beat your PB', { id: TOAST_ID });
    }
  }, [isReverted]);

  useEffect(() => {
    if (isReceiptError) {
      toast.error('Could not fetch transaction receipt', { id: TOAST_ID });
    }
  }, [isReceiptError]);

  const submit = useCallback(
    async (score: number) => {
      if (!isConnected) {
        toast.error('Connect your wallet to submit');
        return;
      }
      if (!isLeaderboardConfigured) {
        toast.error('Leaderboard contract address not set');
        return;
      }
      if (score <= 0) {
        toast.error('Score must be greater than zero');
        return;
      }

      // Make sure we're on Base before triggering the write.
      if (chainId !== SUPPORTED_CHAIN.id) {
        try {
          toast.loading(`Switching to ${SUPPORTED_CHAIN.name}…`, { id: TOAST_ID });
          await switchChainAsync({ chainId: SUPPORTED_CHAIN.id });
        } catch {
          toast.error(`Please switch to ${SUPPORTED_CHAIN.name}`, { id: TOAST_ID });
          return;
        }
      }

      // Reset transition guards for a fresh attempt.
      lastFiredRef.current = { confirmed: false, reverted: false };

      toast.loading('Awaiting wallet…', { id: TOAST_ID });

      try {
        await writeContractAsync({
          address: LEADERBOARD_ADDRESS,
          abi: LEADERBOARD_ABI,
          functionName: 'submitScore',
          args: [BigInt(score)],
        });
        // After the wallet signs we know the tx was broadcast.
        toast.loading('Submitting transaction…', { id: TOAST_ID });
      } catch (err) {
        toast.error(friendlyErrorMessage(err), { id: TOAST_ID });
      }
    },
    [chainId, isConnected, switchChainAsync, writeContractAsync],
  );

  const reset = useCallback(() => {
    resetWrite();
    lastFiredRef.current = { confirmed: false, reverted: false };
  }, [resetWrite]);

  // Derive the single state value the UI renders against.
  let state: SubmitState = 'idle';
  if (isAwaitingWallet) state = 'awaitingWallet';
  else if (txHash && isWaitingReceipt) state = 'submitting';
  else if (isConfirmed) state = 'confirmed';
  else if (isReverted || writeError || isReceiptError) state = 'error';

  const explorerBase = SUPPORTED_CHAIN.blockExplorers?.default.url;
  const explorerUrl = txHash && explorerBase ? `${explorerBase}/tx/${txHash}` : undefined;

  return { submit, reset, state, txHash, explorerUrl };
}

/**
 * Decode wagmi/viem errors into a one-line message. Handles user rejection,
 * our two custom errors, and falls back to `shortMessage` / generic text.
 */
function friendlyErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Transaction failed';

  const e = err as {
    name?: string;
    shortMessage?: string;
    message?: string;
    cause?: { name?: string; reason?: string };
  };

  const msg = `${e.shortMessage ?? ''} ${e.message ?? ''}`.toLowerCase();

  if (msg.includes('user rejected') || msg.includes('user denied')) {
    return 'Transaction rejected in wallet';
  }
  if (msg.includes('scorenotimproved')) {
    return 'Score must beat your previous best';
  }
  if (msg.includes('scorenotpositive')) {
    return 'Score must be greater than zero';
  }
  if (msg.includes('insufficient funds')) {
    return 'Insufficient ETH on Base for gas';
  }
  if (e.cause?.reason) return e.cause.reason;
  return e.shortMessage ?? e.message ?? 'Transaction failed';
}
