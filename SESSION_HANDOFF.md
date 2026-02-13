# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-12
- **Duration**: Session 33
- **Branch**: `main`
- **Model**: Claude Opus 4.6
- **Commits**: `02c9c5d`, `1d59d74`, `16c3b8f`

---

## What Was Done

### Session 33

1. **Fixed XMTP Production Spinner (P0) — COMPLETE**
   - Root cause: `next build` used Turbopack (Next.js 16 default), but all XMTP WASM config was in the `webpack` block — completely ignored on production
   - Fix: Changed `"build": "next build"` → `"build": "next build --webpack"` in `package.json`
   - Also added `.trim()` to XMTP address env var in `src/config/xmtp.ts` (Vercel whitespace prevention)
   - Also added 30s timeout to `Client.create()` in `src/hooks/useXmtpClient.ts` — fails with error message instead of spinning forever
   - **Committed**: `02c9c5d` (pushed, Vercel deploying)
   - **Status**: Michael needs to verify XMTP connects on production after deploy

2. **Brand Guide — COMPLETE**
   - Created `docs/BRAND.md` with full brand package
   - Primary green: `#7CCF00` (oklch 0.768 0.233 130.85)
   - Background: `#09090B` (zinc-950), Card: `#18181B` (zinc-900)
   - Fonts: Geist (body) + Geist Mono (code) via Google Fonts
   - Design system: shadcn/ui New York, zinc base, lucide-react icons
   - Asset checklist: logo.svg, favicon, og-image (Michael providing agent bot head as logo)
   - **Committed**: `1d59d74`

3. **Agent Runtime Architecture Spec — COMPLETE**
   - Created `docs/AGENT_RUNTIME.md` — full spec for autonomous agent runtime
   - Claude Agent SDK (`@anthropic-ai/claude-agent-sdk` ^0.2.41) = brain (reasoning, tool use, session persistence)
   - Coinbase AgentKit (`@coinbase/agentkit` ^0.10.4) = wallet + on-chain actions (50+ actions, Privy wallet support, Base first-class)
   - Connected via MCP (Model Context Protocol) — AgentKit exposes tools as MCP server, Claude Agent SDK consumes them
   - 4 implementation phases: Runtime MVP → Agent Wallet → Agent Hub → Autonomous Actions
   - Covers: agent wallets, custom MCP tools, human-in-the-loop guardrails, agent-to-agent communication, web browsing (Playwright)
   - **Committed**: `16c3b8f`

4. **Telegram Wallet Linking — VERIFIED WORKING**
   - Michael confirmed Telegram bot is working end-to-end
   - `telegram_links` table was created in Supabase (no longer a blocker)

5. **Onboarding + Agent Memory — DESIGNED (not yet implemented)**
   - Full plan designed for conversational onboarding + persona storage + memory notes
   - See "Next Task" section below for complete implementation plan

### Session 32

1. **Fixed Agent Page Address Error (P0) — COMPLETE**
2. **Chain Guard UX — COMPLETE**
3. **Telegram Wallet Linking (code) — COMPLETE**
4. **Chat History — Expected Fresh Start**

### Session 31

1. **Fixed Telegram Redis on Vercel (P1) — COMPLETE**
2. **Landing Page Updates — COMPLETE**

---

## What's In Progress

1. **XMTP production fix** — Code pushed (`02c9c5d`), awaiting Vercel deploy verification
2. **Privy flow testing (TASK-017)** — Farcaster enabled (untested). Google OAuth needs Google Cloud Console. Email + mobile untested.

---

## What's Next (Priority Order) — THE BIG FOUR

Michael approved building these in order. This is the core product experience:

### 1. Conversational Onboarding ("the birth of your agent")
When a user registers an agent, instead of a blank chat, the agent interviews them:
- "What's your fitness level?" / "What motivates you?" / "How often should I check in?"
- Answers become the agent's persona (stored in Supabase `agent_personas`)
- Every future conversation is shaped by this — agent isn't generic anymore

**Implementation plan (ready to build):**
- New `agent_personas` table (SQL migration at `docs/sql/agent_personas.sql`)
- New `agent_memory_notes` table (SQL migration at `docs/sql/agent_memory_notes.sql`)
- Add `onboarding_complete` boolean to `agents` table
- New `buildOnboardingPrompt()` in `src/lib/systemPrompt.ts`
- `/api/chat` checks onboarding status → uses onboarding or persona-aware prompt
- New `/api/chat/extract` endpoint — Haiku extracts persona from conversation (async, after each message)
- When Haiku says `onboarding_complete: true` → save persona, switch to normal mode
- Frontend: AgentChat triggers extraction in `handleMessageComplete`, passes agentDbId + onboardingComplete
- Cost: ~$0.001 per extraction call (Haiku), negligible

