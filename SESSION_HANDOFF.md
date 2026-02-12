# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-12
- **Duration**: Session 26
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 26

1. **Fixed Mobile Wallet Connect (P0) — COMPLETE**
   - Replaced Radix `DropdownMenu` with plain `<button>` elements on touch devices
   - Added `useIsTouchDevice()` hook using `matchMedia("(pointer: coarse)")`
   - On mobile: renders togglable button list that calls `connect({ connector })` directly
   - On desktop: keeps existing Radix `DropdownMenu` (works fine)
   - Bypasses all Radix portal/focus-trap/pointer-event issues on mobile Safari
   - `pnpm typecheck` + `pnpm build` pass

2. **E2E Tested x402 Flow (P1) — COMPLETE**
   - Verified free tier: message sent → Redis counter at `x402:free:<addr>` incremented to 1
   - Set counter to 10 (limit), sent another → 402 response with correct payload
   - 402 body: `error: "free_tier_exceeded"`, `used: 11`, `limit: 10`, `paidEndpoint: "/api/chat/paid"`
   - Paid endpoint without payment → 402 + `payment-required` header with base64 x402 requirements
   - Decoded payment requirements: Base Sepolia, USDC, $0.01, payTo ProtocolFeeCollector — all correct
   - Cleaned up test Redis key

