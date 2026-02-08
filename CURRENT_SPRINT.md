# CURRENT_SPRINT.md

> **Purpose**: Active tasks with machine-checkable acceptance criteria. Claude Code checks this at session start.

---

## Sprint: MVP Foundation — February 2026

### Goal
Core infrastructure deployed to Base Sepolia: agent spawning, workout logging (all 3 tracks), validation pipeline, and $FIT rewards. One user can spawn a coach, log a workout, get it validated, and claim $FIT.

---

## Tasks

### 🔴 Not Started

#### TASK-001: Deploy FITToken to Base Sepolia
- **Priority**: P0
- **Scope**: `contracts/src/FITToken.sol`, `contracts/script/Deploy.s.sol`
- **Acceptance Criteria**:
  - [ ] `FITToken.sol` compiles with `forge build` (zero warnings)
  - [ ] `forge test --match-contract FITTokenTest` passes
  - [ ] Contract deployed to Base Sepolia and verified on basescan
  - [ ] `cast call <address> "name()(string)"` returns `"MoltCoach FIT"`
  - [ ] `cast call <address> "MAX_SUPPLY()(uint256)"` returns `1000000000000000000000000000`
  - [ ] `cast call <address> "DAILY_EMISSION_CAP()(uint256)"` returns `100000000000000000000000`
  - [ ] Admin address set as owner
- **Dependencies**: None
- **Notes**: First contract deployed. All other contracts depend on this address. See `docs/CONTRACTS.md` Section 4.

---

#### TASK-002: Deploy MoltCoachRegistry to Base Sepolia
- **Priority**: P0
- **Scope**: `contracts/src/MoltCoachRegistry.sol`, `contracts/script/Deploy.s.sol`
- **Acceptance Criteria**:
  - [ ] `MoltCoachRegistry.sol` compiles with `forge build` (zero warnings)
  - [ ] `forge test --match-contract MoltCoachRegistryTest` passes
  - [ ] Tests cover: spawnAgent, evolveAgent, softReset, hardReset, archiveAgent, reactivateAgent
  - [ ] Contract deployed to Base Sepolia and verified
  - [ ] `spawnAgent()` mints ERC-8004 Identity NFT (verify via event log)
  - [ ] One-active-agent-per-user enforced (second spawn reverts)
  - [ ] Lifecycle state transitions work: BONDING → ACTIVE → EVOLVE/RESET/ARCHIVE
- **Dependencies**: TASK-001 (needs FITToken address for spawn fee)
- **Notes**: Interacts with ERC-8004 Identity Registry singleton on Base Sepolia. Registry address TBD — check 8004.org for deployment status. See `docs/CONTRACTS.md` Section 2.

---

#### TASK-003: Deploy WorkoutValidator to Base Sepolia
- **Priority**: P0
- **Scope**: `contracts/src/WorkoutValidator.sol`, `contracts/script/Deploy.s.sol`
- **Acceptance Criteria**:
  - [ ] `WorkoutValidator.sol` compiles with `forge build` (zero warnings)
  - [ ] `forge test --match-contract WorkoutValidatorTest` passes
  - [ ] Tests cover: validateWorkout (all 4 tiers), rate limiting (Tier 4 max 3/week), tier multiplier returns
  - [ ] Contract deployed to Base Sepolia and verified
  - [ ] Admin wallet set as authorized operator (for manual testing)
  - [ ] `submitValidation()` correctly writes to ERC-8004 Validation Registry
- **Dependencies**: None (standalone oracle contract)
- **Notes**: For MVP, admin wallet acts as the oracle operator. TEE/stake-secured oracles are Stage 2. See `docs/CONTRACTS.md` Section 3.

---

#### TASK-004: Deploy RewardDistributor to Base Sepolia
- **Priority**: P0
- **Scope**: `contracts/src/RewardDistributor.sol`, `contracts/script/Deploy.s.sol`
- **Acceptance Criteria**:
  - [ ] `RewardDistributor.sol` compiles with `forge build` (zero warnings)
  - [ ] `forge test --match-contract RewardDistributorTest` passes
  - [ ] Tests cover: claimReward, tier multiplier application, streak bonuses at 7/30/90, double-claim prevention, daily cap enforcement
  - [ ] Contract deployed to Base Sepolia and verified
  - [ ] RewardDistributor set as authorized minter on FITToken
  - [ ] `claimReward()` mints correct $FIT amount (base × tier × streak)