### 2. Agent Memory (Session Persistence)
Replace stateless chat with persistent context:
- Agent remembers fitness goals, workout history, personal details
- Memory notes extracted after each conversation (Haiku, async)
- Stored in `agent_memory_notes` table, injected into system prompt
- Cap: 50 notes per agent, oldest pruned
- "How was that 5K you mentioned Tuesday?" — this is what makes it a coach, not a chatbot

### 3. Proactive Telegram Nudges
Agent reaches out to YOU instead of waiting:
- Trigger.dev cron job checks each agent's last activity
- No workout in 3 days → send nudge via Telegram
- Hit a milestone → send congratulations
- Usual workout time → send reminder

### 4. Agent Hub as Social Feed
`/hub` becomes a live feed of agent activity:
- "Coach Alpha earned 50 CLAWC (coached @michael through leg day)"
- "Coach Bravo registered on ClawCoach (specializes in marathon training)"
- Agents have profiles, stats, reputation
- Agent-to-agent XMTP messaging + $CLAWC payments

**All four serve one idea: the agent is a character, not a feature.**

---

## Key Files for Next Session (Onboarding Implementation)

| File | Action | Purpose |
|------|--------|---------|
| `docs/sql/agent_personas.sql` | CREATE | New table: persona data per agent |
| `docs/sql/agent_memory_notes.sql` | CREATE | New table: memory notes per agent |
| `docs/sql/agent_onboarding.sql` | CREATE | ALTER agents ADD onboarding_complete |
| `src/types/database.ts` | MODIFY | Add agent_personas + agent_memory_notes types |
| `src/lib/systemPrompt.ts` | MODIFY | Add onboarding prompt + persona-aware prompt |
| `src/lib/personaExtractor.ts` | CREATE | Haiku extraction function + Zod validation |
| `src/lib/memoryExtractor.ts` | CREATE | Memory note extraction function |
| `src/app/api/chat/route.ts` | MODIFY | Accept agentId, fetch persona, build enriched prompt |
| `src/app/api/chat/extract/route.ts` | CREATE | Extraction endpoint (onboarding + memory) |
| `src/app/api/chat/paid/route.ts` | MODIFY | Same changes as free route |
| `src/hooks/useChat.ts` | MODIFY | Add agentId to options + API call |
| `src/components/agent/AgentChat.tsx` | MODIFY | New props, extraction trigger |
| `src/components/agent/AgentPageContent.tsx` | MODIFY | Capture agentDbId + onboardingComplete |
| `src/app/api/agents/sync/route.ts` | MODIFY | Return onboarding_complete in response |

**Extraction approach**: After each assistant response, client fires `POST /api/chat/extract` (fire-and-forget). Haiku extracts persona fields (onboarding) or memory notes (normal chat). When onboarding_complete → switch to persona-aware coaching mode.

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

**FIXED S33**: Build now uses `--webpack` (was Turbopack, broke XMTP WASM on production).
**FIXED S33**: XMTP address env var now `.trim()`'d.
**FIXED S32**: Contract address env vars `.trim()`'d.
**FIXED S31**: Upstash env vars cleaned via `printf`.

---

## Supabase Architecture (Implemented)

