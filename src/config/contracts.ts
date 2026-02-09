// Contract addresses from environment variables (Base Sepolia)
export const FIT_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_FIT_TOKEN_ADDRESS ?? "") as `0x${string}`;
export const FIT_STAKING_ADDRESS = (process.env.NEXT_PUBLIC_FIT_STAKING_ADDRESS ?? "") as `0x${string}`;

// Tier metadata
export const TIER_NAMES = ["Free", "Basic", "Pro", "Elite"] as const;
export type TierIndex = 0 | 1 | 2 | 3;

export const TIER_COLORS: Record<TierIndex, string> = {
  0: "text-muted-foreground",
  1: "text-blue-400",
  2: "text-purple-400",
  3: "text-primary",
};

export const TIER_DESCRIPTIONS: Record<TierIndex, string> = {
  0: "Basic coaching access",
  1: "Enhanced check-ins & tracking",
  2: "Priority coaching & analytics",
  3: "Full suite with exclusive features",
};

// Minimal FitToken ABI — only functions the frontend calls
export const fitTokenAbi = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;

// Minimal FitStaking ABI — only functions the frontend calls
export const fitStakingAbi = [
  {
    type: "function",
    name: "stake",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unstake",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getStake",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "amount", type: "uint256" },
      { name: "stakedAt", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTier",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isEarlyUnstake",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "earlyUnstakePenalty",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "totalStaked",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "basicThreshold",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proThreshold",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "eliteThreshold",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MIN_STAKE_DURATION",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