- **Dependencies**: TASK-001 (FITToken), TASK-003 (WorkoutValidator)
- **Notes**: See `docs/CONTRACTS.md` Section 5 and `docs/TOKENOMICS.md` Section 3.

---

#### TASK-005: Deploy StakingVault to Base Sepolia
- **Priority**: P1
- **Scope**: `contracts/src/StakingVault.sol`, `contracts/script/Deploy.s.sol`
- **Acceptance Criteria**:
  - [ ] `StakingVault.sol` compiles with `forge build` (zero warnings)
  - [ ] `forge test --match-contract StakingVaultTest` passes
  - [ ] Tests cover: stake, unstake cooldown (7 days), emergency unstake (5% penalty), tier thresholds (100/1K/10K)
  - [ ] Contract deployed to Base Sepolia and verified
  - [ ] `getUserTier()` returns correct tier based on staked balance
- **Dependencies**: TASK-001 (FITToken)
- **Notes**: Premium features are P1 but contract should be deployed early. See `docs/CONTRACTS.md` Section 6.

---

#### TASK-006: Supabase Schema + RLS Setup
- **Priority**: P0
- **Scope**: `supabase/migrations/001_initial_schema.sql`
- **Acceptance Criteria**:
  - [ ] Migration creates all 5 tables: `users`, `agents`, `workouts`, `conversations`, `rewards`
  - [ ] `supabase db reset` applies migration without errors
  - [ ] All 6 indexes from ARCHITECTURE.md created
  - [ ] RLS enabled on all 5 tables
  - [ ] RLS policies enforce user-only access (test with anon key)
  - [ ] `set_wallet_context()` function created and callable
  - [ ] INSERT + SELECT + UPDATE policies all present (no gaps)
  - [ ] `supabase db push` succeeds on remote project
- **Dependencies**: None
- **Notes**: See `docs/ARCHITECTURE.md` Section 8. Known issue: RLS INSERT policies have caused silent failures in SMASH project — test explicitly.

---

#### TASK-007: Wallet Connection + Agent Spawn UI
- **Priority**: P0
- **Scope**: `src/app/spawn/page.tsx`, `src/components/WalletConnect.tsx`, `src/hooks/useAgentSpawn.ts`
- **Acceptance Criteria**:
  - [ ] WalletConnect, Coinbase Wallet, and injected wallets connect successfully
  - [ ] Connected address displayed in header (truncated: `0x1234...5678`)
  - [ ] Wrong network triggers chain switch prompt to Base Sepolia
  - [ ] Onboarding form captures: goals, experience, equipment, workout types, communication style, coach mode (Coach/Friend/Mentor)
  - [ ] Form submits and calls `MoltCoachRegistry.spawnAgent()` on-chain
  - [ ] Success state shows agent NFT ID and redirects to `/dashboard`
  - [ ] `pnpm typecheck` passes with zero errors
  - [ ] Mobile responsive at 375px
- **Dependencies**: TASK-002 (MoltCoachRegistry deployed)
- **Notes**: Use Privy for auth (email + Google + wallet). wagmi v2 + viem for contract interaction.

---

#### TASK-008: Workout Logging (Track C — Manual Entry)
- **Priority**: P0
- **Scope**: `src/app/chat/page.tsx`, `src/app/api/workouts/route.ts`, `src/hooks/useWorkoutLog.ts`
- **Acceptance Criteria**:
  - [ ] User can log workout via chat message (agent parses natural language)
  - [ ] User can log workout via `/log-workout` command with structured fields
  - [ ] Workout stored in Supabase `workouts` table with correct user_id, agent_id, data_source='manual'
  - [ ] Agent acknowledges workout with summary and estimated $FIT reward
  - [ ] Workout appears in `/dashboard` history
  - [ ] `pnpm typecheck` passes
- **Dependencies**: TASK-006 (Supabase schema), TASK-007 (wallet + auth)
- **Notes**: Start with manual entry (Track C). Image upload (Track B) and wearable API (Track A) are separate tasks. This gets the core loop working.

---

