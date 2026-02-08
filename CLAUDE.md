# CLAUDE.md — MoltCoach Project Context

> **Project**: moltcoach.xyz
> **Extends**: `~/.claude/CLAUDE.md` (global rules apply)

---

## Project Identity

- **Name**: MoltCoach
- **One-liner**: Autonomous AI fitness coaches with wallets, reputation, and move-to-earn rewards
- **Repo**: github.com/alpenflow-studios/moltcoach
- **Live**: https://moltcoach.xyz

---

## Quick Links

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/[PROJECT_ID] |
| Supabase SQL Editor | https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new |
| Vercel Dashboard | https://vercel.com/[team]/moltcoach |
| GitHub Repo | https://github.com/alpenflow-studios/moltcoach |
| Base Sepolia Explorer | https://sepolia.basescan.org |
| ERC-8004 Spec | https://eips.ethereum.org/EIPS/eip-8004 |
| Claude Agent SDK Docs | https://platform.claude.com/docs/en/agent-sdk/overview |
| 8004.org | https://8004.org |

---

## Smart Contracts

| Contract | Address | Network |
|----------|---------|---------|
| MoltCoachRegistry | `TBD` | Base Sepolia (84532) |
| WorkoutValidator | `TBD` | Base Sepolia (84532) |
| FITToken | `TBD` | Base Sepolia (84532) |
| RewardDistributor | `TBD` | Base Sepolia (84532) |
| StakingVault | `TBD` | Base Sepolia (84532) |
| MoltCoachWalletPolicy | `TBD` | Base Sepolia (84532) |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia (84532) |

**ERC-8004 Registries** (singletons on Base — we do NOT deploy these):

| Registry | Address | Network |
|----------|---------|---------|
| Identity Registry | `TBD — check 8004.org` | Base (8453) |
| Reputation Registry | `TBD — check 8004.org` | Base (8453) |
| Validation Registry | `TBD — check 8004.org` | Base (8453) |

**Admin Wallet**: `TBD`

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Chain / Contracts
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_MOLTCOACH_REGISTRY_ADDRESS=
NEXT_PUBLIC_FIT_TOKEN_ADDRESS=
NEXT_PUBLIC_STAKING_VAULT_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# ERC-8004 Registries
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=
NEXT_PUBLIC_VALIDATION_REGISTRY_ADDRESS=

# Auth
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# Agent
ANTHROPIC_API_KEY=

# Messaging
XMTP_ENV=production
TELEGRAM_BOT_TOKEN=
```

---

## Tech Stack (MoltCoach-Specific)

> Overrides/extends global defaults where noted.

| Layer | Technology |
|-------|------------|
| Agent Runtime | Claude Agent SDK (Python + TypeScript) |
| Trust Layer | ERC-8004 (Identity, Reputation, Validation Registries) |
| Wallet | Coinbase Smart Wallet SDK (2-of-2 multisig) |
| Token | $FIT (ERC-20 on Base) |
| Messaging | XMTP (primary), Telegram Bot API (secondary), Web chat (tertiary) |
| Frontend | Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Web3 | wagmi v2, viem, WalletConnect |
| Contracts | Solidity ^0.8.20, Foundry, OpenZeppelin 5.x |
| Database | Supabase (Postgres + RLS) |
| Health Data | Direct wearable APIs (Strava, Garmin, Whoop, Oura) + image upload + manual entry |
| Hosting | Vercel |

---

## Domain Concepts

### What is MoltCoach?
A decentralized autonomous AI coaching platform. Each user spawns a personalized coaching agent that is an on-chain entity (ERC-8004 NFT) with its own wallet, reputation, and earnings capability.

### Agent Relationship Modes
| Mode | Personality | Use Case |
|------|-------------|----------|
| **Coach** | Structured, accountable, pushes you | "I need discipline and a plan" |
| **Friend** | Encouraging, casual, celebrates wins | "I need someone in my corner" |
| **Mentor** | Wise, strategic, long-view thinking | "I need guidance, not just a plan" |

### Agent Lifecycle
```
SPAWN → BONDING (7 days) → ACTIVE → [EVOLVE | RESET | ARCHIVE]
```

- **Evolve**: Change mode (Coach↔Friend↔Mentor). History preserved.
- **Soft Reset**: Clear history + personality. Keep wallet, NFT, reputation.
- **Hard Reset**: Archive old agent, spawn new one. Old reputation frozen.
- **Archive**: Dormant. No rewards. Can reactivate.

### Health Data Tracks
| Track | Method | Confidence |
|-------|--------|------------|
| A: Device Sync | Direct wearable APIs (OAuth) | 70-90% |
| B: Image Upload | Photo of health screen → vision parsing | 50-70% |
| C: Manual Entry | Chat-based logging | 20-40% |

**Design principle**: Anyone with a phone can use MoltCoach. No API, no wearable, no wallet required to start.

### Validation Trust Tiers
| Tier | Source | Reward Multiplier |
|------|--------|-------------------|
| 1 | Wearable API | 1.0x |
| 2 | Image Upload | 0.85x |
| 3 | Manual + Proof | 0.7x |
| 4 | Manual Only | 0.5x (max 3/week) |

### $FIT Token
- Earned via validated workouts
- Stake for premium features (Basic/Pro/Elite tiers)
- Required for agent spawning (anti-Sybil)
- 1B max supply, 100K daily emission cap
- Streak bonuses: 7-day (1.5x), 30-day (2.0x), 90-day (2.5x)

### Smart Wallet Security
- 2-of-2 multisig (agent + user)
- $10/day auto-approve limit
- 24h timelock for large withdrawals
- Allowlist-only destinations
- User can revoke agent signer anytime

---

## Database Tables

Core tables in Supabase:

| Table | Purpose |
|-------|---------|
| `users` | Wallet address, agent ID, smart wallet, preferred channel |
| `agents` | ERC-8004 token ID, owner, personality config, registration URI |
| `workouts` | Type, details, duration, data source, validation status, reward |
| `conversations` | Channel, messages (JSONB), agent ID |
| `rewards` | Workout ID, amount, tx hash, status |

**RLS requirement**: All policies use `current_setting('app.wallet_address')`. The API layer MUST call `set_config('app.wallet_address', ...)` on every request.

---

## Claude Agent SDK — Key References

```python
# Two usage patterns:

