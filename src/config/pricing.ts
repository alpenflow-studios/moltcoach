/**
 * ClawCoach pricing configuration.
 *
 * Two access models:
 *   1. Stake $CLAWC — lock CLAWC tokens, keep access while staked
 *   2. Subscribe — pay monthly in USDC or ETH
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentToken = "USDC" | "ETH";
export type BillingPeriod = "monthly" | "quarterly" | "annual";
export type PricingModel = "stake" | "subscribe";

export type TierIndex = 0 | 1 | 2;

export type TierDefinition = {
  name: string;
  index: TierIndex;
  description: string;
  features: readonly string[];
  highlighted: boolean;
  /** CLAWC required to stake for this tier (0 = free) */
  clawcStake: number;
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
    description: "10 messages per month. Start coaching for free.",
    features: [
      "10 AI coaching messages/month",
      "Basic fitness guidance",
      "Web dashboard access",
      "Manual workout logging",
    ],
    highlighted: false,
    clawcStake: 0,
    subscription: { monthly: 0, quarterly: 0, annual: 0 },
  },
  {
    name: "Pro",
    index: 1,
    description: "Unlimited coaching with advanced programs.",
    features: [
      "Unlimited AI coaching messages",
      "Personalized workout programs",
      "Nutrition guidance",
      "Wearable integration (Strava, Garmin, Apple Health)",
      "Priority coach responses",
      "Earn $CLAWC per workout",
    ],
    highlighted: true,
    clawcStake: 1_000,
    subscription: { monthly: 999, quarterly: 2699, annual: 9599 },
  },
  {
    name: "Elite",
    index: 2,
    description: "Everything plus priority access and exclusive features.",
    features: [
      "Everything in Pro",
      "Priority response queue",
      "Advanced performance analytics",
      "Custom agent personality tuning",
      "Early access to new features",
      "Exclusive community access",
      "Shape the product roadmap",
    ],
    highlighted: false,
    clawcStake: 10_000,
    subscription: { monthly: 2999, quarterly: 8099, annual: 28799 },
  },
] as const;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Format cents as a USD string. e.g. 999 → "$9.99" or 0 → "Free" */
export function formatUsd(cents: number): string {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** Format CLAWC stake amount. e.g. 1000 → "1,000 CLAWC" */
export function formatClawcStake(amount: number): string {
  if (amount === 0) return "Free";
  return `${amount.toLocaleString("en-US")} CLAWC`;
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
