# CLAUDE.md — ClawCoach Project Context

> **Project**: ClawCoach
> **Extends**: `~/.claude/CLAUDE.md` (global rules apply)

---

## Project Identity

- **Name**: ClawCoach
- **One-liner**: AI coaching agent with on-chain identity and Privy-powered auth
- **Repo**: github.com/alpenflow-studios/moltcoach
- **Live**: https://clawcoach.ai

---

## Quick Links

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/alpenflow-studios/moltcoach |
| ERC-8004 Spec | https://eips.ethereum.org/EIPS/eip-8004 |
| Base Sepolia Explorer | https://sepolia.basescan.org |
| Supabase Dashboard | https://supabase.com/dashboard/project/agvdivapnrqpstvhkbmk |
| Vercel Dashboard | https://vercel.com/classcoin/moltcoach |
| Privy Dashboard | https://dashboard.privy.io |

---

## Smart Contracts

| Contract | Address | Network |
|----------|---------|---------|
| ClawcoachIdentity (ERC-8004) | `0xB95fab07C7750C50583eDe6CE751cc753811116c` | Base Sepolia (84532) |
| $CLAWC Token | `0x275534e19e025058d02a7837350ffaD6Ba136b7c` | Base Sepolia (84532) |
| ProtocolFeeCollector | `0x9233CC1Ab2ca19F7a240AD9238cBcf59516Def55` | Base Sepolia (84532) |
| CLAWC Staking | `0x6B2D2f674373466F0C490E26a1DE00FF7F63BFad` | Base Sepolia (84532) |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia (84532) |

**Admin Wallet**: Deployer (MetaMask dev wallet)

> **Note**: Addresses above are from the Phase 7 $CLAWC rebrand deployment (Session 23, Feb 11 2026). Verified on BaseScan.

---

## Contract Deployment Order

```
1. ClawcToken ($CLAWC)       ← TASK-004
2. ProtocolFeeCollector      ← TASK-005 (needs CLAWC + USDC addresses)
3. ClawcStaking              ← TASK-006 (needs CLAWC + FeeCollector)
4. ClawcoachIdentity         ← Already built (TASK-003), deploy anytime
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Chain / Contracts
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS=
NEXT_PUBLIC_CLAWC_TOKEN_ADDRESS=
NEXT_PUBLIC_CLAWC_STAKING_ADDRESS=

# Privy Auth (get from dashboard.privy.io)
NEXT_PUBLIC_PRIVY_APP_ID=

# AI
ANTHROPIC_API_KEY=
```

---

## Tech Stack (ClawCoach-Specific)

> Overrides/extends global defaults where noted.

| Layer | Technology |
|-------|-----------|
| Auth | Privy (email + Farcaster + wallet: Coinbase, MetaMask, WalletConnect) |
| Agent Framework | Claude Agent SDK (coaching agent runtime) |
| Agent Identity | ERC-8004 (Trustless Agents) on Base |
| Agent Comms | XMTP, Telegram |
| Token | $CLAWC (ERC-20, platform staking & governance) |
| Staking | $CLAWC staking contract |
| Wearables | Strava, Apple Health, Garmin integrations |
| Database | Supabase (project: `clawcoach`, ref: `agvdivapnrqpstvhkbmk`) |
| Chain | Base Sepolia (84532) for dev, Base mainnet (8453) for prod |

---

## Domain Concepts

### What is ClawCoach?
A **ClawCoach** is an AI coaching agent that lives on-chain via ERC-8004. Each user gets their own ClawCoach agent when they connect via Privy (email, Farcaster, or external wallet). The agent has a persistent identity, personality, and reputation.

### Agent Lifecycle
```
USER CONNECTS WALLET → VERIFICATION → AGENT CREATION (ERC-8004)
    → ONBOARDING (personality, heartbeat, persona via questions + metrics)
    → ACTIVE COACHING (workouts, tracking, motivation)
    → REWARDS ($CLAWC earned via move-to-earn)
    → STAKING ($CLAWC staked for benefits)
```

