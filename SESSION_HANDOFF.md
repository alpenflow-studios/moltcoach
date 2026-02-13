# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-13
- **Duration**: Session 34
- **Branch**: `main`
- **Model**: Claude Opus 4.6
- **Commits**: NOT YET COMMITTED (all changes staged, awaiting Michael's approval)

---

## What Was Done

### Session 34

1. **TASK-019: Conversational Onboarding + Agent Memory — CODE COMPLETE**
   - Built the full onboarding + memory system (Big Four #1 + #2)
   - 6 new files, 7 modified files, all typecheck + build passing
   - **Awaiting**: Michael to run 3 SQL scripts in Supabase + commit + deploy

   **New files created:**
   - `docs/sql/agent_onboarding.sql` — ALTER agents ADD onboarding_complete
   - `docs/sql/agent_personas.sql` — persona table (8 fields, UNIQUE FK to agents)
   - `docs/sql/agent_memory_notes.sql` — memory notes table (content + category, max 50)
   - `src/lib/personaExtractor.ts` — Haiku extracts persona from onboarding conversation
   - `src/lib/memoryExtractor.ts` — Haiku extracts 0-3 memory notes per exchange
   - `src/app/api/chat/extract/route.ts` — extraction endpoint (persona upsert + memory insert with 50-note cap)

   **Modified files:**
   - `src/types/database.ts` — `onboarding_complete` on agents + 2 new table types
   - `src/lib/systemPrompt.ts` — `buildOnboardingPrompt()`, `buildPersonaAwarePrompt()`, `resolveSystemPrompt()` (async, shared by both chat routes)
   - `src/app/api/chat/route.ts` — accepts `agentDbId`, uses `resolveSystemPrompt`
   - `src/app/api/chat/paid/route.ts` — same changes
   - `src/hooks/useChat.ts` — passes `agentDbId` to API
   - `src/components/agent/AgentPageContent.tsx` — captures `agentDbId` + `onboardingComplete` from agent sync response
   - `src/components/agent/AgentChat.tsx` — onboarding greeting, extraction trigger in `handleMessageComplete`, toast on completion

   **Dependencies added:**
   - `zod` (runtime validation for extraction schemas)

   **Architecture:**
   ```
   User sends message
     → POST /api/chat (with agentDbId)
     → resolveSystemPrompt() checks onboarding_complete in Supabase
       ├─ NOT onboarded → buildOnboardingPrompt (interview mode)
       └─ Onboarded → buildPersonaAwarePrompt (persona + memory notes injected)
     → Claude streams response
     → onMessageComplete fires:
       ├─ POST /api/messages (save to Supabase)
       ├─ XMTP mirror (if connected)
       └─ POST /api/chat/extract (async, Haiku)
           ├─ Onboarding mode → extract persona, upsert agent_personas, flip onboarding_complete
           └─ Memory mode → extract 0-3 notes, prune if >50, insert agent_memory_notes
   ```

### Session 33 (recap)

1. Fixed XMTP Production Spinner — `02c9c5d`
2. Brand Guide — `1d59d74`
3. Agent Runtime Architecture Spec — `16c3b8f`
4. Handoff docs — `b6924b3`

---

## What's In Progress

1. **TASK-019 SQL scripts** — Michael needs to run 3 scripts in Supabase SQL Editor (order: agent_onboarding → agent_personas → agent_memory_notes)
2. **TASK-019 commit + deploy** — Code complete, needs commit + push + Vercel deploy
3. **XMTP production verification** — Carried from S33, Michael needs to verify
4. **Agent registration** — 0 agents on new contracts, Michael needs to register one
5. **Privy flow testing (TASK-017)** — Farcaster, email, mobile, Google OAuth untested

---

## What's Next (Priority Order) — THE BIG FOUR

### 1. Conversational Onboarding — CODE COMPLETE (S34)
### 2. Agent Memory — CODE COMPLETE (S34, same implementation)

### 3. Proactive Telegram Nudges
Agent reaches out to YOU instead of waiting:
- Trigger.dev cron job checks each agent's last activity
- No workout in 3 days → send nudge via Telegram
- Hit a milestone → send congratulations
- Usual workout time → send reminder

### 4. Agent Hub as Social Feed
`/hub` becomes a live feed of agent activity:
- "Coach Alpha earned 50 CLAWC (coached @michael through leg day)"
- Agents have profiles, stats, reputation
- Agent-to-agent XMTP messaging + $CLAWC payments

**Also planned:**
- Make Telegram bot persona-aware (currently uses generic `buildSystemPrompt`)

---

## Vercel Deployment Details

| Field | Value |
|-------|-------|
| Team | `classcoin` |
| Project | `moltcoach` |
| Framework | Next.js (auto-detected) |
| Production URL | `https://clawcoach.ai` |
| Vercel URL | `https://moltcoach.vercel.app` |
| GitHub | Connected to `alpenflow-studios/moltcoach` |
| Password | Basic Auth via proxy (`beta` / `democlawcoachbeta`) |
| Node | 24.x (Vercel default) |
| Builder | **webpack** (S33 fix — was Turbopack, broke XMTP WASM) |

### Env Vars on Vercel (17 total)

| Variable | Env | Sensitive |
|----------|-----|-----------|
| NEXT_PUBLIC_PRIVY_APP_ID | production | no |
| NEXT_PUBLIC_CHAIN_ID | production | no |
| NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS | production | no |
| NEXT_PUBLIC_CLAWC_TOKEN_ADDRESS | production | no |
| NEXT_PUBLIC_CLAWC_STAKING_ADDRESS | production | no |
| NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS | production | no |
| NEXT_PUBLIC_SUPABASE_URL | production | no |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | production | no |
| NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID | production | no |
| NEXT_PUBLIC_CLAWCOACH_AGENT_XMTP_ADDRESS | production | no |
| SUPABASE_SERVICE_ROLE_KEY | production | yes |
| ANTHROPIC_API_KEY | production | yes |
| UPSTASH_REDIS_REST_URL | production | no |
| UPSTASH_REDIS_REST_TOKEN | production | yes |
| STAGING_USERNAME | production | yes |
| STAGING_PASSWORD | production | yes |
| TELEGRAM_BOT_TOKEN | production | yes |

**NOT on Vercel**: PRIVATE_KEY, BASESCAN_KEY (deploy-only, never on hosted infra)

---

## Supabase Architecture (Implemented)

### How It Works
```
User connects wallet
  → useUserSync fires → POST /api/users → upserts user in Supabase

User visits /agent with existing agent
  → AgentPageContent effect → POST /api/agents/sync → upserts agent in Supabase
  → Response includes agentDbId + onboarding_complete (captured in state)
  → useChatHistory → GET /api/messages → loads prior chat history
  → useChat seeds with Supabase history (priority) or XMTP history (fallback)

User sends message
  → POST /api/chat (with agentDbId) → resolveSystemPrompt checks onboarding status
    ├─ NOT onboarded → buildOnboardingPrompt (interview mode, ~5-8 questions)
    └─ Onboarded → buildPersonaAwarePrompt (persona + memory injected)
  → Claude streams response (free tier)
  → If free tier exceeded → 402 with paidEndpoint info
  → POST /api/chat/paid → x402 payment + Claude response (paid tier)
  → onMessageComplete fires:
    ├─ POST /api/messages → saves user + assistant messages to Supabase
    ├─ XMTP mirror (if connected) → writes to XMTP DM
    └─ POST /api/chat/extract → Haiku extracts persona (onboarding) or memory notes (normal)
        ├─ Onboarding: upsert agent_personas, flip onboarding_complete when ready
        └─ Memory: insert notes (max 50, oldest pruned)

Telegram wallet linking (verified S33)
  → User clicks "Generate Link Code" on agent page
  → POST /api/telegram/link → generates 6-char code in Redis (10-min TTL)
  → User sends /connect <CODE> to @ClawCoachBot
  → Bot verifies code → upserts telegram_links in Supabase
```

### Supabase Project Details
| Field | Value |
|-------|-------|
| Project name | `clawcoach` |
| Reference ID | `agvdivapnrqpstvhkbmk` |
| Region | East US (Ohio) |
| URL | `https://agvdivapnrqpstvhkbmk.supabase.co` |
| Tables | users, agents, messages, workouts, coaching_sessions, subscriptions, telegram_links |
| Pending (S34) | agent_personas, agent_memory_notes (Michael: run SQL scripts) |
| New column (S34) | agents.onboarding_complete (Michael: run SQL script) |
| RLS | Enabled on all tables, SELECT-only for anon key |

---

## Decisions Made

- **Zod for extraction validation**: Installed `zod` for persona + memory extraction schemas. First Zod usage in project (global CLAUDE.md mandates it). (Session 34)
- **resolveSystemPrompt is async + shared**: Single async function in `systemPrompt.ts` handles all prompt resolution for both chat routes. Does Supabase queries to check onboarding status, fetch persona, fetch memory. (Session 34)
- **agentDbId threading**: Supabase UUID flows AgentPageContent → AgentChat → useChat → /api/chat → resolveSystemPrompt. Optional everywhere for backward compat (Telegram still uses generic prompt). (Session 34)
- **Onboarding completion threshold**: Haiku sets `onboarding_complete: true` when at least fitness_level + goals + schedule are filled. (Session 34)
- **Memory note categories**: general, preference, achievement, health, schedule. Enforced in Zod schema, stored as TEXT in DB. (Session 34)
- **Extraction model**: `claude-haiku-4-5-20251001` for both persona and memory extraction. ~$0.001/call. (Session 34)
- **Production build uses webpack**: `next build --webpack` — Turbopack can't handle XMTP WASM. (Session 33)
- **Brand colors**: Primary `#7CCF00`, Background `#09090B`, Card `#18181B`. Full guide at `docs/BRAND.md`. (Session 33)
- **Agent runtime architecture**: Claude Agent SDK + Coinbase AgentKit via MCP. Spec at `docs/AGENT_RUNTIME.md`. (Session 33)
- **Env var `.trim()` pattern**: All contract address env vars trimmed in `contracts.ts`. (Session 32)
- **Chain guard pattern**: `AgentPageContent` checks `useChainId()` against `baseSepolia.id`. (Session 32)
- **Telegram wallet linking**: One-time codes via Redis, `/connect` command in bot, `telegram_links` table. (Session 32)
- **Privy replaces wagmi-only auth**: `@privy-io/react-auth@3.13.1` + `@privy-io/wagmi@4.0.1`. (Session 28)
- **Dev bundler**: webpack (not Turbopack) for XMTP WASM compat. (Session 16)
- **Theme**: Dark mode, lime primary on zinc
- **Brand**: ClawCoach (clawcoach.ai)

---

## State of Tests

- `forge build`: **PASSES** (exit 0, lint notes only)
- `forge test`: **PASSES** (216 tests, 0 failures)
- `pnpm typecheck`: **PASSES** (Session 34)
- `pnpm build`: **PASSES** (21 routes, `--webpack`, Session 34) — includes new `/api/chat/extract`

---

## On-Chain State (Base Sepolia) — $CLAWC Contracts (Phase 7 deploy)

| Contract | Address |
|----------|---------|
| ClawcToken ($CLAWC) | `0x275534e19e025058d02a7837350ffaD6Ba136b7c` |
| ProtocolFeeCollector | `0x9233CC1Ab2ca19F7a240AD9238cBcf59516Def55` |
| ClawcStaking | `0x6B2D2f674373466F0C490E26a1DE00FF7F63BFad` |
| ClawcoachIdentity (ERC-8004) | `0xB95fab07C7750C50583eDe6CE751cc753811116c` |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **CLAWC supply**: 10,000 CLAWC
- **Staked**: 9,500 CLAWC | **Wallet**: ~475 CLAWC | **FeeCollector**: ~25 CLAWC
- **Agents**: 0 (no agent registered on new contracts yet — Michael needs to register)

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/`
- **pnpm**: v10.29.1 | **Next.js**: 16.1.6 | **Node**: v25.6.0
- **Vercel CLI**: v50.13.2
- **Project**: `~/Projects/moltcoach`
- **Dev server**: `pnpm dev` uses `--webpack` (not Turbopack) for XMTP WASM compatibility
- **Production build**: `pnpm build` uses `--webpack` (S33 fix)
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project), PRIVATE_KEY, BASESCAN_KEY, TELEGRAM_BOT_TOKEN
- **NOT configured**: Coinbase Wallet project ID, CDP API keys (needed for AgentKit Phase 2)
- **Deps**: `@privy-io/react-auth` ^3.13.1, `@privy-io/wagmi` ^4.0.1, `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1, `grammy` ^1.40.0, `zod` (new S34)
- **Telegram bot**: `@ClawCoachBot`, webhook at `clawcoach.ai/api/telegram`, proxy bypass in `src/proxy.ts`
- **Redis keys**: `x402:free:<addr>` (free tier counter), `telegram:history:<chatId>` (conversation history), `telegram:linkcode:<CODE>` (wallet link codes, 10-min TTL)

---

## Key Files for Next Session

| File | Purpose |
|------|---------|
| `src/lib/systemPrompt.ts` | All prompt logic: generic, onboarding, persona-aware, resolveSystemPrompt |
| `src/lib/personaExtractor.ts` | Haiku persona extraction with Zod validation |
| `src/lib/memoryExtractor.ts` | Haiku memory note extraction with Zod validation |
| `src/app/api/chat/extract/route.ts` | Extraction endpoint: orchestrates persona upsert + memory insert |
| `src/components/agent/AgentChat.tsx` | Frontend: extraction trigger, onboarding state, greeting logic |
| `src/components/agent/AgentPageContent.tsx` | Captures agentDbId + onboardingComplete from sync response |

---

*Last updated: Feb 13, 2026 — Session 34*
