# REVENUE_MODEL.md — MoltCoach Revenue Streams

> **Version**: 1.0
> **Last Updated**: February 8, 2026
> **Status**: Active — integrate into contracts and architecture

---

## Overview

MoltCoach generates revenue through micro-fees across every layer of the platform. No single fee is large enough to deter users, but they compound at scale. Revenue flows to the **Protocol Treasury** (multisig → DAO governance in Stage 3).

**Design Principle**: Every on-chain action that creates value should capture a small fraction of that value for the protocol.

---

## 1. Transaction Fees (Base Layer)

Every transaction through a user's Coinbase Smart Wallet routes a micro-fee to the protocol multisig.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Fee Rate | 0.5–1.0% | Per transaction |
| Applies To | All wallet transactions (reward claims, staking, transfers) |
| Collection | Automatic via Smart Wallet spending policy |
| Revenue Share | 100% to Protocol Treasury |

**Implementation**: Modify `MoltCoachWalletPolicy` to deduct fee before execution.

```solidity
uint256 public constant PROTOCOL_FEE_BPS = 50; // 0.5% (basis points)
address public protocolTreasury;

function executeWithFee(address to, uint256 amount) internal {
    uint256 fee = (amount * PROTOCOL_FEE_BPS) / 10000;
    IERC20(token).transfer(protocolTreasury, fee);
    IERC20(token).transfer(to, amount - fee);
}
```

---

## 2. Agent Lifecycle Fees

Fees charged at key moments in a coach agent's lifecycle.

| Action | Fee | Token | Frequency |
|--------|-----|-------|-----------|
| **Spawn** (mint agent NFT) | 5–25 USDC or equivalent $FIT | USDC / $FIT | Once per agent |
| **Evolution** (level up / unlock tier) | 2–10 $FIT | $FIT | Per evolution event |
| **Mode Switch** (Coach → Friend → Mentor) | 1–5 $FIT | $FIT | Per switch |
| **Reset / Re-spec** (change personality/focus) | 10–25 $FIT | $FIT | Per reset |
| **Archive Revival** (reactivate archived agent) | 5–15 $FIT | $FIT | Per revival |

**Why it works**: Users invest emotionally in their coach. These fees are low enough to feel like a natural part of progression, not a paywall.

**Implementation**: Add fee collection to `MoltCoachRegistry.sol` spawn and evolution functions.

---

## 3. Validation & Verification Fees

Charged per workout verification request. Covers oracle compute costs + protocol margin.

| Validation Tier | Fee | Method | Confidence |
|----------------|-----|--------|------------|
| **Tier 1**: Wearable API | 0.01–0.05 $FIT | Automatic API verification | 1.0x multiplier |
| **Tier 2**: Image Upload | 0.05–0.15 $FIT | Vision model inference | 0.85x multiplier |
| **Tier 3**: Manual Entry | 0.00 $FIT | Self-reported (lowest rewards) | 0.5x multiplier |
| **Expedited Verification** | 2x standard fee | Skip queue, instant validation | Same as tier |

**Volume projection**: At 2,000 active users × 4 workouts/week = 32,000 validations/month.

**Implementation**: Add fee parameter to `WorkoutValidator.validateWorkout()`.

```solidity
function validateWorkout(
    uint256 agentId,
    bytes calldata proof,
    uint8 tier
) external payable {
    uint256 fee = validationFees[tier];
    require(msg.value >= fee || fitToken.transferFrom(msg.sender, treasury, fee));
    // ... validation logic
}
```

---

## 4. Marketplace Fees

Revenue from user-generated content and services traded on the platform.

| Marketplace Item | Platform Cut | Seller Gets | Notes |
|-----------------|-------------|-------------|-------|
| **Workout Templates** | 10–15% | 85–90% | Coaches sell proven programs |
| **Challenge Creation** (paid entry) | 5% of pool | 95% to winner(s) | Ties into SMASH DNA |
| **Custom Agent Skins/Personas** | 15% | 85% | Cosmetic agent customization |
| **Coaching Certifications** | 20% | 80% | Human coaches sell AI-augmented packages |

**Implementation**: Marketplace smart contract with escrow and fee splitting.

---

## 5. Staking & DeFi Fees

| Action | Fee | Notes |
|--------|-----|-------|
| **Early Unstake Penalty** | 5–10% of staked amount | Goes to treasury, not burned |
| **$FIT Swap Spread** | 0.3% | If protocol-owned DEX pool |
| **Liquidity Provision** | Standard LP fees | Protocol-owned liquidity earns fees |

**Implementation**: `StakingVault.sol` early withdrawal penalty + Uniswap V3 position management.

---

## 6. Premium Tier (Subscription)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic coaching, manual entry, 3 workouts/week tracking |
| **Pro** | 10–20 USDC/mo or equivalent $FIT | Unlimited workouts, advanced analytics, wearable sync, priority validation, AI periodization |
| **Coach** | 25–50 USDC/mo or equivalent $FIT | Everything in Pro + template marketplace access, client management, branded agent, revenue sharing |

**Payment**: Monthly subscription via x402 protocol or direct USDC transfer.

**Implementation**: Subscription NFT (ERC-721 with expiry) or on-chain subscription contract.

---

## 7. B2B & Enterprise Revenue

| Channel | Revenue Model | Target |
|---------|--------------|--------|
| **White-Label Agents** | Monthly SaaS fee (50–200 USDC/mo) | Independent fitness coaches |
| **Gym Partnerships** | Per-member fee (2–5 USDC/member/mo) | Gyms offering AI coaching |
| **Corporate Wellness** | Bulk license (500–5000 USDC/mo) | Companies with wellness programs |
| **Coach Certification** | One-time fee (50–100 USDC) | Human coaches wanting AI augmentation |

