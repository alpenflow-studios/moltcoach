# CLAUDE.md — moltcoach Project Context

> **Project**: moltcoach
> **Extends**: `~/.claude/CLAUDE.md` (global rules apply)

---

## Project Identity

- **Name**: moltcoach
- **One-liner**: AI coaching agent with on-chain identity and Coinbase Smart Wallet
- **Repo**: github.com/alpenflow-studios/moltcoach
- **Live**: https://moltcoach.xyz

---

## Quick Links

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/alpenflow-studios/moltcoach |
| ERC-8004 Spec | https://eips.ethereum.org/EIPS/eip-8004 |
| Base Sepolia Explorer | https://sepolia.basescan.org |
| Supabase Dashboard | TBD |
| Vercel Dashboard | TBD |

---

## Smart Contracts

| Contract | Address | Network |
|----------|---------|---------|
| MoltcoachIdentity (ERC-8004) | TBD | Base Sepolia (84532) |
| $FIT Token | TBD | Base Sepolia (84532) |
| FIT Staking | TBD | Base Sepolia (84532) |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia (84532) |

**Admin Wallet**: TBD

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Chain / Contracts
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_MOLTCOACH_IDENTITY_ADDRESS=
NEXT_PUBLIC_FIT_TOKEN_ADDRESS=
NEXT_PUBLIC_FIT_STAKING_ADDRESS=

# Coinbase
NEXT_PUBLIC_COINBASE_WALLET_PROJECT_ID=

# AI
ANTHROPIC_API_KEY=
```

---

## Tech Stack (moltcoach-Specific)

> Overrides/extends global defaults where noted.

| Layer | Technology |
|-------|-----------|
| Auth | Coinbase Smart Wallet (primary) |
| Agent Framework | Claude Agent SDK (coaching agent runtime) |
| Agent Identity | ERC-8004 (Trustless Agents) on Base |
| Agent Comms | XMTP, Telegram |
| Token | $FIT (ERC-20, move-to-earn rewards) |
| Staking | $FIT staking contract |
| Wearables | Strava, Apple Health, Garmin integrations |
| Database | Supabase (project ID: TBD) |
| Chain | Base Sepolia (84532) for dev, Base mainnet (8453) for prod |

---

## Domain Concepts

### What is moltcoach?
A **moltcoach** is an AI coaching agent that lives on-chain via ERC-8004. Each user gets their own moltcoach agent when they verify and connect a Coinbase Smart Wallet. The agent has a persistent identity, personality, and reputation.

### Agent Lifecycle
```
USER CONNECTS WALLET → VERIFICATION → AGENT CREATION (ERC-8004)
    → ONBOARDING (personality, heartbeat, persona via questions + metrics)
    → ACTIVE COACHING (workouts, tracking, motivation)
    → REWARDS ($FIT earned via move-to-earn)
    → STAKING ($FIT staked for benefits)
```

### ERC-8004 Integration
moltcoach uses all three ERC-8004 registries:
1. **Identity Registry** — Each moltcoach agent gets an on-chain identity (ERC-721 based) with an `agentURI` resolving to their registration file (personality, capabilities, specialization)
2. **Reputation Registry** — Coaching effectiveness tracked on-chain (user outcomes, consistency scores, engagement metrics)
3. **Validation Registry** — Workout verification via wearable data, proof-of-activity checks

### Onboarding — Personality, Heartbeat, Persona
When a new moltcoach is created, it goes through an onboarding flow:
- **Personality**: Communication style, tone, motivational approach
- **Heartbeat**: Activity cadence, check-in frequency, response patterns
- **Persona**: Coaching specialization (FHW initially, expandable to any category)

### $FIT Token
- **Type**: ERC-20 on Base
- **Earn**: Move-to-earn rewards from tracked workouts and class attendance
- **Stake**: Stake $FIT for enhanced coaching features, community access
- **Purpose**: Incentive alignment between agent and human

### Communication Channels
- **XMTP** — Decentralized messaging (primary)
- **Telegram** — Traditional messaging fallback
- **Platform of choice** — Extensible to other channels

### Expansion Model
moltcoach starts with fitness, health, and wellness (FHW) but is architected to expand into any coaching category: career, finance, education, mental health, etc. Each category is a persona layer on top of the core agent framework.

### Community Hub
moltcoach.xyz is where moltcoach agents gather to interact, discuss, and implement agent ideas — a community of AI agents and their humans.

---

## Database Tables

> To be created in Supabase.

Core tables (planned):
- `users` — User profiles, wallet addresses
- `agents` — Moltcoach agent instances (linked to ERC-8004 identity)
- `agent_personas` — Personality, heartbeat, persona config per agent
- `workouts` — Tracked workout data
- `wearable_connections` — Strava, Apple Health, Garmin links
- `fit_rewards` — $FIT earning history
- `fit_stakes` — $FIT staking positions
- `messages` — Agent-human conversation history
- `coaching_sessions` — Structured coaching session records

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
| Web3 Commands | `docs/WEB3_COMMANDS.md` |
| Maintenance | `docs/MAINTENANCE.md` |
| Session Handoff | `SESSION_HANDOFF.md` |
| Current Issues | `CURRENT_ISSUES.md` |
| Current Sprint | `tasks/CURRENT_SPRINT.md` |

---

*Last updated: Feb 7, 2026*
