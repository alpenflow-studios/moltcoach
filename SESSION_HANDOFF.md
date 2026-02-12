# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-11
- **Duration**: Session 24
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 24

1. **Vercel Deployment (COMPLETE)**
   - Authenticated Vercel CLI, linked `classcoin/moltcoach` project
   - Set 14 environment variables on Vercel production (all `NEXT_PUBLIC_*` + server-side keys)
   - **NOT added to Vercel**: `PRIVATE_KEY`, `BASESCAN_KEY` (correct, per instructions)
   - Deployed to production — build clean (17 routes, Turbopack)
   - Custom domain `clawcoach.ai` configured — nameservers already on Vercel DNS
   - `www.clawcoach.ai` added as well
   - Site is **LIVE** at `https://clawcoach.ai`

2. **ERC-8021 Builder Codes Verification (COMPLETE)**
   - `base:app_id` metadata tag already in `src/app/layout.tsx` line 24-26
   - Deployed without password protection first so Base Codes could verify
   - Michael confirmed: **verified on Base Codes dev portal**
   - Builder code `698cc32e289e9e19f580444f` is now active/verified

3. **Password Protection (COMPLETE)**
   - Created `src/middleware.ts` — Basic Auth middleware for staging
   - Credentials: username `beta` / password `democlawcoachbeta`
   - Controlled by `STAGING_USERNAME` + `STAGING_PASSWORD` env vars on Vercel (sensitive)
   - To remove: delete both env vars and the middleware passes through
   - Note: Next.js 16 shows deprecation warning about middleware → "proxy" convention (still works)

4. **x402 Integration (IN PROGRESS — ~60% done, needs next session)**
   - Installed `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1
   - Created `src/lib/x402.ts` — server config (facilitator URL, payment address, price, network)
   - Created `src/lib/freeMessages.ts` — Redis counter (10 free messages per wallet, 30-day TTL)
   - Created `src/app/api/chat/paid/route.ts` — x402-wrapped paid chat endpoint
   - Updated `src/app/api/chat/route.ts` — added free tier check, returns 402 when exceeded
   - Updated `src/hooks/useChat.ts` — added `paywall` state + 402 response handling
   - **NOT YET DONE** (see "What's Next" below):
     - AgentChat.tsx does NOT yet consume `paywall` state (no UI for paywall banner)
     - `pnpm typecheck` and `pnpm build` NOT run on x402 changes
     - No commit yet for x402 work
     - x402 env vars NOT on Vercel yet

5. **No commits this session** — all changes are uncommitted local work

---

## What's In Progress

### x402 Pay-Per-Coach Integration — ~60% COMPLETE

| Step | Status | Description |
|------|--------|-------------|
| Research x402 SDK | **DONE** | @x402/* packages, withX402 wrapper, facilitator URLs |
| Server config (`src/lib/x402.ts`) | **DONE** | Payment to FeeCollector, $0.01/msg, Base Sepolia |
| Free message counter (`src/lib/freeMessages.ts`) | **DONE** | Redis, 10 free msgs, 30-day TTL |
| Paid route (`/api/chat/paid/route.ts`) | **DONE** | withX402 wrapper, non-streaming (NextResponse.json) |
| Free route 402 response (`/api/chat/route.ts`) | **DONE** | Returns 402 + paidEndpoint when free tier exceeded |
| useChat hook 402 handling | **DONE** | `paywall` state, `dismissPaywall` callback |
| AgentChat.tsx paywall UI | **NOT DONE** | Need to render paywall banner when `paywall` is set |
| typecheck + build | **NOT DONE** | Need to verify x402 imports work cleanly |
| Vercel env vars for x402 | **NOT DONE** | X402_PAY_TO, X402_CHAT_PRICE, etc. (optional, has defaults) |
| Test end-to-end | **NOT DONE** | Send 10+ messages, verify 402, verify payment flow |

### Key x402 Architecture Decisions

- **Two endpoints**: `/api/chat` (free, streaming) + `/api/chat/paid` (paid via x402, non-streaming)
- **Paid endpoint uses `withX402`** wrapper from `@x402/next` — returns `NextResponse.json` (not streaming)
- **Free endpoint returns 402** with `{ paidEndpoint, used, limit, message }` when free tier exceeded
- **Payment goes to ProtocolFeeCollector** (`0x9233CC1Ab2ca19F7a240AD9238cBcf59516Def55`) on Base Sepolia
- **Facilitator**: `https://www.x402.org/facilitator` (testnet), `https://api.cdp.coinbase.com/platform/v2/x402` (production)
- **USDC on Base Sepolia**: Same `0x036CbD53842c5426634e7929541eC2318f3dCF7e` used by our contracts
- **Free tier**: 10 messages per wallet per 30 days (configurable via `X402_FREE_MESSAGE_LIMIT` env var)

---

## What's Next

1. **Finish x402 integration (Session 25)**
   - Add paywall UI in `AgentChat.tsx` (consume `paywall` state from `useChat`)
   - Run `pnpm typecheck` + `pnpm build` — fix any type errors from x402 imports
   - Commit x402 work
   - Deploy to Vercel
   - Test: send 10+ messages → verify 402 → verify payment flow with testnet USDC

2. **Telegram integration (TASK-014)** — bot + webhook handler
3. **Multi-token pricing (TASK-012)** — pricing page with CLAWC/USDC/ETH
4. **PartnerRewardPool contract** (Stage 2) — partner token promos alongside $CLAWC

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
| Password | Basic Auth via middleware (`beta` / `democlawcoachbeta`) |
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

- **Vercel deployment**: Team `classcoin`, project `moltcoach`, domain `clawcoach.ai` via Vercel DNS (Session 24)
- **Password protection**: Basic Auth middleware, not Vercel built-in (works on all plans) (Session 24)
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
- `pnpm typecheck`: **PASSED** at start of session (before x402 changes — recheck needed)
- `pnpm build`: **PASSED** at start of session (before x402 changes — recheck needed)

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

## Uncommitted Files (Session 24)

These files were created/modified but NOT committed:

### New Files
- `src/middleware.ts` — Basic Auth for staging
- `src/lib/x402.ts` — x402 server config
- `src/lib/freeMessages.ts` — Redis free message counter
- `src/app/api/chat/paid/route.ts` — x402-wrapped paid chat endpoint

### Modified Files
- `src/app/api/chat/route.ts` — added `checkFreeMessages` import + 402 response
- `src/hooks/useChat.ts` — added `paywall` state + 402 handling + `dismissPaywall`
- `pnpm-lock.yaml` — added @x402/* packages
- `package.json` — added @x402/next, @x402/core, @x402/evm
- `.vercel/` directory — Vercel project link (gitignored)

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/`
- **pnpm**: v10.29.1 | **Next.js**: 16.1.6 | **Node**: v25.6.0
- **Vercel CLI**: v50.13.2
- **Project**: `~/Projects/moltcoach`
- **Dev server**: `pnpm dev` uses `--webpack` (not Turbopack) for XMTP WASM compatibility
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project), PRIVATE_KEY, BASESCAN_KEY
- **NOT configured**: Coinbase Wallet project ID
- **New deps**: `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1

---

*Last updated: Feb 11, 2026 — Session 24*
