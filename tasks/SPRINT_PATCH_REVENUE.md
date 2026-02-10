# SPRINT_PATCH_REVENUE.md — New Tasks for Revenue Integration

> **Purpose**: Add to existing CURRENT_SPRINT.md
> **Insert after**: TASK-001

---

## New Task

### TASK-001B: Deploy ProtocolFeeCollector to Base Sepolia
- **Priority**: P0
- **Scope**: `contracts/src/fees/ProtocolFeeCollector.sol`, `contracts/test/ProtocolFeeCollector.t.sol`, `contracts/script/DeployFeeCollector.s.sol`
- **Acceptance Criteria**:
  - [ ] `forge build` compiles with zero warnings
  - [ ] `forge test --match-contract ProtocolFeeCollectorTest` passes
  - [ ] Fee collection works for $FIT and USDC
  - [ ] `distribute()` splits to 4 treasury wallets at correct ratios (40/30/20/10)
  - [ ] Allocation update enforces sum = 10000 bps
  - [ ] Transaction fee capped at 5% max
  - [ ] Only owner can update fees and allocations
  - [ ] All state changes emit events
  - [ ] Deployed to Base Sepolia, address recorded in CLAUDE.md
- **Dependencies**: TASK-001 (FITToken)
- **Notes**: See `docs/REVENUE_INTEGRATION.md` for full contract code. Deploy BEFORE registry/validator/reward contracts so they can reference it.

---

## Modified Tasks

### TASK-002 (ClawCoachRegistry) — ADD:
- **Additional Acceptance Criteria**:
  - [ ] `spawnAgent()` collects spawn fee via ProtocolFeeCollector
  - [ ] `evolveAgent()` collects evolution fee
  - [ ] `switchMode()` collects mode switch fee
  - [ ] `forge test --match-test testSpawnFeeCollected` passes

### TASK-003 (WorkoutValidator) — ADD:
- **Additional Acceptance Criteria**:
  - [ ] `validateWorkout()` collects tier-based fee (Tier 1: 0.01, Tier 2: 0.05, Tier 3: free)
  - [ ] `forge test --match-test testValidationFeeTier1` passes
  - [ ] `forge test --match-test testValidationFeeTier2Free` passes

### TASK-004 (RewardDistributor) — ADD:
- **Additional Acceptance Criteria**:
  - [ ] `claimReward()` deducts 0.25% claim fee
  - [ ] `forge test --match-test testClaimFeeDeducted` passes

### TASK-005 (StakingVault) — ADD:
- **Additional Acceptance Criteria**:
  - [ ] Early unstake (< 30 days) charges 5% penalty to treasury
  - [ ] `forge test --match-test testEarlyUnstakePenalty` passes
  - [ ] Normal unstake (≥ 30 days) has no penalty

---

## New Documentation Entry

Add to `CLAUDE.md` contracts table:

| Contract | Address | Network |
|----------|---------|---------|
| ProtocolFeeCollector | `TBD` | Base Sepolia (84532) |

Add to `docs/` table of contents:

| Document | Path | Notes |
|----------|------|-------|
| Revenue Model | `docs/REVENUE_MODEL.md` | Revenue streams, treasury allocation |
| Revenue Integration | `docs/REVENUE_INTEGRATION.md` | Contract patches for fee collection |

---

*Generated: February 8, 2026*
