# PRD.md — Product Requirements Document

> **Version**: 1.0.0
> **Project**: ClawCoach
> **Last Updated**: Feb 7, 2026

---

## 1. Overview

### What Is This?
ClawCoach is an AI coaching agent that lives on-chain via ERC-8004. Each user gets a personalized coaching agent when they connect a Coinbase Smart Wallet. The agent provides fitness, health, and wellness coaching with workout tracking, wearable integration, and move-to-earn $CLAWC token rewards. Built to expand into any coaching category.

### One-Liner
AI coaching agent with on-chain identity and $CLAWC rewards.

### Target Chain
Base (chainId 8453) — Ethereum L2, low gas, Coinbase ecosystem.

### Core Value Proposition
1. Personalized AI coach with persistent on-chain identity (ERC-8004)
2. Move-to-earn rewards ($CLAWC) for tracked workouts and activity
3. Expandable from FHW to any coaching category

---

## 2. Users

### Primary Persona
- **Who**: Fitness-minded person interested in Web3 and earning from their workouts
- **Web3 Familiarity**: Beginner to Intermediate
- **Goal**: Get a personal AI coach that tracks progress and rewards consistency
- **Pain Point**: Generic fitness apps don't reward you, and AI chatbots don't know you

### Secondary Persona
- **Who**: Web3-native user interested in AI agents and move-to-earn
- **Goal**: Own an on-chain coaching agent, earn and stake $CLAWC

---

## 3. Technical Stack

> Full details in `CLAUDE.md`. Summary here for context.

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Web3 | wagmi v2, viem, Coinbase Smart Wallet |
| Contracts | Solidity ^0.8.20, Foundry, OpenZeppelin 5.x, ERC-8004 |
| Backend | Next.js Route Handlers, Prisma, Supabase Postgres |
| AI | Claude Agent SDK (coaching agent runtime) |
| Token | $CLAWC (ERC-20), staking contract |
| Comms | XMTP, Telegram |
| Chain | Base (8453) mainnet + Base Sepolia (84532) testnet |

---

## 4. Features

### 4.1 Wallet Connection & Auth
**User Story**: As a user, I want to connect my Coinbase Smart Wallet to start using ClawCoach.

**Acceptance Criteria**:
- [ ] Coinbase Smart Wallet connects on Base Sepolia
- [ ] Connected address displayed in header (truncated: `0x1234...5678`)
- [ ] Disconnect clears session and local state
- [ ] Wrong network triggers chain switch to Base
- [ ] `pnpm typecheck` passes
- [ ] Connection persists across page refresh

### 4.2 Agent Creation (ERC-8004)
**User Story**: As a verified user, I want to create my ClawCoach agent so it has an on-chain identity.

**Acceptance Criteria**:
- [ ] User can mint their ClawCoach agent (1 per wallet)
- [ ] Agent gets ERC-8004 identity (ERC-721 token with agentURI)
- [ ] agentURI resolves to agent registration file (personality, capabilities)
- [ ] Agent creation triggers onboarding flow
- [ ] `pnpm typecheck` passes

### 4.3 Agent Onboarding
**User Story**: As a new ClawCoach owner, I want to customize my agent's personality and coaching style.

**Acceptance Criteria**:
- [ ] Onboarding asks questions to determine personality, heartbeat, persona
- [ ] Personality: communication style, tone, motivational approach
- [ ] Heartbeat: check-in frequency, activity cadence
- [ ] Persona: coaching specialization (FHW for MVP)
- [ ] Onboarding data stored in database and referenced in agentURI
- [ ] `pnpm typecheck` passes

### 4.4 Workout Tracking
**User Story**: As a user, I want my ClawCoach to track my workouts and activity.

**Acceptance Criteria**:
- [ ] Manual workout logging (type, duration, intensity)
- [ ] Wearable data integration (Strava, Apple Health, Garmin) — at least one for MVP
- [ ] Workout history viewable in dashboard
- [ ] `pnpm typecheck` passes

### 4.5 $CLAWC Rewards (Move-to-Earn)
**User Story**: As a user, I want to earn $CLAWC tokens for completing workouts.

**Acceptance Criteria**:
- [ ] $CLAWC minted to user wallet after verified workout
- [ ] Reward amount based on workout type/duration/consistency
- [ ] $CLAWC balance displayed in dashboard
- [ ] Transaction viewable on block explorer
- [ ] `pnpm typecheck` passes

### 4.6 $CLAWC Staking
**User Story**: As a $CLAWC holder, I want to stake my tokens for enhanced features.

**Acceptance Criteria**:
- [ ] Stake/unstake $CLAWC via UI
- [ ] Staking unlocks enhanced coaching features (TBD)
- [ ] Staked balance and rewards displayed
- [ ] `pnpm typecheck` passes

### 4.7 Agent Communication
**User Story**: As a user, I want my ClawCoach to message me through my preferred channel.

**Acceptance Criteria**:
- [ ] XMTP messaging between agent and user
- [ ] Telegram bot fallback
- [ ] User can choose preferred channel
- [ ] Agent sends motivation, reminders, suggestions
- [ ] `pnpm typecheck` passes

---

## 5. Milestones

### Stage 1: Foundation (MVP)
**Goal**: Core app works. Users can connect wallet, create agent, log workouts, earn $CLAWC.

**Exit Criteria**:
- [ ] All P0 features pass acceptance criteria
- [ ] Deployed to Base Sepolia
- [ ] 5 internal testers complete full flow without help

### Stage 2: Launch & Growth
**Goal**: Mainnet. Real users. $CLAWC rewards live. Wearable integrations.

**Exit Criteria**:
- [ ] Mainnet contracts verified on Basescan
- [ ] 100+ active users
- [ ] Zero critical bugs for 2 weeks
- [ ] At least 2 wearable integrations live

### Stage 3: Community & Expansion
**Goal**: clawcoach.ai community hub. Expand beyond FHW. Agent-to-agent interactions.

**Exit Criteria**:
- [ ] Community hub at clawcoach.ai
- [ ] At least 1 non-FHW coaching category live
- [ ] Agent-to-agent interactions demonstrated

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

- DAO governance
- Prediction markets
- NFT marketplace for agents
- Cross-chain deployment (Base only for now)

---

## 8. Open Questions

- [ ] $CLAWC tokenomics: total supply, distribution, earn rates
- [ ] Which wearable integration first? (Strava likely easiest)
- [ ] XMTP vs Telegram: which is primary for MVP?
- [ ] Agent-to-agent protocol at clawcoach.ai — what does this look like?
