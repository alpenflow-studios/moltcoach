# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-12
- **Duration**: Session 32
- **Branch**: `main`
- **Model**: Claude Opus 4.6
- **Commits**: `71cf0e2`, `1da143c`

---

## What Was Done

### Session 32

1. **Fixed Agent Page Address Error (P0) — COMPLETE**
   - Root cause: `NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS` on Vercel had trailing whitespace (same pattern as S29 Privy, S31 Redis)
   - Fix: Added `.trim()` to ALL contract address env var reads in `src/config/contracts.ts` — permanent fix, no more `vercel env rm` needed for contract addresses
   - Also confirmed: address checksum valid, contract reads work on default RPC, 0 agents on new contracts
   - **Committed**: `1da143c`

2. **Chain Guard UX — COMPLETE**
   - Added `useChainId` + `useSwitchChain` to `AgentPageContent`
   - Wrong chain → "Wrong Network" screen with "Switch to Base Sepolia" button
   - Read errors now surfaced with user-friendly messages + retry button
   - New `src/lib/contractErrors.ts` — parses viem errors into plain English (chain mismatch, no gas, user rejected, RPC failures, reverts)
   - **Committed**: `71cf0e2`

3. **Telegram Wallet Linking (P2) — COMPLETE (code)**
   - `POST /api/telegram/link` — generates 6-char code (Redis, 10-min TTL)
   - `/connect <CODE>` bot command — verifies code, deletes it (one-time use), upserts `telegram_links` in Supabase
   - `LinkTelegram` UI card on agent page — generate code, copy command, open bot link
   - `telegram_links` table types added to `database.ts`
   - SQL migration at `docs/sql/telegram_links.sql`
   - **BLOCKER**: Michael needs to run `docs/sql/telegram_links.sql` in Supabase SQL Editor before `/connect` works
   - **Committed**: `1da143c`

4. **Chat History — Expected Fresh Start**
   - Old chat messages in Supabase are tied to old agent IDs (pre-Phase 7 rebrand contracts)
   - 0 agents on new contracts → no agent to load history for
   - After registering a new agent, chat history starts fresh (old data still in Supabase, just orphaned)
   - NOT a bug — expected after contract redeployment

### Session 31

1. **Fixed Telegram Redis on Vercel (P1) — COMPLETE**
2. **Landing Page Updates — COMPLETE**
3. **Privy Dashboard Config (Michael — manual)**
4. **Tester Bug Report — Agent Page Error (resolved in S32)**

### Session 30

1. **Privy Flow Testing (TASK-017 partial)**
2. **Mobile Loading Skeleton (P1) — COMPLETE**
3. **Landing Page Updates — COMPLETE**
4. **Telegram Bot Debugging (resolved in S31)**

### Session 29

1. **Fixed production crash — all browsers + mobile (P0)**
2. **Wallet extension conflict diagnosed**

---

## What's In Progress

1. **Privy flow testing (TASK-017)** — Farcaster enabled in dashboard (untested). Google OAuth needs Google Cloud Console setup. Email + mobile still untested.

---

## What's Next (Priority Order)

1. **Run telegram_links SQL** — Michael: paste `docs/sql/telegram_links.sql` into Supabase SQL Editor to create the table
2. **Register new agent** — Michael: register a new agent on the new contracts (agent page should work now with `.trim()` fix)
3. **Complete Privy flow testing (P1)** — Test: Farcaster login, Google OAuth (once configured), email login with burner, mobile wallet
4. **PartnerRewardPool contract (P2)** — Solidity + Foundry tests, Stage 2
5. **Wearable integrations (P3)** — Strava, Apple Health, Garmin

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

**✅ FIXED S32**: Contract address env vars now `.trim()`'d in code — no more whitespace issues.
**✅ FIXED S31**: Upstash env vars cleaned via `printf`.

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

Telegram wallet linking (NEW S32)
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
| Tables | users, agents, messages, workouts, coaching_sessions, subscriptions, **telegram_links (PENDING — run SQL)** |
| RLS | Enabled on all tables, SELECT-only for anon key |

---

## Decisions Made