#### TASK-009: Image Upload Workout Logging (Track B)
- **Priority**: P0
- **Scope**: `src/app/api/health/image/route.ts`, `src/hooks/useImageUpload.ts`, MCP tool `health_query`
- **Acceptance Criteria**:
  - [ ] User can upload photo via web chat
  - [ ] Image stored in Supabase Storage
  - [ ] Claude vision extracts: duration, calories, heart rate, distance (when visible)
  - [ ] Extraction accuracy > 80% on test set of 10 images (Apple Watch, Garmin, treadmill screens)
  - [ ] Structured data stored in `workouts` table with data_source='image_upload', data_tier=2
  - [ ] Image hash stored for validation evidence
  - [ ] `pnpm typecheck` passes
- **Dependencies**: TASK-006, TASK-008 (manual logging works first)
- **Notes**: The accessibility differentiator. "Anyone with a phone" starts here. Test with real screenshots from Apple Watch, Garmin Connect, gym equipment.

---

#### TASK-010: End-to-End Validation + Reward Claim
- **Priority**: P0
- **Scope**: `src/app/api/validation/route.ts`, `src/hooks/useRewardClaim.ts`, contract integration
- **Acceptance Criteria**:
  - [ ] After workout logged, validation request submitted to WorkoutValidator
  - [ ] Admin operator (for MVP) can submit validation response
  - [ ] Validation score written to ERC-8004 Validation Registry
  - [ ] If score ≥ 80, user can click "Claim Reward" on dashboard
  - [ ] `claimReward()` tx mints correct $FIT to user wallet
  - [ ] Reward amount reflects tier multiplier and streak bonus
  - [ ] Reward history visible on dashboard
  - [ ] `pnpm typecheck` passes
  - [ ] `forge test --match-test testEndToEnd` passes (Foundry integration test)
- **Dependencies**: TASK-001, TASK-003, TASK-004, TASK-006, TASK-008
- **Notes**: This is the full loop: log → validate → claim. Once this works, we have an MVP. Oracle is manual (admin) for now.

---

### 🟡 In Progress

#### TASK-000: Documentation Suite
- **Priority**: P0
- **Branch**: `docs/documentation-setup`
- **Status**: 5 of 7 docs complete
- **Acceptance Criteria**:
  - [x] `docs/CONTRACTS.md` — complete (Session 3)
  - [x] `CLAUDE.md` — complete (Session 3)
  - [x] `docs/PRD.md` v1.1 — complete (Session 4)
  - [x] `docs/ARCHITECTURE.md` v1.1 — complete (Session 4)
  - [x] `docs/TOKENOMICS.md` — complete (Session 4)
  - [ ] `tasks/CURRENT_SPRINT.md` — this file (Session 4)
  - [ ] `.claude/skills/fitness-coaching/SKILL.md` — next up
- **Dependencies**: None
- **Notes**: All docs cross-referenced and consistent. Health data architecture revised from 4-track to 3-track model. ERC-8004 interfaces pulled from official spec.

---

### 🟢 Done

> Move tasks here when ALL acceptance criteria checkboxes are checked.

*(None yet)*

---

## Task Dependency Graph

```
TASK-001 (FITToken)
  ├── TASK-002 (Registry) ──── TASK-007 (Spawn UI) ──── TASK-008 (Manual Log)
  │                                                          │
  ├── TASK-004 (RewardDist) ────────────────────── TASK-010 (E2E Validation)
  │                                                    │
  ├── TASK-005 (StakingVault)                          │
  │                                              TASK-009 (Image Upload)
  TASK-003 (WorkoutValidator) ────────────────────────┘
  
  TASK-006 (Supabase) ──── TASK-008 ──── TASK-009 ──── TASK-010
```

**Critical path**: TASK-001 → TASK-002 + TASK-003 + TASK-004 → TASK-006 → TASK-007 → TASK-008 → TASK-010

---

## Sprint Exit Criteria

All of the following must be true:
- [ ] All P0 tasks (001-004, 006-010) have all acceptance criteria checked
- [ ] `forge test` passes with zero failures
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes
- [ ] One person can: connect wallet → spawn agent → log workout → get validated → claim $FIT
- [ ] All contracts deployed and verified on Base Sepolia
- [ ] Supabase RLS working (tested with both service role and anon key)

---

*Sprint created: February 7, 2026 — Session 4*
