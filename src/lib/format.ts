import { formatUnits } from "viem";

/** Format a bigint token amount to human-readable string with commas */
export function formatClawc(amount: bigint, decimals = 18, maxDecimals = 2): string {
  const formatted = formatUnits(amount, decimals);
  const [whole, fraction] = formatted.split(".");
  const withCommas = Number(whole).toLocaleString("en-US");
  if (!fraction || maxDecimals === 0) return withCommas;
  return `${withCommas}.${fraction.slice(0, maxDecimals)}`;
}

/** Format a Unix timestamp to a readable date */
export function formatStakeDate(timestamp: bigint): string {
  if (timestamp === 0n) return "N/A";
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Calculate days remaining in the 30-day penalty window */
export function daysUntilPenaltyFree(stakedAt: bigint): number {
  if (stakedAt === 0n) return 0;
  const penaltyEnd = Number(stakedAt) + 30 * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, Math.ceil((penaltyEnd - now) / (24 * 60 * 60)));
}
