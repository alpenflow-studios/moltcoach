/**
 * ClawCoach pricing configuration.
 *
 * Two access models:
 *   1. Stake $FIT — lock FIT tokens, keep access while staked
 *   2. Subscribe — pay monthly in USDC or ETH
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentToken = "USDC" | "ETH";
export type BillingPeriod = "monthly" | "quarterly" | "annual";
export type PricingModel = "stake" | "subscribe";

export type TierIndex = 0 | 1 | 2 | 3;

export type TierDefinition = {
  name: string;
  index: TierIndex;
  description: string;
  features: readonly string[];
  highlighted: boolean;
  /** FIT required to stake for this tier (0 = free) */
  fitStake: number;
  /** Subscription prices in USD cents per billing period */
  subscription: Record<BillingPeriod, number>;
};

// ---------------------------------------------------------------------------
// Tier definitions
// ---------------------------------------------------------------------------

export const TIERS: readonly TierDefinition[] = [
  {
    name: "Free",
    index: 0,
    description: "Start your journey with core coaching features.",
    features: [
      "AI coaching chat",
      "Manual workout entry",
      "Basic progress tracking",
      "Web dashboard access",
      "Earn $FIT per workout",
    ],
    highlighted: false,
    fitStake: 0,
    subscription: { monthly: 0, quarterly: 0, annual: 0 },
  },
  {
    name: "Basic",
    index: 1,
    description: "Connect your wearables for verified tracking.",
    features: [
      "Everything in Free",
      "Wearable API integration",
      "Strava, Apple Health, Garmin",
      "Auto-validated workouts",
      "Higher reward multiplier",
    ],
    highlighted: false,
    fitStake: 100,
    subscription: { monthly: 1000, quarterly: 2700, annual: 9600 },
  },
  {
    name: "Pro",
    index: 2,
    description: "Advanced analytics and nutrition guidance.",
    features: [
      "Everything in Basic",
      "Advanced performance analytics",
      "Nutrition guidance",
      "Priority coach responses",
      "Workout plan generation",
    ],
    highlighted: true,
    fitStake: 1_000,
    subscription: { monthly: 5000, quarterly: 13500, annual: 48000 },
  },
  {
    name: "Elite",
    index: 3,
    description: "Full suite with exclusive features and early access.",
    features: [
      "Everything in Pro",
      "Early access to new features",
      "Custom agent skills",
      "Exclusive community access",
      "Shape the product roadmap",
    ],
    highlighted: false,
    fitStake: 10_000,
    subscription: { monthly: 20000, quarterly: 54000, annual: 192000 },
  },
] as const;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Format cents as a USD string. e.g. 5000 → "$50" or 2700 → "$27" */
export function formatUsd(cents: number): string {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** Format FIT stake amount. e.g. 1000 → "1,000 FIT" */
export function formatFitStake(amount: number): string {
  if (amount === 0) return "Free";
  return `${amount.toLocaleString("en-US")} FIT`;
}

/**
 * Approximate ETH price from USD cents.
 * Uses a static reference rate — real implementation should fetch from oracle.
 * Placeholder: 1 ETH ≈ $2,500
 */
const ETH_USD_REFERENCE = 2500;

export function usdCentsToEth(cents: number): string {
  if (cents === 0) return "Free";
  const eth = cents / 100 / ETH_USD_REFERENCE;
  // Show enough decimals to be meaningful
  if (eth < 0.001) return `~${eth.toFixed(5)} ETH`;
  if (eth < 0.01) return `~${eth.toFixed(4)} ETH`;
  return `~${eth.toFixed(3)} ETH`;
}

/** USDC is 1:1 with USD */
export function usdCentsToUsdc(cents: number): string {
  if (cents === 0) return "Free";
  const usdc = cents / 100;
  return usdc % 1 === 0 ? `${usdc} USDC` : `${usdc.toFixed(2)} USDC`;
}

/** Get display price for a given token */
export function getTokenPrice(cents: number, token: PaymentToken): string {
  return token === "USDC" ? usdCentsToUsdc(cents) : usdCentsToEth(cents);
}

// ---------------------------------------------------------------------------
// Billing period labels & discount info
// ---------------------------------------------------------------------------

export const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

export const BILLING_SAVINGS: Record<BillingPeriod, string | null> = {
  monthly: null,
  quarterly: "Save 10%",
  annual: "Save 20%",
};