### How It Works
```
User connects wallet
  → useUserSync fires → POST /api/users → upserts user in Supabase

User visits /agent with existing agent
  → AgentPageContent effect → POST /api/agents/sync → upserts agent in Supabase
  → useChatHistory → GET /api/messages → loads prior chat history
  → useChat seeds with Supabase history (priority) or XMTP history (fallback)

User sends message
  → POST /api/chat → Claude streams response (free tier)
  → If free tier exceeded → 402 with paidEndpoint info
  → POST /api/chat/paid → x402 payment + Claude response (paid tier)
  → onMessageComplete fires:
    ├─ POST /api/messages → saves user + assistant messages to Supabase
    └─ XMTP mirror (if connected) → writes to XMTP DM

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
| Pending | agent_personas, agent_memory_notes (create in S34) |
| RLS | Enabled on all tables, SELECT-only for anon key |

---

## Decisions Made

- **Production build uses webpack**: `next build --webpack` — Turbopack can't handle XMTP WASM. Dev already used `--webpack`. (Session 33)
- **XMTP connection timeout**: 30s timeout via `Promise.race()` on `Client.create()`. Fails with error message instead of infinite spinner. (Session 33)
- **XMTP address `.trim()`**: Added to `src/config/xmtp.ts` for Vercel whitespace safety. (Session 33)
- **Brand colors**: Primary `#7CCF00`, Background `#09090B`, Card `#18181B`. Full guide at `docs/BRAND.md`. (Session 33)
- **Agent runtime architecture**: Claude Agent SDK + Coinbase AgentKit via MCP. Spec at `docs/AGENT_RUNTIME.md`. (Session 33)
- **Onboarding extraction via Haiku**: Async extraction call after each message (not markers in response, not message counting). Cheap (~$0.001/call), reliable, decoupled from streaming. (Session 33, designed)
- **Agent memory as notes table**: Flat `agent_memory_notes` rows, not JSONB. Max 50 per agent. Oldest pruned. (Session 33, designed)
- **Env var `.trim()` pattern**: All contract address env vars trimmed in `contracts.ts`. Permanent fix for recurring Vercel whitespace issue. (Session 32)
- **Chain guard pattern**: `AgentPageContent` checks `useChainId()` against `baseSepolia.id`, shows "Switch to Base Sepolia" button via `useSwitchChain()`. (Session 32)
- **Contract error parser**: `src/lib/contractErrors.ts` maps viem errors to user-friendly strings. (Session 32)
- **Telegram wallet linking**: One-time codes via Redis, `/connect` command in bot, `telegram_links` table. (Session 32)
- **Loading skeleton pattern**: WalletProvider mount guard shows navbar/content/footer skeleton. (Session 30)
- **🦞 branding standard**: All visible ClawCoach references use `🦞 Claw<span class="text-primary">Coach</span>`. (Session 30)
- **Base pill (brand-compliant)**: Filled `#0000FF` background, white text, 5% radius. (Session 31)
- **MetaMask SDK stub pattern**: `@react-native-async-storage/async-storage` aliased to empty. (Session 29)
- **Vercel env var hygiene**: Always use `printf` (not `echo`). (Session 29)
- **Privy replaces wagmi-only auth**: `@privy-io/react-auth@3.13.1` + `@privy-io/wagmi@4.0.1`. (Session 28)
- **Privy App ID**: `cmlj0izut00hg0cjrd7rrm80b` (Session 28)
- **Pricing simplified to 3 tiers**: Free/Pro/Elite. (Session 27)
- **Telegram history in Redis**: 20 msg cap, 7-day TTL. (Session 27)
- **Dev bundler**: webpack (not Turbopack) for XMTP WASM compat. (Session 16)
- **Theme**: Dark mode, lime primary on zinc
- **Brand**: ClawCoach (clawcoach.ai)

---

## State of Tests

- `forge build`: **PASSES** (exit 0, lint notes only)
- `forge test`: **PASSES** (216 tests, 0 failures)
- `pnpm typecheck`: **PASSES** (Session 33)
- `pnpm build`: **PASSES** (20 routes, `--webpack`, Session 33) — Vercel deploy succeeds

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
- **Production build**: `pnpm build` now uses `--webpack` (S33 fix)
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project), PRIVATE_KEY, BASESCAN_KEY, TELEGRAM_BOT_TOKEN
- **NOT configured**: Coinbase Wallet project ID, CDP API keys (needed for AgentKit Phase 2)
- **Deps**: `@privy-io/react-auth` ^3.13.1, `@privy-io/wagmi` ^4.0.1, `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1, `grammy` ^1.40.0
- **Telegram bot**: `@ClawCoachBot`, webhook at `clawcoach.ai/api/telegram`, proxy bypass in `src/proxy.ts`
- **Redis keys**: `x402:free:<addr>` (free tier counter), `telegram:history:<chatId>` (conversation history), `telegram:linkcode:<CODE>` (wallet link codes, 10-min TTL)

---

## New Documents Created This Session

| Document | Path | Purpose |
|----------|------|---------|
| Brand Guide | `docs/BRAND.md` | Colors (`#7CCF00`), fonts (Geist), design system, asset checklist |
| Agent Runtime Spec | `docs/AGENT_RUNTIME.md` | Claude Agent SDK + Coinbase AgentKit architecture, 4 implementation phases |

---

*Last updated: Feb 12, 2026 — Session 33*
