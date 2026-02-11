# TOKENOMICS.md — $CLAWC Token Economics

> **Version**: 1.0.0
> **Project**: ClawCoach
> **Token**: $CLAWC (ClawCoach CLAWC)
> **Chain**: Base (chainId 8453)
> **Standard**: ERC-20 (OpenZeppelin 5.x)
> **Last Updated**: February 7, 2026

---

## 1. Token Overview

$CLAWC is ClawCoach's move-to-earn utility token on Base. It incentivizes consistent, verified workout completion and gates premium platform features via staking.

| Property | Value |
|----------|-------|
| Name | ClawCoach CLAWC |
| Symbol | CLAWC |
| Decimals | 18 |
| Max Supply | 1,000,000,000 (1B) |
| Initial Supply | 0 (no pre-mine, no public sale) |
| Minting | Only by authorized minters (RewardDistributor) |
| Burning | ERC20Burnable — anyone can burn their own tokens |
| Permit | ERC20Permit — gasless approvals via EIP-2612 |

**Core Principle**: $CLAWC is earned, never bought. There is no token sale, no pre-mine, and no team allocation at launch. Every $CLAWC in circulation was minted because someone completed a verified workout. This keeps the token's value tightly coupled to real physical activity.

---

## 2. Emission Schedule

### Daily Emission Cap

**100,000 $CLAWC per day** across all users, enforced on-chain by `CLAWCToken.sol`.

```
Day 1:     Up to 100K $CLAWC minted
Day 2:     Up to 100K $CLAWC minted
...
Day 10000: Cap reached at 1B total supply → no more minting
```

At maximum emission (unlikely in early months), the full supply would be distributed in ~27 years. In practice, early emissions will be far below the cap.

### Emission Phases

| Phase | Timeline | Est. Daily Emission | Notes |
|-------|----------|-------------------|-------|
| **Bootstrap** | Months 1-3 | 5K-20K $CLAWC/day | Small beta user base, low volume |
| **Growth** | Months 4-12 | 20K-60K $CLAWC/day | User growth, more validated workouts |
| **Maturity** | Year 2+ | 60K-100K $CLAWC/day | Approaching cap, sustainability mechanisms kick in |
| **Post-Cap** | When 1B reached | 0 new $CLAWC | All rewards from recycled/burned tokens or secondary mechanics |

### Why a Hard Cap?

