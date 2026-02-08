# CURRENT_SPRINT.md

> **Purpose**: Active tasks with machine-checkable acceptance criteria. Claude Code checks this at session start.

---

## Sprint: Foundation Setup

### Goal
> Project scaffolded, wallet connection working, ERC-8004 agent identity contract drafted.

---

## Tasks

### Not Started

#### TASK-003: ERC-8004 Agent Identity Contract
- **Priority**: P1
- **Scope**: `contracts/src/`, `contracts/test/`
- **Acceptance Criteria**:
  - [ ] `forge build` passes with zero warnings
  - [ ] `forge test` passes all tests
  - [ ] Contract implements ERC-8004 Identity Registry interface
  - [ ] Agent creation mints ERC-721 with agentURI
  - [ ] Only wallet owner can create their agent
  - [ ] `forge coverage` shows >90% line coverage
- **Dependencies**: None
- **Notes**: Reference https://eips.ethereum.org/EIPS/eip-8004

#### TASK-004: $FIT Token Contract
- **Priority**: P1
- **Scope**: `contracts/src/`, `contracts/test/`
- **Acceptance Criteria**:
  - [ ] `forge build` passes with zero warnings
  - [ ] `forge test` passes all tests
  - [ ] Standard ERC-20 with mint/burn capabilities
  - [ ] Owner-only minting (for move-to-earn rewards)
  - [ ] `forge coverage` shows >90% line coverage
- **Dependencies**: None
- **Notes**: Tokenomics now defined in `docs/TOKENOMICS.md` — 1B max supply, 100K/day emission cap, ERC20Burnable + ERC20Permit

---

### In Progress

> Move tasks here when work begins. Note the session/branch.

---

### Done

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