**Why this matters**: B2B is where the real margin lives. Your fitness industry background is the moat. Independent coaches paying 30-40% to platforms today would jump at 5-10% with AI augmentation.

**Implementation**: Multi-tenant agent spawning with custom branding via `MoltCoachRegistry`.

---

## 8. Data & API Revenue

| Service | Fee | Notes |
|---------|-----|-------|
| **API Access** (3rd party) | Tiered pricing | Anonymized fitness data for research |
| **Data Export** (premium) | Included in Pro tier | CSV/API export of personal data |
| **Integration Fees** | Revenue share | Wearable companies pay for integration placement |

**Privacy first**: All data revenue uses anonymized, aggregated data. Users explicitly opt-in. Full GDPR/privacy compliance.

---

## 9. Protocol-Level Revenue

| Source | Fee | Notes |
|--------|-----|-------|
| **x402 Payment Routing** | 0.1% per API call | Micro-fee on every x402 transaction through MoltCoach infra |
| **Agent-to-Agent Fees** | 0.5% per interaction | When MoltCoach agents interact with other ERC-8004 agents (Stage 3) |
| **ERC-8004 Registry** | Referral fee from registry | If MoltCoach becomes a gateway to agent ecosystem |

---

## Revenue Priority by Stage

### Stage 1: MVP (Base Sepolia → Mainnet)
Focus on **3 revenue streams** only:

| Priority | Stream | Expected Revenue |
|----------|--------|-----------------|
| P0 | Transaction fees (0.5%) | Scales with usage |
| P0 | Agent spawn fee | One-time per user |
| P0 | Validation fees | Per workout |

### Stage 2: Growth
Add **4 more streams**:

| Priority | Stream | Expected Revenue |
|----------|--------|-----------------|
| P1 | Premium subscriptions | Recurring monthly |
| P1 | Marketplace fees | % of GMV |
| P1 | Staking penalties | Event-driven |
| P1 | Challenge pool fees | % of pool |

### Stage 3: Scale
Unlock **remaining streams**:

| Priority | Stream | Expected Revenue |
|----------|--------|-----------------|
| P2 | B2B white-label | SaaS recurring |
| P2 | Corporate wellness | Enterprise contracts |
| P2 | API/data revenue | Tiered pricing |
| P2 | Agent-to-agent fees | Ecosystem growth |

---

## Revenue Flow Diagram

```
User Actions
    │
    ├── Wallet Tx ──────────── 0.5% ──→ Protocol Treasury
    ├── Spawn Agent ─────────── 5-25 USDC ──→ Protocol Treasury
    ├── Log Workout ─────────── 0.01-0.15 $FIT ──→ Protocol Treasury
    ├── Evolve Agent ─────────── 2-10 $FIT ──→ Protocol Treasury
    ├── Buy Template ─────────── 10-15% cut ──→ Protocol Treasury
    ├── Join Challenge ──────── 5% of pool ──→ Protocol Treasury
    ├── Subscribe Pro ──────── 10-20 USDC/mo ──→ Protocol Treasury
    └── Early Unstake ──────── 5-10% penalty ──→ Protocol Treasury

Protocol Treasury
    │
    ├── 40% → Development Fund (team, infra, compute)
    ├── 30% → $FIT Buyback & Burn (deflationary pressure)
    ├── 20% → Community Rewards Pool (grants, bounties)
    └── 10% → Insurance Reserve (smart contract risk)
```

---

## Smart Contract Integration Points

| Contract | Revenue Function | Fee Type |
|----------|-----------------|----------|
| `MoltCoachWalletPolicy` | `executeWithFee()` | Transaction % |
| `MoltCoachRegistry` | `spawnAgent()`, `evolveAgent()` | Flat fee |
| `WorkoutValidator` | `validateWorkout()` | Per-validation |
| `StakingVault` | `unstake()` | Early penalty |
| `RewardDistributor` | `claimReward()` | Claim fee |
| `Marketplace` (new) | `purchaseTemplate()`, `createChallenge()` | % cut |
| `Subscription` (new) | `subscribe()`, `renew()` | Monthly flat |

---

## Anti-Patterns to Avoid

- **No yield on staking** — we're not a Ponzi. Staking locks $FIT for governance weight + fee discounts only
- **No inflationary rewards** — emission is demand-driven, never exceeds 100K $FIT/day cap
- **No hidden fees** — all fees visible in UI before confirmation
- **No data selling without consent** — privacy-first, opt-in only
- **No platform lock-in** — users can export data and migrate agents (ERC-8004 portability)

---

## KPIs to Track

| Metric | Target (Month 6) | Target (Month 12) |
|--------|-------------------|---------------------|
| Revenue per user/month | $2–5 | $5–15 |
| Transaction fee revenue | $500/mo | $5,000/mo |
| Spawn fee revenue | $2,500/mo | $10,000/mo |
| Validation fee revenue | $300/mo | $3,000/mo |
| Premium subscription revenue | $0 (Stage 1) | $5,000/mo |
| B2B revenue | $0 (Stage 1) | $2,000/mo |

---

## Treasury Allocation (Proposed)

| Allocation | % | Purpose |
|-----------|---|---------|
| Development | 40% | Team compensation, infrastructure, compute costs |
| Buyback & Burn | 30% | Purchase $FIT from market and burn → deflationary |
| Community | 20% | Grants, bounties, partnership incentives |
| Insurance | 10% | Smart contract exploit coverage, emergency fund |

Governance transitions treasury control to DAO in Stage 3.

---

*Document generated: February 8, 2026*
*Next review: After Stage 1 mainnet launch*