Uncapped emission creates death spirals (see StepN collapse). The 100K/day cap ensures:
- Scarcity increases as user base grows (each user's share of daily emission decreases)
- Early adopters are rewarded disproportionately
- Long-term sustainability without hyperinflation
- Natural transition from earn-heavy to utility-heavy token usage

---

## 3. Reward Mechanics

### Base Reward

**100 $CLAWC per validated workout** (base amount before multipliers).

Enforced in `RewardDistributor.sol` as a configurable parameter (`baseReward`), adjustable by admin if economics require rebalancing.

### Tier Multipliers

Applied based on the data source used for workout validation:

| Tier | Data Source | Multiplier | Effective Reward |
|------|------------|-----------|-----------------|
| 1 | Direct Wearable API (OAuth) | 1.0x | 100 $CLAWC |
| 2 | Image Upload (vision-parsed) | 0.85x | 85 $CLAWC |
| 3 | Manual + Photo/Video Proof | 0.7x | 70 $CLAWC |
| 4 | Manual (no proof) | 0.5x | 50 $CLAWC |

Tier 4 is rate-limited to **max 3 per week** per user (enforced by `WorkoutValidator.sol`).

### Streak Bonuses

Consecutive validated workout days trigger bonus multipliers. Applied AFTER tier multiplier.

| Streak Length | Bonus Multiplier | Example (Tier 1) |
|--------------|-----------------|-----------------|
| < 7 days | 1.0x (none) | 100 $CLAWC |
| 7+ consecutive days | 1.5x | 150 $CLAWC |
| 30+ consecutive days | 2.0x | 200 $CLAWC |
| 90+ consecutive days | 2.5x | 250 $CLAWC |

**Streak rules**:
- One validated workout per calendar day qualifies
- Missing a day resets the streak to 0
- Only the highest applicable bonus applies (no stacking)
- Streak tracked per user on-chain in `RewardDistributor.sol`
- Bonding period workouts (first 7 days) count toward streak

### Reward Formula

```
Final Reward = baseReward × tierMultiplier × streakBonus
```

**Examples**:

| Scenario | Base | × Tier | × Streak | = Final |
|----------|------|--------|----------|---------|
| Tier 1, no streak | 100 | × 1.0 | × 1.0 | **100 $CLAWC** |
| Tier 2, 7-day streak | 100 | × 0.85 | × 1.5 | **127.5 $CLAWC** |
| Tier 1, 30-day streak | 100 | × 1.0 | × 2.0 | **200 $CLAWC** |
| Tier 4, 90-day streak | 100 | × 0.5 | × 2.5 | **125 $CLAWC** |
| Tier 1, 90-day streak | 100 | × 1.0 | × 2.5 | **250 $CLAWC** |

### Daily Cap Distribution

When total daily claims approach the 100K cap, what happens?

**Policy**: First-come, first-served within the daily window (UTC midnight reset). If the cap is hit:
- Remaining claims are queued for the next day
- Users are notified their reward is queued
- Dashboard shows estimated distribution time
- No claims are lost — only delayed

> **Future consideration**: If cap-hits become frequent, introduce a proportional distribution model (each user gets a share of the 100K proportional to their validated workouts that day). This requires a more complex claiming mechanism (batch settlement).

---

## 4. Burn Mechanics

Burns reduce circulating supply, creating deflationary pressure to counterbalance emissions.

### Active Burns

| Burn Event | Amount | Trigger |
|-----------|--------|---------|
| Agent Spawn Fee | Variable (initially 10 $CLAWC) | User spawns a new agent |
| Hard Reset Fee | 50% of spawn fee | User hard-resets agent (burns some accumulated value) |
| Premium Feature Unlock | Variable | One-time burns for permanent feature access (future) |

### Passive Burns

| Burn Event | Amount | Trigger |
|-----------|--------|---------|
| Staking Penalty (early unstake) | 5% of staked amount | Unstaking before 7-day cooldown expires (if emergency withdraw enabled) |
| Dispute Resolution | Loser's stake | Disputed workout validation (future — requires dispute mechanism) |

### Burn Rate Targets

| Phase | Target Burn Rate | Mechanism |
|-------|-----------------|-----------|
| Bootstrap | 5-10% of emissions | Spawn fees only |
| Growth | 15-25% of emissions | Spawn + premium features + disputes |
| Maturity | 30-50% of emissions | All mechanisms active, approach deflationary equilibrium |

**Long-term goal**: Burn rate approaches emission rate, creating a roughly stable supply. The exact equilibrium depends on user growth and feature adoption. Admin can adjust spawn fees and premium costs to tune the burn rate.

---

## 5. Staking

### Premium Tiers

Staking $CLAWC unlocks premium platform features. Staked tokens remain in `StakingVault.sol` and are NOT burned.

| Tier | Required Stake | Features Unlocked |
|------|---------------|-------------------|
| **Free** | 0 $CLAWC | Basic coaching, manual entry, web chat |
| **Basic** | 100 $CLAWC | + Wearable API integration (OAuth setup) |
| **Pro** | 1,000 $CLAWC | + Advanced analytics, nutrition guidance, priority responses |
| **Elite** | 10,000 $CLAWC | + Early access to new features, custom agent skills |

### Staking Rules

- **Lock period**: None (can unstake anytime after cooldown)
- **Cooldown**: 7 days from unstake request to withdrawal
- **Emergency unstake**: Available with 5% penalty (burns the penalty amount)
- **Tier downgrade**: Immediate on unstake — features removed when balance drops below tier threshold
- **No staking rewards**: Staking does NOT generate yield. The benefit is feature access, not passive income. This avoids Ponzi dynamics.

### Why No Staking Rewards?

Many move-to-earn tokens fail because staking rewards create circular incentives (stake to earn more tokens to stake to earn more tokens). ClawCoach breaks this by:
- Staking = access to features (real utility, not yield)
- Earning = completing workouts (real activity, not capital)
- No compounding: you can't earn $CLAWC by holding $CLAWC

This means the only way to accumulate $CLAWC is to work out. Period.

---

## 6. Token Distribution Model

Since there is no pre-mine, all tokens enter circulation through validated workouts.

### Projected Distribution (Year 1)

| Recipient | Mechanism | Est. % of Year 1 Supply |
|-----------|-----------|------------------------|
| Users (workout rewards) | RewardDistributor minting | 100% |
| Team | None at launch | 0% |
| Investors | None | 0% |
| Treasury | None at launch | 0% |

### Future Allocation (Post-Governance, Stage 3)

When DAO governance is established, the community may vote to:
- Allocate a % of daily emissions to a treasury
- Fund development grants from treasury
- Adjust emission parameters
- Introduce new burn/reward mechanisms

**Until governance is live**, all $CLAWC goes directly to users who work out. No admin allocation, no treasury reserve, no insider distribution.

---

## 7. Anti-Gaming Mechanisms

### Sybil Resistance

| Mechanism | What It Prevents |
|-----------|-----------------|
| Spawn fee ($CLAWC) | Free agent farming (must earn/acquire $CLAWC to spawn additional agents) |
| One active agent per wallet | Multi-agent reward farming |
| Tier 4 rate limit (3/week) | Spam manual entries for easy rewards |
| Validation scoring (≥80 to earn) | Low-quality workout submissions |

### Collusion Prevention

| Mechanism | What It Prevents |
|-----------|-----------------|
| Data tier multipliers | Incentivizes higher-confidence data (harder to fake) |
| Image hash deduplication | Submitting the same workout photo twice |
| Oracle cross-referencing | Checking wearable data against claimed workout type/duration |
| Streak reset on miss | Gaming streak bonuses by submitting fake maintenance workouts |

### Economic Safeguards

| Mechanism | What It Prevents |
|-----------|-----------------|
| Daily emission cap (100K) | Hyperinflation from rapid user growth |
| Hard supply cap (1B) | Infinite dilution |
| No staking yield | Ponzi-style circular incentives |
| Adjustable base reward | Admin can reduce if gaming detected (governance vote post-Stage 3) |
| Burn mechanics | Supply bloat as user base stabilizes |

---

## 8. Token Lifecycle Scenarios

### Scenario A: Healthy Growth

```
Month 1:  500 users, 5K $CLAWC/day emission
Month 6:  5,000 users, 40K $CLAWC/day emission
Month 12: 20,000 users, 80K $CLAWC/day (approaching cap)
          Burns consuming 20% of daily emission
          $CLAWC has real utility (staking tiers, spawn fees)
          Secondary market forms naturally
```

### Scenario B: Slow Start

```
Month 1:  50 users, 500 $CLAWC/day
Month 6:  500 users, 5K $CLAWC/day
Month 12: 2,000 users, 15K $CLAWC/day
          Low supply means each $CLAWC has higher utility value
          Early adopters well-rewarded
          Burn rate exceeds growth → natural scarcity
```

### Scenario C: Death Spiral Prevention

If user activity drops sharply:
- Emission drops proportionally (fewer validated workouts = fewer minted tokens)
- No inflation floor (unlike tokens with mandatory emissions)
- Staked tokens remain locked (maintaining utility demand)
- Burn mechanisms continue (spawn fees, etc.)
- Admin can reduce base reward to slow emission further

The key insight: **$CLAWC emission is demand-driven, not time-driven**. The daily cap is a ceiling, not a floor. If no one works out, no $CLAWC is minted. This prevents the supply-side death spirals that killed StepN.

---

## 9. Contract Parameters (Reference)

All values configurable by admin (multi-sig initially, governance post-Stage 3):

| Parameter | Contract | Default | Range |
|-----------|----------|---------|-------|
| `MAX_SUPPLY` | CLAWCToken | 1,000,000,000 | Immutable |
| `DAILY_EMISSION_CAP` | CLAWCToken | 100,000 | 10K - 500K |
| `baseReward` | RewardDistributor | 100 $CLAWC | 10 - 1,000 |
| `streakBonuses[7]` | RewardDistributor | 1.5x (15000 bps) | 1.0x - 3.0x |
| `streakBonuses[30]` | RewardDistributor | 2.0x (20000 bps) | 1.0x - 5.0x |
| `streakBonuses[90]` | RewardDistributor | 2.5x (25000 bps) | 1.0x - 5.0x |
| `spawnFee` | ClawCoachRegistry | 10 $CLAWC | 0 - 1,000 |
| Tier thresholds | StakingVault | 100/1K/10K | Adjustable |
| `MIN_VALIDATION_SCORE` | WorkoutValidator | 80 | 50 - 100 |
| `MAX_MANUAL_PER_WEEK` | WorkoutValidator | 3 | 0 - 10 |

---

## 10. Open Questions

- [ ] **Secondary market**: Should ClawCoach facilitate $CLAWC/USDC trading (DEX pool), or let it emerge organically?
- [ ] **Treasury allocation**: When governance launches, what % of daily emission should feed a treasury?
- [ ] **Dynamic base reward**: Should base reward auto-adjust based on daily claim volume (algorithmic)?
- [ ] **Cross-project utility**: Could $CLAWC be used in other projects (SMASH stakes, for example)?
- [ ] **Token legal classification**: Utility token analysis needed before mainnet launch.
- [ ] **Emergency circuit breaker**: Should admin be able to pause all minting in case of exploit?

---

## 11. Key Metrics to Track

| Metric | Frequency | Alert Threshold |
|--------|-----------|----------------|
| Daily $CLAWC minted | Daily | > 90K (approaching cap) |
| Daily burn amount | Daily | < 5% of emissions (low burn) |
| Circulating supply | Daily | Dashboard metric |
| Staked supply (% of circulating) | Weekly | < 10% (low staking) |
| Unique claimants per day | Daily | Trending indicator |
| Avg reward per user per day | Daily | > 500 $CLAWC (potential gaming) |
| Tier 4 claims per user per week | Real-time | > 3 (enforcement check) |
| Streak distribution (7/30/90) | Weekly | Health of engagement |

---

*Document created: February 7, 2026*