3. **Telegram Integration (P2) — IN PROGRESS (TASK-014)**
   - Installed `grammy` v1.40 (Telegram bot framework — kept as dep but not used at runtime)
   - Created `/api/telegram` webhook handler using direct fetch to Telegram API (no grammy at runtime)
   - `/start` command returns welcome message; all other messages go to Claude → reply
   - Wired landing page Telegram button → `https://t.me/ClawCoachBot`
   - Bot created via BotFather: `@ClawCoachBot`, token set in `.env.local` + Vercel
   - Webhook registered: `https://clawcoach.ai/api/telegram`
   - Proxy bypass added for `/api/telegram` (Telegram servers can't Basic Auth)
   - **BUG**: Vercel returns `500 — TypeError: p.end is not a function` on `/api/telegram`
     - Error is in bundled chunk, not in our code — likely Turbopack bundling issue
     - The `NextResponse.json()` call may need to be replaced with `Response.json()` or `new Response()`
     - Tried: grammy webhookCallback ("next-js" adapter) → 500, manual handleUpdate → 500, direct fetch (no grammy) → 500
     - All approaches hit the same `p.end is not a function` error in the bundled output
     - **Next step**: Replace `NextResponse.json()` with `Response.json()` or `new Response(JSON.stringify(...))` to bypass the Turbopack bundling issue
   - **NOT DONE**: Conversation history (single-turn only), wallet linking, x402 integration

### Session 25

1. **x402 Integration (COMPLETE)**
   - Added paywall banner UI in `AgentChat.tsx` — shows usage count, price, dismiss button
   - Fixed type errors in `src/lib/x402.ts` (network template literal type) and `src/app/api/chat/paid/route.ts` (ContentBlock access, withX402 generic)
   - `pnpm typecheck` passes, `pnpm build` passes (18 routes)

2. **Committed All Session 24 Work (4 commits)**
   - `b0a098e` — `feat(deploy): add Vercel deployment with staging password protection`
   - `34569a8` — `feat(x402): add pay-per-coach with free tier and x402 payment gate`
   - `7dfd771` — `chore(docs): update session handoff and sprint tracking for Session 24`
   - `58e773a` — `refactor(proxy): migrate middleware.ts to proxy.ts convention`

3. **Middleware → Proxy Migration (COMPLETE)**
   - Renamed `src/middleware.ts` → `src/proxy.ts`
   - Renamed exported function `middleware` → `proxy`
   - Build deprecation warning eliminated
   - Tech debt item #1 from CURRENT_ISSUES.md resolved

4. **Mobile Fixes (PARTIAL)**
   - Fixed hero horizontal scroll — added `overflow-hidden` + `-translate-x/y-1/2` on orb wrapper
   - Attempted wallet dropdown fix — `onSelect` + `modal={false}` did NOT fix mobile taps
   - **BUG OPEN**: Wallet dropdown items don't respond to taps on mobile (see CURRENT_ISSUES.md High #1)

5. **Deployed to Vercel (3 times total)**
   - All builds clean, 18 routes, site live at `https://clawcoach.ai`

---

## What's In Progress

### Telegram Integration (TASK-014) — 500 on Vercel
- Bot created, webhook registered, env vars set, proxy bypass added
- **Blocker**: `TypeError: p.end is not a function` on Vercel (Turbopack bundling issue)
- **Fix to try**: Replace `NextResponse.json()` with `Response.json()` in `/api/telegram/route.ts`
- File: `src/app/api/telegram/route.ts`

---

## What's Next

1. **Fix Telegram 500** — Replace `NextResponse.json()` with `Response.json()` in telegram route, push, redeploy
2. **Test Telegram bot** — Send messages in Telegram, verify responses
3. **Multi-token pricing (TASK-012)** — pricing page with CLAWC/USDC/ETH
4. **PartnerRewardPool contract** (Stage 2) — partner token promos alongside $CLAWC
5. **Telegram enhancements** — conversation history, wallet linking, /connect command

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
| Builder | Turbopack (Vercel build uses Turbopack, dev uses webpack) |

### Env Vars on Vercel (14 total)

| Variable | Env | Sensitive |
|----------|-----|-----------|
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

**NOT on Vercel**: PRIVATE_KEY, BASESCAN_KEY (deploy-only, never on hosted infra)

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
```

### Supabase Project Details
| Field | Value |
|-------|-------|
| Project name | `clawcoach` |
| Reference ID | `agvdivapnrqpstvhkbmk` |
| Region | East US (Ohio) |
| URL | `https://agvdivapnrqpstvhkbmk.supabase.co` |
| Tables | users, agents, messages, workouts, coaching_sessions, subscriptions |
| RLS | Enabled on all tables, SELECT-only for anon key |

---

## Decisions Made

- **Proxy convention**: Migrated `middleware.ts` → `proxy.ts` per Next.js 16 deprecation (Session 25)
- **Vercel deployment**: Team `classcoin`, project `moltcoach`, domain `clawcoach.ai` via Vercel DNS (Session 24)
- **Password protection**: Basic Auth proxy, not Vercel built-in (works on all plans) (Session 24)
- **ERC-8021 verified**: Base Codes app_id `698cc32e289e9e19f580444f` verified on live clawcoach.ai (Session 24)
- **x402 architecture**: Two endpoints (free streaming + paid non-streaming via withX402) (Session 24)
- **x402 packages**: `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1 (Session 24)
- **Free tier**: 10 messages per wallet per 30 days via Redis counter (Session 24)
- **Payment receiver**: ProtocolFeeCollector for x402 revenue (Session 24)
- **$CLAWC replaces $FIT**: $FIT becomes a partner reward token (fitcaster.xyz). $CLAWC is the native platform token (Session 18)
- **Multi-token reward model**: Agents distribute partner tokens ($FIT, $LEARN, etc.), $CLAWC for staking/governance (Session 18, refined Session 23)
- **Partner token model**: PartnerRewardPool contract — partners deposit tokens, ClawCoach distributes alongside $CLAWC, 5% platform fee (Session 23)
- **Fitcaster's $FIT is SEPARATE**: NOT the old $FIT we renamed — it's Fitcaster's own reward token, a different project (Session 23)
- **Builder Codes**: app_id `698cc32e289e9e19f580444f`, dataSuffix wired via `ox/erc8021` (Session 23)
- **Supabase project**: `clawcoach`, East US (Ohio), ref `agvdivapnrqpstvhkbmk` (Session 17)
- **Supabase auth model**: Wallet-based. Anon key for reads, service_role for writes via API routes (Session 17)
- **Chat persistence priority**: Supabase history > XMTP history > empty (Session 17)
- **XMTP V3 SDK**: `@xmtp/browser-sdk` v6.3.0 (Session 16)
- **Dev bundler**: webpack (not Turbopack) — XMTP WASM workers incompatible with Turbopack (Session 16)
- **Pricing model**: DUAL — Stake $CLAWC OR Subscribe USDC/ETH (Session 14, updated 18)
- **Theme**: Dark mode, lime primary on zinc
- **wagmi**: v3.4.2
- **Brand**: ClawCoach (clawcoach.ai)
- **BaseScan API key**: Created via Etherscan (Session 22)

---

## State of Tests

- `forge build`: **PASSES** (exit 0, lint notes only)
- `forge test`: **PASSES** (216 tests, 0 failures)
- `pnpm typecheck`: **PASSES** (Session 25)
- `pnpm build`: **PASSES** (18 routes, Session 25)

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
- **Agents**: 0 (no agent registered on new contracts yet)

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/`
- **pnpm**: v10.29.1 | **Next.js**: 16.1.6 | **Node**: v25.6.0
- **Vercel CLI**: v50.13.2
- **Project**: `~/Projects/moltcoach`
- **Dev server**: `pnpm dev` uses `--webpack` (not Turbopack) for XMTP WASM compatibility
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project), PRIVATE_KEY, BASESCAN_KEY
- **NOT configured**: Coinbase Wallet project ID
- **Deps**: `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1

---

*Last updated: Feb 11, 2026 — Session 25*