- **Env var `.trim()` pattern**: All contract address env vars trimmed in `contracts.ts`. Permanent fix for recurring Vercel whitespace issue. (Session 32)
- **Chain guard pattern**: `AgentPageContent` checks `useChainId()` against `baseSepolia.id`, shows "Switch to Base Sepolia" button via `useSwitchChain()`. (Session 32)
- **Contract error parser**: `src/lib/contractErrors.ts` maps viem errors to user-friendly strings. Used in `useAgentReads` error display + `useRegisterAgent` error display. (Session 32)
- **Telegram wallet linking**: One-time codes via Redis, `/connect` command in bot, `telegram_links` table in Supabase. Code format: 6 uppercase alphanumeric, 10-min TTL. (Session 32)
- **Loading skeleton pattern**: WalletProvider mount guard shows navbar/content/footer skeleton instead of `null`. Uses shadcn `Skeleton` component. (Session 30)
- **🦞 branding standard**: All visible ClawCoach references use `🦞 Claw<span class="text-primary">Coach</span>` — navbar (S28), footer (S30), landing CTA (S30), loading skeleton (S30). (Session 30)
- **Base pill (brand-compliant)**: Filled `#0000FF` background, white text, rounded square logo (5% radius). Per base.org/brand/core-identifiers. (Session 31, replaces S30)
- **MetaMask SDK stub pattern**: `@react-native-async-storage/async-storage` aliased to empty in both Turbopack (`resolveAlias`) and webpack (`resolve.alias`) configs. (Session 29)
- **Vercel env var hygiene**: Always use `printf` (not `echo`) when piping values to `vercel env add` to avoid trailing newlines. (Session 29)
- **Privy replaces wagmi-only auth**: `@privy-io/react-auth@3.13.1` + `@privy-io/wagmi@4.0.1`. PrivyProvider wraps WagmiProvider. Email + Farcaster + wallet login. Embedded wallets for email users. (Session 28)
- **Privy App ID**: `cmlj0izut00hg0cjrd7rrm80b` (Session 28)
- **Privy SSR pattern**: WalletProvider mount guard shows skeleton during SSR. ConnectWallet dynamically imported with `ssr: false` in all consumer files. `page.tsx` uses `"use client"` for Turbopack compat. (Session 28, updated S30)
- **Pricing simplified to 3 tiers**: Free/Pro/Elite (was 4 tiers with Basic). Pro at $9.99/mo or 1K CLAWC, Elite at $29.99/mo or 10K CLAWC (Session 27)
- **Telegram history in Redis**: Key pattern `telegram:history:<chatId>`, 20 msg cap, 7-day TTL (Session 27)
- **Proxy convention**: Migrated `middleware.ts` → `proxy.ts` per Next.js 16 deprecation (Session 25)
- **Vercel deployment**: Team `classcoin`, project `moltcoach`, domain `clawcoach.ai` via Vercel DNS (Session 24)
- **Password protection**: Basic Auth proxy, not Vercel built-in (works on all plans) (Session 24)
- **x402 architecture**: Two endpoints (free streaming + paid non-streaming via withX402) (Session 24)
- **Free tier**: 10 messages per wallet per 30 days via Redis counter (Session 24)
- **$CLAWC replaces $FIT**: $FIT becomes a partner reward token (fitcaster.xyz). $CLAWC is the native platform token (Session 18)
- **Supabase project**: `clawcoach`, East US (Ohio), ref `agvdivapnrqpstvhkbmk` (Session 17)
- **Chat persistence priority**: Supabase history > XMTP history > empty (Session 17)
- **Dev bundler**: webpack (not Turbopack) — XMTP WASM workers incompatible with Turbopack (Session 16)
- **Theme**: Dark mode, lime primary on zinc
- **Brand**: ClawCoach (clawcoach.ai)

---

## State of Tests

- `forge build`: **PASSES** (exit 0, lint notes only)
- `forge test`: **PASSES** (216 tests, 0 failures)
- `pnpm typecheck`: **PASSES** (Session 32)
- `pnpm build`: **PASSES** (20 routes, Session 32) — Vercel deploy succeeds

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
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project), PRIVATE_KEY, BASESCAN_KEY, TELEGRAM_BOT_TOKEN
- **NOT configured**: Coinbase Wallet project ID
- **Deps**: `@privy-io/react-auth` ^3.13.1, `@privy-io/wagmi` ^4.0.1, `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1, `grammy` ^1.40.0
- **Telegram bot**: `@ClawCoachBot`, webhook at `clawcoach.ai/api/telegram`, proxy bypass in `src/proxy.ts`
- **Redis keys**: `x402:free:<addr>` (free tier counter), `telegram:history:<chatId>` (conversation history), `telegram:linkcode:<CODE>` (wallet link codes, 10-min TTL — **NEW S32**)

---

*Last updated: Feb 12, 2026 — Session 32*
