# CURRENT_SPRINT.md

> **Purpose**: Active tasks with machine-checkable acceptance criteria. Claude Code checks this at session start.

---

## Sprint: Frontend Integration + UX

### Goal
> Full frontend connected to deployed contracts. Agent creation, staking, dashboard — all working end-to-end on Base Sepolia.

---

## Tasks

### Not Started

#### TASK-008: Manual Testing + Mint Test Tokens
- **Priority**: P0
- **Scope**: `pnpm dev` testing, `MintTestTokens.s.sol` execution
- **Acceptance Criteria**:
  - [ ] Run `pnpm dev`, all 4 routes render correctly (/, /staking, /agent, /dashboard)
  - [ ] Connect Coinbase Smart Wallet on Base Sepolia
  - [ ] Execute MintTestTokens script to mint 10K FIT to deployer
  - [ ] Staking page reads show correct data from deployed contracts
  - [ ] Agent registration works end-to-end on Base Sepolia
  - [ ] Dashboard shows correct stats after staking + agent creation

#### TASK-009: Supabase Integration
- **Priority**: P1
- **Scope**: `src/lib/supabase.ts`, new hooks, API routes
- **Depends on**: Michael completing Supabase project setup with Claude.ai
- **Acceptance Criteria**:
  - [ ] Supabase project ID and anon key in `.env.local`
  - [ ] User record created on wallet connect
  - [ ] Agent registration synced to Supabase
  - [ ] Workout data stored in Supabase
  - [ ] RLS policies working (users can only read/write own data)

#### TASK-010: Agent Coaching Chat
- **Priority**: P1
- **Scope**: New chat interface, Claude API integration
- **Acceptance Criteria**:
  - [ ] Chat interface at `/chat` or within `/agent`
  - [ ] Messages sent to Claude API with coaching personality
  - [ ] Agent coaching style (selected at registration) reflected in responses
  - [ ] Conversation history stored in Supabase
  - [ ] `pnpm typecheck` passes

---

### In Progress

#### TASK-007: Frontend Pages + Shared Layout (Session 7)
- **Priority**: P0
- **Scope**: Layout, agent UI, dashboard, Supabase scaffold
- **Started**: Session 7 (Feb 8, 2026)
- **Status**: ~90% complete. All code written, builds pass. Needs commit + push + minor toast additions.
- **Acceptance Criteria**:
  - [x] Shared Navbar with responsive mobile menu
  - [x] Shared Footer with nav links
  - [x] Root layout includes Navbar + Footer (no per-page duplication)
  - [x] `/agent` route — register agent or view profile
  - [x] `/dashboard` route — overview of wallet, staking, agent
  - [x] Supabase client scaffold (`src/lib/supabase.ts` + types)
  - [x] MoltcoachIdentity ABI + address in `contracts.ts`
  - [x] Agent hooks (`useAgentReads`, `useRegisterAgent`)
  - [x] Toast notifications (sonner) installed and wired to layout
  - [x] `pnpm typecheck` passes
  - [x] `pnpm lint` passes
  - [x] `pnpm build` passes
  - [ ] Toast on unstake success
  - [ ] Toast on agent registration success
  - [ ] All changes committed + pushed

---

### Done

#### TASK-006: FIT Staking Contract
- **Priority**: P1
- **Scope**: `contracts/src/FitStaking.sol`, `contracts/test/FitStaking.t.sol`
- **Completed**: Session 5 (Feb 8, 2026)
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 62 tests (including 5 fuzz tests)
  - [x] Stake/unstake $FIT with ReentrancyGuard
  - [x] Staking tiers: Free(0), Basic(100), Pro(1K), Elite(10K)
  - [x] Early unstake (< 30 days) charges 5% penalty to ProtocolFeeCollector
  - [x] Normal unstake (≥ 30 days) has no penalty
  - [x] `forge coverage` shows 100% line coverage on contract

#### TASK-005: ProtocolFeeCollector Contract
- **Priority**: P0
- **Scope**: `contracts/src/fees/ProtocolFeeCollector.sol`, `contracts/test/ProtocolFeeCollector.t.sol`
- **Completed**: Session 4 (Feb 8, 2026)
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 61 tests (including 5 fuzz tests)
  - [x] Fee collection works for $FIT and USDC
  - [x] `distribute()` splits to 4 treasury wallets at correct ratios (40/30/20/10)
  - [x] Allocation update enforces sum = 10000 bps
  - [x] Transaction fee capped at 5% max
  - [x] Only owner can update fees and allocations
  - [x] All state changes emit events
  - [x] `forge coverage` shows 100% line coverage on contract

#### TASK-004: $FIT Token Contract
- **Priority**: P0
- **Scope**: `contracts/src/FitToken.sol`, `contracts/test/FitToken.t.sol`
- **Completed**: Session 4 (Feb 8, 2026)
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 50 tests (including 5 fuzz tests)
  - [x] Standard ERC-20 with mint/burn capabilities (ERC20Burnable + ERC20Permit)
  - [x] Owner-only minting (for move-to-earn rewards)
  - [x] 1B max supply, 100K/day emission cap enforced on-chain
  - [x] `forge coverage` shows 100% line coverage on contract

#### TASK-003: ERC-8004 Agent Identity Contract
- **Priority**: P1
- **Scope**: `contracts/src/MoltcoachIdentity.sol`, `contracts/test/MoltcoachIdentity.t.sol`
- **Completed**: Session 3 (Feb 8, 2026)
- **Commit**: `a4adcfd`
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 43 tests (including 3 fuzz tests)
  - [x] Contract implements ERC-8004 Identity Registry interface (register, metadata, wallet, URI)
  - [x] Agent creation mints ERC-721 with agentURI
  - [x] Only wallet owner can create their agent (1-per-wallet constraint)
  - [x] `forge coverage` shows 98.67% line coverage on contract

#### TASK-001: Scaffold Next.js App
- **Priority**: P0
- **Scope**: Root project setup
- **Completed**: Session 2 (Feb 7, 2026)
- **Commit**: `97cbf6d`
- **Acceptance Criteria**:
  - [x] `pnpm dev` starts Next.js dev server without errors
  - [x] `pnpm typecheck` passes with zero errors
  - [x] `pnpm lint` passes
  - [x] App Router structure in place (`app/` directory)
  - [x] TailwindCSS + shadcn/ui configured
  - [x] `.env.example` committed with all required vars (empty)

#### TASK-002: Coinbase Smart Wallet Integration
- **Priority**: P0
- **Scope**: `src/config/`, `src/components/`
- **Completed**: Session 2 (Feb 7, 2026)
- **Commit**: `46cdc47`
- **Acceptance Criteria**:
  - [x] Coinbase Smart Wallet connects successfully on Base Sepolia
  - [x] Connected address displayed in header (truncated)
  - [x] Disconnect clears session and state
  - [x] Wrong network triggers chain switch to Base Sepolia
  - [x] Connection persists across page refresh
  - [x] `pnpm typecheck` passes
