# Complete Claude Code Documentation Bundle

> **Generated**: February 2026
> **For**: Michael — Web3 Development Projects
> **Contains**: Global config, project templates, all supporting docs

---

# TABLE OF CONTENTS

1. [GLOBAL CONFIG](#1-global-config) — `~/.claude/CLAUDE.md`
2. [PROJECT TEMPLATE](#2-project-template) — `project/CLAUDE.md`
3. [SMASH PROJECT CONFIG](#3-smash-project-config) — `smash/CLAUDE.md`
4. [SESSION HANDOFF](#4-session-handoff) — `SESSION_HANDOFF.md`
5. [CURRENT ISSUES](#5-current-issues) — `CURRENT_ISSUES.md`
6. [CURRENT SPRINT](#6-current-sprint) — `tasks/CURRENT_SPRINT.md`
7. [PRD TEMPLATE](#7-prd-template) — `docs/PRD.md`
8. [ARCHITECTURE](#8-architecture) — `docs/ARCHITECTURE.md`
9. [CONTRACTS](#9-contracts) — `docs/CONTRACTS.md`
10. [WEB3 COMMANDS](#10-web3-commands) — `docs/WEB3_COMMANDS.md`
11. [MAINTENANCE](#11-maintenance) — `docs/MAINTENANCE.md`

---

═══════════════════════════════════════════════════════════════════════════════
# 1. GLOBAL CONFIG
> File: `~/.claude/CLAUDE.md`
> Scope: Applies to ALL projects
═══════════════════════════════════════════════════════════════════════════════

# CLAUDE.md — Global Context (All Projects)

> **Location**: `~/.claude/CLAUDE.md`
> **Scope**: Applies to every project. Project-specific `CLAUDE.md` files extend this.

---

## Michael's Preferences

- **Skill level**: Low-level developer learning blockchain — explain concepts, provide best practices
- **Stop and ask**: When in doubt, ask questions before proceeding
- **75% rule**: Notify at 75% token usage and create handoff files before context degrades
- **Periodic updates**: Provide token usage updates during long sessions
- **Checklists**: Prefer checklists over prose for multi-step operations
- **Version diffs**: Show `old → new` for any package/tool updates
- **Time warnings**: If a task will take more than 5 minutes, warn upfront and ask whether to proceed or break into smaller chunks
- **Wallets**: Coinbase Wallet for funds, MetaMask for development
- **Verify contracts**: Remind to verify on block explorer (can skip during dev, but flag when critical)

---

## System Maintenance

- When asked to "update everything" or similar broad requests: **list what you plan to update** (brew packages, npm globals, system tools, etc.) and **ask for confirmation** before proceeding.
- For long-running maintenance tasks: **create a checklist at the start** showing all steps, then check them off as completed.
- Use `TodoWrite` for trackable progress on multi-step maintenance.
- If interrupted mid-maintenance: immediately report what's complete, what's pending, and whether anything is in a broken state.

---

## Default Stack

> Project-specific `CLAUDE.md` can override these.

| Layer | Default Technology |
|-------|-------------------|
| Frontend | Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Web3 | wagmi v2, viem, WalletConnect, Coinbase Smart Wallet |
| Contracts | Solidity ^0.8.20, Foundry, OpenZeppelin 5.x |
| Chain | Base (8453) mainnet, Base Sepolia (84532) testnet |
| Backend | Next.js Route Handlers, Prisma |
| Database | Supabase (Postgres + Auth) |
| Cache | Upstash Redis |
| Jobs | Trigger.dev |
| AI | Claude API (Anthropic), LangGraph orchestration |
| Hosting | Vercel |

---

## Code Rules (Non-Negotiable)

### TypeScript
- Strict mode always. No `any` types. No `// @ts-ignore`.
- Use `type` over `interface` unless extending.
- Prefer `const` assertions and discriminated unions.
- Zod for all runtime validation.

### React / Next.js
- Server Components by default. Add `'use client'` only when needed.
- TanStack Query for all server state. No `useEffect` for data fetching.
- Zustand only for client-side UI state.
- React Hook Form + Zod resolver for all forms.
- All pages get `loading.tsx` and `error.tsx` siblings.

### Styling
- TailwindCSS utility classes. No custom CSS files unless unavoidable.
- shadcn/ui components from `@/components/ui/`.
- Mobile-first. Responsive breakpoints: `sm:` → `md:` → `lg:`.

### Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils/libs: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE`
- Contract functions: `camelCase`
- Events: `PascalCase`
- DB tables: `snake_case`

---

## Smart Contract Rules

### Solidity
- Version: `^0.8.20` minimum.
- OpenZeppelin 5.x only. Audited contracts only.
- Checks-effects-interactions pattern.
- `ReentrancyGuard` on any function that transfers value.
- Custom errors over `require` strings (gas optimization).
- NatSpec comments on every public/external function.

### Foundry Workflow
- `forge build` must pass with zero warnings before commit.
- `forge test` must pass. Target: 90%+ line coverage.
- `forge snapshot` on every PR for gas regression.
- Use `forge script` for deployments, never manual.
- Slither static analysis on every contract change.

---

## Git Rules

- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/`
- Commit format: `type(scope): description`
- One logical change per commit.
- PR description must reference the task.

---

## Session Management

### The 75% Rule
When the conversation reaches ~75% of the context window, STOP and:
1. Update `SESSION_HANDOFF.md` with current state
2. Update task tracking file with progress
3. Log any open issues to `CURRENT_ISSUES.md`
4. Hand off cleanly before context degrades

### Session Start Checklist
1. Read project `CLAUDE.md` (automatic)
2. Read `SESSION_HANDOFF.md`
3. Read current task file
4. Confirm understanding before writing code

### Session End Checklist
1. All changes committed with proper messages
2. `SESSION_HANDOFF.md` updated
3. Task file updated
4. `CURRENT_ISSUES.md` updated if needed
5. Tests passing

---

## Standard Project Structure

```
project/
├── CLAUDE.md                 # Project-specific context (extends this global file)
├── SESSION_HANDOFF.md        # Session-to-session context transfer
├── CURRENT_ISSUES.md         # Bug/blocker tracker
├── docs/
│   ├── PRD.md                # Product requirements
│   ├── ARCHITECTURE.md       # System design
│   ├── CONTRACTS.md          # Smart contract specs
│   └── WEB3_COMMANDS.md      # CLI reference
├── tasks/
│   └── CURRENT_SPRINT.md     # Active tasks
├── contracts/                # Foundry project
└── src/                      # Next.js app
```

---

## Standard Documentation

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | Project identity, URLs, contracts, domain logic |
| `SESSION_HANDOFF.md` | Context transfer between sessions |
| `CURRENT_ISSUES.md` | Known bugs and blockers |
| `docs/PRD.md` | Features, user stories, acceptance criteria |
| `docs/ARCHITECTURE.md` | System design, data flow |
| `docs/CONTRACTS.md` | Smart contract specs, deploy procedures |
| `docs/WEB3_COMMANDS.md` | forge, cast, anvil, wagmi reference |
| `docs/MAINTENANCE.md` | System update procedures |
| `tasks/CURRENT_SPRINT.md` | Active tasks with status |

---

## Environment Variables Pattern

```env
# .env.local (never committed)
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ALCHEMY_ID=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ANTHROPIC_API_KEY=
```

- `NEXT_PUBLIC_` prefix = client-accessible. Use sparingly.
- All secrets in `.env.local` only.
- `.env.example` committed with empty values.

---

## DAO Governance (Stage 3 — All Projects)

- Governance is NOT part of MVP or initial launch for any project.
- Introduce after active user base established.
- Snapshot for off-chain voting first, then on-chain.
- Multi-sig (Safe) for admin operations until governance is live.


═══════════════════════════════════════════════════════════════════════════════
# 2. PROJECT TEMPLATE
> File: `project/CLAUDE.md`
> Scope: Template for new projects (copy and customize)
═══════════════════════════════════════════════════════════════════════════════

# CLAUDE.md — [PROJECT_NAME] Project Context

> **Project**: [PROJECT_NAME]
> **Extends**: `~/.claude/CLAUDE.md` (global rules apply)

---

## Project Identity

- **Name**: [PROJECT_NAME]
- **One-liner**: [10 words or less describing what this does]
- **Repo**: github.com/[org]/[repo]
- **Live**: https://[domain]

---

## Quick Links

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/[PROJECT_ID] |
| Vercel Dashboard | https://vercel.com/[team]/[project] |
| GitHub Repo | https://github.com/[org]/[repo] |
| Block Explorer | https://basescan.org or https://sepolia.basescan.org |

---

## Smart Contracts

| Contract | Address | Network |
|----------|---------|---------|
| [ContractName] | `0x...` | Base Sepolia (84532) |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia (84532) |

**Admin Wallet**: `0x...`

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Chain / Contracts
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_[CONTRACT]_ADDRESS=

# Auth
NEXT_PUBLIC_PRIVY_APP_ID=
# or
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

---

## Tech Stack (Project-Specific)

> Overrides/extends global defaults where noted.

| Layer | Technology |
|-------|-----------|
| Auth | [Privy / WalletConnect / etc.] |
| Database | Supabase (project ID: `[ID]`) |
| Chain | Base Sepolia (84532) for dev, Base mainnet (8453) for prod |

---

## Domain Concepts

> [Explain project-specific terminology and concepts here]

---

## Database Tables

> [List key tables and their purpose]

---

## Before You Start Any Task

1. Read this file (automatic)
2. Check `SESSION_HANDOFF.md` for context from last session
3. Check task tracking for current priorities
4. Check `CURRENT_ISSUES.md` for known blockers

| Task Type | Read First |
|-----------|------------|
| Feature work | `docs/PRD.md` |
| Smart contracts | `docs/CONTRACTS.md` |
| Database changes | Supabase dashboard |
| System design | `docs/ARCHITECTURE.md` |
| Web3 commands | `docs/WEB3_COMMANDS.md` |

---

## Related Documents

| Document | Path |
|----------|------|
| Product Requirements | `docs/PRD.md` |
| Session Handoff | `SESSION_HANDOFF.md` |
| Current Issues | `CURRENT_ISSUES.md` |

---

*Last updated: [DATE]*


═══════════════════════════════════════════════════════════════════════════════
# 3. SMASH PROJECT CONFIG
> File: `smash/CLAUDE.md`
> Scope: SMASH project only
═══════════════════════════════════════════════════════════════════════════════

# CLAUDE.md — SMASH Project Context

> **Project**: smash.xyz
> **Extends**: `~/.claude/CLAUDE.md` (global rules apply)

---

## Project Identity

- **Name**: SMASH
- **One-liner**: Universal competitive challenge platform with proof verification and prediction markets
- **Repo**: github.com/alpenflow-studios/smash
- **Live**: https://smash.xyz

---

## Quick Links

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/pdjrexphjivdwfbvgbqm |
| Supabase SQL Editor | https://supabase.com/dashboard/project/pdjrexphjivdwfbvgbqm/sql/new |
| Vercel Dashboard | https://vercel.com/classcoin/v0-smash-xyz |
| GitHub Repo | https://github.com/alpenflow-studios/smash |
| Base Sepolia Explorer | https://sepolia.basescan.org |

---

## Smart Contracts

| Contract | Address | Network |
|----------|---------|---------|
| SmashVault | `0xF2b3001f69A78574f6Fcf83e14Cf6E7275fB83De` | Base Sepolia (84532) |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia (84532) |

**Admin Wallet**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pdjrexphjivdwfbvgbqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>

# Chain / Contracts
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_SMASH_VAULT_ADDRESS=0xF2b3001f69A78574f6Fcf83e14Cf6E7275fB83De
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Auth
NEXT_PUBLIC_PRIVY_APP_ID=<your_privy_app_id>
```

---

## Tech Stack (SMASH-Specific)

> Overrides/extends global defaults where noted.

| Layer | Technology |
|-------|-----------|
| Auth | Privy (email, Google, wallet) |
| Database | Supabase (project ID: `pdjrexphjivdwfbvgbqm`) |
| Chain | Base Sepolia (84532) for dev, Base mainnet (8453) for prod |
| State | Zustand |

---

## Domain Concepts

### What is a Smash?
A **Smash** is a competitive challenge between 2+ participants where completion must be proven and verified through consensus. "Proof or it didn't happen" meets prediction markets.

### Smash Lifecycle
```
DRAFT → OPEN → ACTIVE → VERIFICATION → COMPLETE/DISPUTED
```

### Visibility
- **Public**: Anyone can view/join. Eligible for prediction market.
- **Private**: Invite-only. NOT eligible for prediction market.

### Stakes Types
- **Monetary**: USDC/ETH entry fee, winner takes pool
- **Prize**: Physical or digital prize from creator/sponsor
- **Bragging Rights**: Reputation only, no monetary value

### Consensus Methods
1. **Wearable Data** — Automatic via Strava, Apple Health, Garmin
2. **Visual Proof** — Photo/video upload (poidh.xyz style)
3. **Participant Agreement** — Multi-sig style approval
4. **Audience Voting** — Decentralized crowd decision
5. **Hybrid/Escalation** — Starts with participants, escalates if disputed

### Prediction Market Rules
- ✅ Only **public** smashes can have prediction markets
- ❌ Smash **participants cannot bet** on their own smash
- ✅ Outside observers can bet on any participant's success/failure

---

## Database Tables

Core tables in Supabase:
- `users` — User profiles
- `smashes` — Challenge definitions
- `submissions` — Proof submissions
- `bets` — Prediction market bets
- `payment_tokens` — Accepted payment tokens
- `payment_transactions` — Transaction records
- `smash_accepted_tokens` — Token whitelist per smash

---

## Before You Start Any Task

1. Read this file (automatic)
2. Check `SESSION_HANDOFF.md` for context from last session
3. Check `NEXT_STEPS.md` for current priorities
4. Check `CURRENT_ISSUES.md` for known blockers
5. For feature work, read `docs/PRD.md` (formerly `SMASH_SPEC.md`)

| Task Type | Read First |
|-----------|------------|
| Feature work | `docs/PRD.md` |
| Smart contracts | `docs/CONTRACTS.md` |
| Database changes | Supabase dashboard (link above) |
| System design | `docs/ARCHITECTURE.md` |
| Web3 commands | `docs/WEB3_COMMANDS.md` |

---

## Related Documents

| Document | Path | Notes |
|----------|------|-------|
| Product Requirements | `docs/PRD.md` | Full smash spec, lifecycle, schema |
| Session Handoff | `SESSION_HANDOFF.md` | Context for next session |
| Current Issues | `CURRENT_ISSUES.md` | Known bugs and blockers |
| Next Steps | `NEXT_STEPS.md` | Current priorities |

---

## Known Issues (Historical)

- **Session 9**: Multiple chat context losses during deep Supabase investigation. Workaround: create checkpoint files frequently, stop at 75% usage.
- **RLS Policies**: Have caused "Failed to create smash" errors in the past. Check INSERT policies if this recurs.

---

*Last updated: Feb 2026*


═══════════════════════════════════════════════════════════════════════════════
# 4. SESSION HANDOFF
> File: `SESSION_HANDOFF.md`
> Scope: Per-project, updated every session
═══════════════════════════════════════════════════════════════════════════════

# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: [YYYY-MM-DD]
- **Duration**: ~[X] messages
- **Branch**: `[branch-name]`

---

## What Was Done

> List concrete outcomes. No fluff.

1. [Completed item with file paths]
2. [Completed item with file paths]
3. [Completed item with file paths]

---

## What's In Progress

> Partially done work. Include exact file + line if relevant.

1. **[Feature/Fix]**: [Status — what's done, what's left]
   - File: `src/path/to/file.ts`
   - Blocker: [None / describe]

---

## What's Next

> First thing the next session should do.

1. [Highest priority task]
2. [Second priority]
3. [Third priority]

---

## Decisions Made

> Design or architectural decisions from this session. These are permanent unless revisited.

- **[Decision]**: [Rationale]

---

## Open Questions

> Things that need answers before proceeding.

- [ ] [Question — who needs to answer]

---

## State of Tests

- `forge test`: ✅ / ❌ / ⚠️ [details]
- `pnpm test`: ✅ / ❌ / ⚠️ [details]
- `pnpm typecheck`: ✅ / ❌ / ⚠️ [details]
- `pnpm lint`: ✅ / ❌ / ⚠️ [details]

---

## Environment Notes

> Anything weird about the current state (dirty working tree, pending migrations, etc.)

- [Note]


═══════════════════════════════════════════════════════════════════════════════
# 5. CURRENT ISSUES
> File: `CURRENT_ISSUES.md`
> Scope: Per-project bug/blocker tracker
═══════════════════════════════════════════════════════════════════════════════

# CURRENT_ISSUES.md

> **Purpose**: Track known bugs, blockers, and tech debt. Check before starting any task.

---

## Critical (Blocks Progress)

> Nothing here should stay longer than 1 session.

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| — | — | — | — | — |

---

## High (Fix This Sprint)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| — | — | — | — | — |

---

## Medium (Tech Debt)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| — | — | — | — | — |

---

## Low (Nice to Have)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| — | — | — | — | — |

---

## Resolved (Last 5)

> Keep recent resolutions for context. Delete older ones.

| # | Issue | Resolution | Date |
|---|-------|------------|------|
| — | — | — | — |


═══════════════════════════════════════════════════════════════════════════════
# 6. CURRENT SPRINT
> File: `tasks/CURRENT_SPRINT.md`
> Scope: Per-project task tracking with machine-checkable criteria
═══════════════════════════════════════════════════════════════════════════════

# CURRENT_SPRINT.md

> **Purpose**: Active tasks with machine-checkable acceptance criteria. Claude Code checks this at session start.

---

## Sprint: [Name / Date Range]

### Goal
> One sentence. What does "done" look like at the end of this sprint?

[Sprint goal here]

---

## Tasks

### 🔴 Not Started

#### TASK-001: [Task Title]
- **Priority**: P0 / P1 / P2
- **Scope**: [Which files/modules are touched]
- **Acceptance Criteria** (all must be machine-checkable):
  - [ ] `forge test` passes with [specific test name]
  - [ ] `pnpm typecheck` passes with zero errors
  - [ ] Route `GET /api/[endpoint]` returns `200` with shape `{ data: T[] }`
  - [ ] Component `[Name]` renders without console errors
  - [ ] [Specific behavior]: [How to verify]
- **Dependencies**: None / TASK-XXX
- **Notes**: [Context, links, decisions]

---

### 🟡 In Progress

> Move tasks here when work begins. Note the session/branch.

---

### 🟢 Done

> Move tasks here when ALL acceptance criteria checkboxes are checked.

---

## Writing Good Acceptance Criteria

> Reference for task creation. Delete this section once familiar.

**Good** (machine-checkable):
- `forge test --match-test testStakeTokens` passes
- `curl localhost:3000/api/health` returns `{"status":"ok"}`
- `pnpm lint` exits with code 0
- Component renders with test data, no console errors
- Database migration `003_add_rewards` applies without error
- Contract deploys to Anvil and `cast call` returns expected value

**Bad** (subjective/vague):
- "Staking works correctly"
- "UI looks good"
- "Performance is acceptable"
- "Tests are comprehensive"
- "Code is clean"


═══════════════════════════════════════════════════════════════════════════════
# 7. PRD TEMPLATE
> File: `docs/PRD.md`
> Scope: Per-project product requirements
═══════════════════════════════════════════════════════════════════════════════

# PRD.md — Product Requirements Document

> **Version**: 1.0.0
> **Project**: [PROJECT_NAME]
> **Last Updated**: [DATE]

---

## 1. Overview

### What Is This?
[One paragraph. What the product does, who it's for, why it matters.]

### One-Liner
[10 words or less.]

### Target Chain
Base (chainId 8453) — Ethereum L2, low gas, Coinbase ecosystem.

### Core Value Proposition
1. [Value 1]
2. [Value 2]
3. [Value 3]

---

## 2. Users

### Primary Persona
- **Who**: [Description]
- **Web3 Familiarity**: Beginner / Intermediate / Advanced
- **Goal**: [What they want to accomplish]
- **Pain Point**: [What's stopping them today]

### Secondary Persona
- **Who**: [Description]
- **Goal**: [What they want]

---

## 3. Technical Stack

> Full details in `CLAUDE.md`. Summary here for context.

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Web3 | wagmi v2, viem, WalletConnect, Coinbase Smart Wallet |
| Contracts | Solidity ^0.8.20, Foundry, OpenZeppelin 5.x |
| Backend | Next.js Route Handlers, Prisma, Supabase Postgres |
| AI | Claude API (Anthropic), LangGraph orchestration |
| Cache | Upstash Redis |
| Jobs | Trigger.dev |
| Chain | Base (8453) mainnet + Base Sepolia (84532) testnet |

---

## 4. Features

> Each feature has machine-checkable acceptance criteria.

### 4.1 [Feature Name]

**User Story**: As a [user], I want to [action] so that [outcome].

**Acceptance Criteria**:
- [ ] `pnpm typecheck` passes after implementation
- [ ] Route `[METHOD] /api/[path]` returns `[status]` with shape `{ data: T }`
- [ ] Component `[Name]` renders with test data, zero console errors
- [ ] [Specific test]: `pnpm test -- --grep "[test name]"` passes
- [ ] Mobile responsive: renders correctly at 375px width

**Technical Notes**:
- [Implementation guidance, patterns to follow, edge cases]

---

### 4.2 Wallet Connection

**User Story**: As a user, I want to connect my wallet so I can interact with on-chain features.

**Acceptance Criteria**:
- [ ] WalletConnect, Coinbase Wallet, and injected wallets supported
- [ ] Connected address displayed in header (truncated: `0x1234...5678`)
- [ ] Disconnect button clears session and local state
- [ ] Wrong network triggers chain switch prompt to Base
- [ ] `pnpm typecheck` passes
- [ ] Connection persists across page refresh

---

## 5. Milestones

> DAO governance is Stage 3. Don't build governance before you have users.

### Stage 1: Foundation (MVP)
**Goal**: Core product works. Users can connect, interact, get value.

**Exit Criteria**:
- [ ] All P0 features pass acceptance criteria
- [ ] Deployed to testnet
- [ ] 5 internal testers complete full flow without help

---

### Stage 2: Launch & Growth
**Goal**: Mainnet. Real users. Token rewards live.

**Exit Criteria**:
- [ ] Mainnet contracts verified on Basescan
- [ ] 100+ active users
- [ ] Zero critical bugs for 2 weeks

---

### Stage 3: Community & Governance
**Goal**: Decentralize control. Community drives decisions.

**Exit Criteria**:
- [ ] First successful governance vote
- [ ] Treasury under community control

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| First Contentful Paint | < 1.5s |
| API response time (p95) | < 500ms |
| Uptime | 99.5% |
| Contract gas (common ops) | < 100k gas |

---

## 7. Out of Scope (For Now)

- [Deferred item 1]
- [Deferred item 2]

---

## 8. Open Questions

- [ ] [Question]


═══════════════════════════════════════════════════════════════════════════════
# 8. ARCHITECTURE
> File: `docs/ARCHITECTURE.md`
> Scope: Per-project system design
═══════════════════════════════════════════════════════════════════════════════

# ARCHITECTURE.md — System Design

> **Version**: 1.0.0
> **Project**: [PROJECT_NAME]

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENTS                                   │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌──────────────┐   │
│  │  Web App  │   │   PWA    │   │  Farcaster  │   │  Base App    │   │
│  │ (Next.js) │   │ (Mobile) │   │  Mini App   │   │  Mini App    │   │
│  └─────┬─────┘   └─────┬────┘   └──────┬──────┘   └──────┬───────┘   │
└────────┼───────────────┼───────────────┼────────────────┼───────────┘
         │               │               │                │
         ▼               ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Next.js)                           │
│  /api/auth/*     /api/[feature]/*     /api/ai/*     /api/chain/*     │
└─────────────────────────────────────────────────────────────────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │   Postgres    │  │  Redis   │  │  IPFS    │  │  Base Chain   │     │
│  │  (Supabase)   │  │(Upstash) │  │(optional)│  │  (8453)       │     │
│  └──────────────┘  └──────────┘  └──────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

Wallet-first authentication. No email/password (unless using Privy).

```
User clicks "Connect Wallet"
    │
    ▼
wagmi connects (WalletConnect / Coinbase / Injected)
    │
    ▼
Client gets wallet address
    │
    ▼
POST /api/auth/verify
    │  - Server generates nonce
    │  - Client signs nonce with wallet
    │  - Server verifies signature
    │  - Server creates session
    │
    ▼
Authenticated session established
```

---

## Data Model (Postgres)

> Extend per project.

```sql
-- Users (canonical identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Caching Strategy

| Data | Store | TTL |
|------|-------|-----|
| User session | Redis | 24h |
| Token balance | Client (wagmi) | 15s |
| Contract state | TanStack Query | 30s |

---

## Monitoring

| Tool | What It Monitors |
|------|------------------|
| Sentry | Frontend + API errors |
| PostHog | User analytics |
| Tenderly | Smart contract transactions |


═══════════════════════════════════════════════════════════════════════════════
# 9. CONTRACTS
> File: `docs/CONTRACTS.md`
> Scope: Per-project smart contract specs
═══════════════════════════════════════════════════════════════════════════════

# CONTRACTS.md — Smart Contract Specifications

> **Chain**: Base (chainId 8453)
> **Framework**: Foundry
> **Solidity**: ^0.8.20
> **Libraries**: OpenZeppelin 5.x

---

## Directory Structure

```
contracts/
├── src/
│   └── [Contract].sol
├── test/
│   └── [Contract].t.sol
├── script/
│   └── Deploy.s.sol
├── foundry.toml
└── remappings.txt
```

---

## Deploy Commands

```bash
# Testnet (Base Sepolia)
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_KEY \
  -vvvv

# Mainnet
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_KEY \
  -vvvv
```

---

## Security Checklist

### Pre-Testnet
- [ ] All tests passing (`forge test -vvvv`)
- [ ] Coverage > 90% (`forge coverage`)
- [ ] Slither clean
- [ ] No `tx.origin` usage
- [ ] All state changes emit events

### Pre-Mainnet
- [ ] All of the above
- [ ] Testnet tested for 2+ weeks
- [ ] External audit or peer review
- [ ] Admin keys secured (hardware wallet or multi-sig)


═══════════════════════════════════════════════════════════════════════════════
# 10. WEB3 COMMANDS
> File: `docs/WEB3_COMMANDS.md`
> Scope: CLI reference for all Web3 tooling
═══════════════════════════════════════════════════════════════════════════════

# WEB3_COMMANDS.md — CLI Reference

---

## Foundry (forge, cast, anvil)

### forge — Build, Test, Deploy

```bash
# Build
forge build                              # Compile all contracts
forge build --sizes                      # Show contract sizes

# Test
forge test                               # Run all tests
forge test -vvvv                         # Max verbosity
forge test --match-test testStake        # Run specific test
forge test --gas-report                  # Show gas usage

# Coverage
forge coverage                           # Line/branch coverage

# Gas Snapshots
forge snapshot                           # Create .gas-snapshot
forge snapshot --check                   # Compare (CI)

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC \
  --broadcast \
  --verify \
  -vvvv
```

### cast — Read/Write Chain

```bash
# Read
cast call [ADDR] "balanceOf(address)" [WALLET]
cast call [ADDR] "totalSupply()(uint256)"

# Conversions
cast to-wei 1.5 ether
cast from-wei 1500000000000000000

# Chain info
cast chain-id --rpc-url $BASE_RPC
cast block-number --rpc-url $BASE_RPC
cast gas-price --rpc-url $BASE_RPC
cast balance [ADDR] --rpc-url $BASE_RPC

# Send tx
cast send [ADDR] "transfer(address,uint256)" [TO] [AMT] \
  --rpc-url $BASE_RPC \
  --private-key $KEY
```

### anvil — Local Chain

```bash
anvil                                    # Start local chain
anvil --fork-url $BASE_RPC              # Fork Base mainnet
anvil --chain-id 8453                   # Match Base chain ID
```

---

## Base Networks

```
# Base Mainnet
RPC: https://mainnet.base.org
Chain ID: 8453
Explorer: https://basescan.org

# Base Sepolia
RPC: https://sepolia.base.org
Chain ID: 84532
Explorer: https://sepolia.basescan.org
```

---

## Useful Aliases

```bash
# Add to ~/.zshrc
alias fb="forge build"
alias ft="forge test"
alias ftv="forge test -vvvv"
alias fs="forge snapshot"
alias cb="cast balance"
alias cc="cast call"
alias dev="pnpm dev"
alias tc="pnpm typecheck"
```


═══════════════════════════════════════════════════════════════════════════════
# 11. MAINTENANCE
> File: `docs/MAINTENANCE.md`
> Scope: System update procedures and agent patterns
═══════════════════════════════════════════════════════════════════════════════

# MAINTENANCE.md — System Update & Environment Maintenance

---

## Quick Update (Interactive)

```
Update my dev environment: 1) brew packages, 2) npm global packages, 3) list any outdated CLI tools. Show me a checklist first, then proceed step by step.
```

---

## Headless Mode (Unattended)

```bash
claude -p "Update homebrew packages and npm globals. List what was updated with old->new versions. Be concise." \
  --allowedTools "Bash,Read" \
  > ~/maintenance-report-$(date +%Y%m%d).txt
```

---

## Autonomous Maintenance Agent

```
I want you to act as my autonomous system maintenance agent. First, create a
comprehensive TODO list of everything that needs updating: brew packages, npm
global packages, pip packages, system software updates, VS Code extensions,
and any language version managers (nvm, pyenv, rbenv).

Then systematically work through each category: check current versions,
identify what's outdated, document any breaking changes in release notes,
and execute updates. Run updates in parallel where safe.

After each category, write a brief status report. If any update fails,
document the error, attempt a rollback if needed, and continue with
remaining updates.

Conclude with a full summary of what was updated, what failed, and any
manual actions I need to take.
```

---

## Self-Healing Update Pipeline

```
Create a self-testing update system for my development environment.

First, establish baseline tests: verify that git, node, python, forge, cast,
anvil, and my other key tools return expected version formats and can execute
basic commands. Store these as executable test scripts.

Then perform system updates, and after each major update, re-run the test
suite. If any test fails, automatically investigate the cause, attempt fixes
(reinstall, path adjustments, version pinning), and re-test.

Document everything in a markdown report.
```

---

## Manual Update Checklist

```bash
# 1. Homebrew
brew update && brew upgrade && brew cleanup

# 2. Node.js / npm
nvm install --lts && nvm alias default node
npm update -g

# 3. Foundry
foundryup

# 4. Verify
echo "Node: $(node --version)"
echo "Forge: $(forge --version)"
echo "Cast: $(cast --version)"
```

---

## Maintenance Schedule

| Frequency | What |
|-----------|------|
| Weekly | Brew + npm globals |
| Bi-weekly | Full environment audit |
| Monthly | Self-healing pipeline |
| Before major project | Full pipeline |
