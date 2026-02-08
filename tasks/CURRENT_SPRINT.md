# CURRENT_SPRINT.md

> **Purpose**: Active tasks with machine-checkable acceptance criteria. Claude Code checks this at session start.

---

## Sprint: Foundation Setup

### Goal
> Project scaffolded, wallet connection working, ERC-8004 agent identity contract drafted.

---

## Tasks

### Not Started

#### TASK-001: Scaffold Next.js App
- **Priority**: P0
- **Scope**: Root project setup
- **Acceptance Criteria**:
  - [ ] `pnpm dev` starts Next.js dev server without errors
  - [ ] `pnpm typecheck` passes with zero errors
  - [ ] `pnpm lint` passes
  - [ ] App Router structure in place (`app/` directory)
  - [ ] TailwindCSS + shadcn/ui configured
  - [ ] `.env.example` committed with all required vars (empty)
- **Dependencies**: None
- **Notes**: Use standard stack from global CLAUDE.md

#### TASK-002: Coinbase Smart Wallet Integration
- **Priority**: P0
- **Scope**: `src/lib/wallet/`, `src/components/`
- **Acceptance Criteria**:
  - [ ] Coinbase Smart Wallet connects successfully on Base Sepolia
  - [ ] Connected address displayed in header (truncated)
  - [ ] Disconnect clears session and state
  - [ ] Wrong network triggers chain switch to Base Sepolia
  - [ ] Connection persists across page refresh
  - [ ] `pnpm typecheck` passes
- **Dependencies**: TASK-001
- **Notes**: Coinbase Smart Wallet as primary auth

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
- **Dependencies**: None (can parallel with TASK-001)
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
- **Notes**: Tokenomics TBD — start with basic ERC-20 + Ownable

---

### In Progress

> Move tasks here when work begins. Note the session/branch.

---

### Done

> Move tasks here when ALL acceptance criteria checkboxes are checked.