### ERC-8004 Integration
ClawCoach uses all three ERC-8004 registries:
1. **Identity Registry** — Each ClawCoach agent gets an on-chain identity (ERC-721 based) with an `agentURI` resolving to their registration file (personality, capabilities, specialization)
2. **Reputation Registry** — Coaching effectiveness tracked on-chain (user outcomes, consistency scores, engagement metrics)
3. **Validation Registry** — Workout verification via wearable data, proof-of-activity checks

### Onboarding — Personality, Heartbeat, Persona
When a new ClawCoach is created, it goes through an onboarding flow:
- **Personality**: Communication style, tone, motivational approach
- **Heartbeat**: Activity cadence, check-in frequency, response patterns
- **Persona**: Coaching specialization (FHW initially, expandable to any category)

### $CLAWC Token
- **Type**: ERC-20 on Base
- **Earn**: Move-to-earn rewards from tracked workouts and class attendance
- **Stake**: Stake $CLAWC for enhanced coaching features, community access
- **Purpose**: Platform staking, governance, and incentive alignment between agent and human

### Communication Channels
- **XMTP** — Decentralized messaging (primary)
- **Telegram** — Traditional messaging fallback
- **Platform of choice** — Extensible to other channels

### Expansion Model
ClawCoach starts with fitness, health, and wellness (FHW) but is architected to expand into any coaching category: career, finance, education, mental health, etc. Each category is a persona layer on top of the core agent framework.

### Community Hub
clawcoach.ai is where ClawCoach agents gather to interact, discuss, and implement agent ideas — a community of AI agents and their humans.

---

## Database Tables

> Supabase project `clawcoach` (ref `agvdivapnrqpstvhkbmk`, East US/Ohio). RLS enabled on all tables.

Implemented tables:
- `users` — User profiles, wallet addresses (upserted on wallet connect)
- `agents` — ClawCoach agent instances (synced from on-chain ERC-8004)
- `messages` — Agent-human conversation history
- `workouts` — Tracked workout data (API route ready, needs wearable integration)
- `coaching_sessions` — Structured coaching session records
- `subscriptions` — User subscription records

Planned tables:
- `agent_personas` — Personality, heartbeat, persona config per agent
- `wearable_connections` — Strava, Apple Health, Garmin links
- `clawc_rewards` — $CLAWC earning history
- `clawc_stakes` — $CLAWC staking positions
- `telegram_links` — Telegram chat-to-wallet mappings

---

## Before You Start Any Task

1. Read this file (automatic)
2. Check `SESSION_HANDOFF.md` for context from last session
3. Check `tasks/CURRENT_SPRINT.md` for current priorities
4. Check `CURRENT_ISSUES.md` for known blockers

| Task Type | Read First |
|-----------|------------|
| Feature work | `docs/PRD.md` |
| Smart contracts | `docs/CONTRACTS.md` |
| Revenue / fees | `docs/revenue_model.md`, `docs/revenue_integration.md` |
| Database changes | Supabase dashboard |
| System design | `docs/ARCHITECTURE.md` |
| Web3 commands | `docs/WEB3_COMMANDS.md` |
| ERC-8004 work | https://eips.ethereum.org/EIPS/eip-8004 |

---

## Related Documents

| Document | Path |
|----------|------|
| Product Requirements | `docs/PRD.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Smart Contracts | `docs/CONTRACTS.md` |
| Tokenomics | `docs/TOKENOMICS.md` |
| Revenue Model | `docs/revenue_model.md` |
| Revenue Integration | `docs/revenue_integration.md` |
| Coaching Skill | `docs/FITNESS_COACHING_SKILL.md` |
| Web3 Commands | `docs/WEB3_COMMANDS.md` |
| Maintenance | `docs/MAINTENANCE.md` |
| Session Handoff | `SESSION_HANDOFF.md` |
| Current Issues | `CURRENT_ISSUES.md` |
| Current Sprint | `tasks/CURRENT_SPRINT.md` |

---

*Last updated: Feb 12, 2026*
