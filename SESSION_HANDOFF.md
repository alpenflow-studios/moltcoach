# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-12
- **Duration**: Session 30
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 30

1. **Privy Flow Testing (TASK-017 partial)**
   - Desktop wallet connect: **confirmed working**
   - Disconnect: **confirmed working**
   - Email login: Modal opens correctly, needs burner email to complete test
   - Farcaster login: Blocked by Privy dashboard setting — needs enabling
   - Google OAuth: Needs enabling in Privy dashboard
   - Mobile wallet: Untested this session

2. **Mobile Loading Skeleton (P1) — COMPLETE**
   - Replaced `return null` mount guard in `WalletProvider` with loading skeleton
   - Skeleton shows: navbar skeleton (pulsing placeholders), centered spinner with "Loading 🦞 ClawCoach..." text, footer skeleton
   - Matches real layout structure (`max-w-6xl`, `h-16` navbar, `overflow-x-clip`)
   - **Committed**: `255898d`

3. **Landing Page Updates — COMPLETE**
   - Updated hero copy: nutrition goals, partner perks
   - Added 🦞 emoji to all ClawCoach branding (footer, CTA section, loading screen)
   - Replaced green Zap pill with Base blue (#0052FF) pill: Base logo SVG + "Built on Base with · ERC-8004 · ERC-8021 · ERC-8128"
   - Stacked Farcaster + Base pills vertically above h1
   - Reordered hero CTAs: I AM HUMAN/I AM NOT → Purchase $CLAWC → Connect/Start Staking
   - **Committed**: `c67febc`, `65b97c2`, `d7cbe7b`

4. **Telegram Bot Debugging (IN PROGRESS)**
   - Bot responds to messages (webhook works, Claude API works)
   - **Conversation history NOT persisting on Vercel** — `saveHistory` silently fails
   - Works perfectly locally (Redis keys created, multi-turn memory works)
   - Vercel webhook returns 200 but no `telegram:history:*` keys created in Redis
   - **Root cause investigation**: Likely `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` env vars on Vercel have whitespace/newline issues (same pattern as Privy app ID in S29)
   - **Next step**: Run `vercel env pull` to inspect env var values, or `vercel env rm` + `vercel env add` with `printf` for both Upstash vars
   - Rate limit keys (`ratelimit:chat:daily:*`) exist in Redis but may have been created locally, not on Vercel

### Session 29

1. **Fixed production crash — all browsers + mobile (P0)**
   - **Root cause 1**: `NEXT_PUBLIC_PRIVY_APP_ID` on Vercel had trailing `\n` — Privy rejected it as invalid app ID
   - **Fix**: Removed and re-added env var cleanly via `vercel env rm` + `vercel env add` with `printf` (no newline)
   - **Root cause 2**: `@metamask/sdk` imports `@react-native-async-storage/async-storage` which doesn't exist in browser builds
   - **Fix**: Added `turbopack.resolveAlias` (production) and `webpack.resolve.alias` (dev) in `next.config.ts` to stub the module
   - **Added**: `src/app/global-error.tsx` for better error visibility on layout-level crashes
   - **Committed**: `84754d6` — pushed, Vercel deploy succeeded
   - **Verified**: Site loads in incognito (desktop) and on mobile (iOS Safari)

2. **Wallet extension conflict diagnosed**
   - MetaMask + Coinbase Wallet extensions fight over `window.ethereum` via `Object.defineProperty`
   - Not our code — user should disable one extension. Privy handles multi-wallet via EIP-6963.

### Session 28 (continued)

1. **Privy Integration (TASK-017) — COMPLETE**
   - Replaced wagmi-only auth with Privy for email + Farcaster + multi-wallet login
   - **Installed**: `@privy-io/react-auth@3.13.1`, `@privy-io/wagmi@4.0.1`
   - All 10 hook/component files that import from wagmi are UNCHANGED

### Session 27

1. **Multi-Token Pricing Page (TASK-012) — COMPLETE**
2. **Telegram Conversation History — deployed but history doesn't persist on Vercel (see S30)**
3. **Hero Orb Fix — COMPLETE**

### Session 26

1. **Fixed Mobile Wallet Connect (P0) — PARTIAL (reverted in S27)**
2. **E2E Tested x402 Flow (P1) — COMPLETE**
3. **Telegram Integration (P2) — COMPLETE (TASK-014)**

---

## What's In Progress

1. **Telegram conversation history on Vercel** — Bot responds but history not saving. Suspect Vercel Upstash env vars have whitespace/newline issues. Next step: clean re-add via `vercel env rm` + `vercel env add` with `printf`.

---

## What's Next (Priority Order)

1. **Fix Telegram Redis on Vercel (P1)** — Clean re-add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` via `printf` (same pattern as Privy fix). Then test multi-turn history on @ClawCoachBot.
2. **Complete Privy flow testing (P1)** — Need: burner email for email login test, enable Farcaster + Google OAuth in Privy dashboard, test mobile wallet
3. **Telegram wallet linking (P2)** — `/connect` command, one-time link code, Supabase `telegram_links` table
4. **PartnerRewardPool contract (P2)** — Stage 2, partner token promos alongside $CLAWC
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

**⚠️ SUSPECT**: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` may have whitespace/newline issues — same pattern as Privy app ID in S29. Need to clean re-add.

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

- **Loading skeleton pattern**: WalletProvider mount guard shows navbar/content/footer skeleton instead of `null`. Uses shadcn `Skeleton` component. (Session 30)
- **🦞 branding standard**: All visible ClawCoach references use `🦞 Claw<span class="text-primary">Coach</span>` — navbar (S28), footer (S30), landing CTA (S30), loading skeleton (S30). (Session 30)
- **Base blue pill**: Hero badge uses Base blue (#0052FF) for text + Base logo SVG, lists ERC-8004/8021/8128. (Session 30)
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
- `pnpm typecheck`: **PASSES** (Session 30)
- `pnpm build`: **PASSES** (19 routes, Session 30) — Vercel deploy succeeds

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
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project), PRIVATE_KEY, BASESCAN_KEY, TELEGRAM_BOT_TOKEN
- **NOT configured**: Coinbase Wallet project ID
- **Deps**: `@privy-io/react-auth` ^3.13.1, `@privy-io/wagmi` ^4.0.1, `@x402/next` ^2.3.0, `@x402/core` ^2.3.1, `@x402/evm` ^2.3.1, `grammy` ^1.40.0
- **Telegram bot**: `@ClawCoachBot`, webhook at `clawcoach.ai/api/telegram`, proxy bypass in `src/proxy.ts`
- **Redis keys**: `x402:free:<addr>` (free tier counter), `telegram:history:<chatId>` (conversation history — works locally, broken on Vercel)

---

*Last updated: Feb 12, 2026 — Session 30*