# 1. Simple (one-shot queries)
from claude_agent_sdk import query, ClaudeAgentOptions
async for message in query(prompt="...", options=ClaudeAgentOptions(...)):
    ...

# 2. Interactive (bidirectional, multi-turn — for coaching sessions)
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
client = ClaudeSDKClient(options=ClaudeAgentOptions(
    system_prompt=MOLTCOACH_SYSTEM_PROMPT,
    allowed_tools=["Read", "Write", "Bash", "WebSearch"],
    permission_mode='acceptEdits',
    cwd="/app/moltcoach"
))
# Supports custom MCP tools, hooks, skills, subagents
```

**Custom MCP Tools** (to build):
- `wearable_fetch` — OAuth queries to Strava/Garmin/Whoop/Oura
- `reward_trigger` — Submit validation request to ERC-8004
- `wallet_ops` — Smart wallet balance, transfers, staking
- `erc8004_registry` — Read/write to Identity/Reputation/Validation registries
- `health_query` — Image-based health data extraction (vision)

**Skills** (`.claude/skills/`):
- `fitness-coaching/SKILL.md` — Workout programming, periodization
- `nutrition-guidance/SKILL.md` — Meal planning, macros
- `motivation-support/SKILL.md` — Accountability, habit formation
- `workout-tracking/SKILL.md` — Log workouts, sync data
- `reward-management/SKILL.md` — $FIT staking, claiming

---

## Before You Start Any Task

1. Read this file (automatic)
2. Check `SESSION_HANDOFF.md` for context from last session
3. Check `NEXT_STEPS.md` or `tasks/CURRENT_SPRINT.md` for current priorities
4. Check `CURRENT_ISSUES.md` for known blockers

| Task Type | Read First |
|-----------|------------|
| Feature work | `docs/PRD.md` |
| Smart contracts | `docs/CONTRACTS.md` |
| Database changes | Supabase dashboard (link above) |
| System design | `docs/ARCHITECTURE.md` |
| Web3 commands | `docs/WEB3_COMMANDS.md` |
| Agent SDK work | [SDK Docs](https://platform.claude.com/docs/en/agent-sdk/overview) |
| ERC-8004 work | [EIP Spec](https://eips.ethereum.org/EIPS/eip-8004) |

---

## Related Documents

| Document | Path | Notes |
|----------|------|-------|
| Product Requirements | `docs/PRD.md` | Features, lifecycle, acceptance criteria |
| Architecture | `docs/ARCHITECTURE.md` | System design, data flow, security layers |
| Smart Contracts | `docs/CONTRACTS.md` | All 6 contracts + ERC-8004 interfaces |
| Session Handoff | `SESSION_HANDOFF.md` | Context for next session |
| Current Issues | `CURRENT_ISSUES.md` | Known bugs and blockers |

---

## Known Issues (Historical)

- **Health Connectors**: Claude's Apple Health / Android Health Connect integrations are consumer-app features only (Jan 2026). NOT available via Agent SDK. MoltCoach uses direct wearable APIs + image upload instead.
- **ERC-8004 Registry Addresses**: Not yet published for Base. Monitor 8004.org for deployment announcements.
- **Claude Agent SDK**: Class names changed from `ClaudeCodeSDK` → `claude_agent_sdk` with `query()` and `ClaudeSDKClient`. Verify against current docs before implementation.

---

*Last updated: February 2026*
