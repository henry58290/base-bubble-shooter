import type { Address } from 'viem';

/** Truncate an address to `0x1234…abcd`. Returns the input untouched if too short. */
export function truncateAddress(address: Address | string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

/** Format a bigint score with thousands separators. */
export function formatScore(score: bigint | number): string {
  const n = typeof score === 'bigint' ? score : BigInt(score);
  return n.toLocaleString('en-US');
}
