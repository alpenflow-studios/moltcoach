# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-12
- **Duration**: Session 29
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 29

1. **Fixed production crash — all browsers + mobile (P0)**
   - **Root cause 1**: `NEXT_PUBLIC_PRIVY_APP_ID` on Vercel had trailing `\n` — Privy rejected it as invalid app ID
   - **Fix**: Removed and re-added env var cleanly via `vercel env rm` + `vercel env add` with `printf` (no newline)
   - **Root cause 2**: `@metamask/sdk` imports `@react-native-async-storage/async-storage` which doesn't exist in browser builds
   - **Fix**: Added `turbopack.resolveAlias` (production) and `webpack.resolve.alias` (dev) in `next.config.ts` to stub the module
   - **Added**: `src/app/global-error.tsx` for better error visibility on layout-level crashes
   - **Committed**: `84754d6` — pushed, Vercel deploy succeeded
   - **Verified**: Site loads in incognito (desktop) and on mobile (iOS Safari)
   - **Note**: Mobile load time ~10s (logged as Medium tech debt — mount guard returns `null` during SSR)

2. **Wallet extension conflict diagnosed**
   - MetaMask + Coinbase Wallet extensions fight over `window.ethereum` via `Object.defineProperty`
   - MetaMask's SES lockdown makes property non-configurable, Coinbase's `evmAsk.js` crashes
   - Not our code — user should disable one extension. Privy handles multi-wallet via EIP-6963.

### Session 28 (continued)

1. **Privy Integration (TASK-017) — COMPLETE**
   - Replaced wagmi-only auth with Privy for email + Farcaster + multi-wallet login
   - **Installed**: `@privy-io/react-auth@3.13.1`, `@privy-io/wagmi@4.0.1`
   - **Privy App ID**: `cmlj0izut00hg0cjrd7rrm80b` (added to `.env.local` + `.env.example` + Vercel)
   - **Files rewritten** (5 files):
     - `src/config/wagmi.ts` — removed all connectors, `createConfig` from `@privy-io/wagmi`
     - `src/components/providers/WalletProvider.tsx` — PrivyProvider wraps QueryClientProvider wraps WagmiProvider, mount guard returns `null` during SSR
     - `src/components/ConnectWallet.tsx` — replaced wagmi connector logic with `usePrivy()` login/logout
     - `src/components/EmailSignupLink.tsx` — NEW, opens Privy modal filtered to email-only
     - `src/app/page.tsx` — added `"use client"`, wired `<EmailSignupLink />`, dynamic imports for ConnectWallet
   - **SSR fix** (4 files): dynamic `ssr: false` imports for ConnectWallet in `Navbar.tsx`, `DashboardContent.tsx`, `AgentPageContent.tsx`, `StakingPageContent.tsx`
   - **Mount guard fix**: WalletProvider returns `null` (not `{children}`) when unmounted — prevents wagmi hooks from firing without providers during prerendering
   - **10 hook/component files UNCHANGED** — all wagmi hooks (`useAccount`, `useReadContract`, `useWriteContract`, etc.) work as before
   - **Committed**: `29fb2bf` — all 15 files
   - **Deployed**: Vercel build succeeds (35s), live at `clawcoach.ai`
   - **Tested**: Chat flow confirmed working on live site

2. **Lobster emoji added to navbar** — `🦞 ClawCoach` in `src/components/Navbar.tsx`

3. **Tested mobile wallet hypothesis** — Temporarily disabled Vercel password protection to test if Basic Auth was blocking mobile wallet popups. It was NOT the cause. Password protection re-enabled.

4. **Updated CLAUDE.md** — Auth layer updated to Privy, env vars updated, Supabase/Vercel/Privy dashboard links added, database tables updated to reflect implemented vs planned

### Session 27

1. **Multi-Token Pricing Page (TASK-012) — COMPLETE**
   - Simplified from 4 tiers to 3: Free / Pro / Elite
   - Free: 10 messages/month, $0
   - Pro: 1,000 CLAWC staked OR $9.99/mo USDC (unlimited messages, advanced programs)
   - Elite: 10,000 CLAWC staked OR $29.99/mo USDC (everything + priority, wearable integration)
   - 3-column card layout with token selector (USDC/ETH) and billing toggle (monthly/quarterly/annual)
   - Added 5-item FAQ section ("What's the difference between staking and subscribing?" etc.)
   - Stake buttons → /staking, Subscribe buttons → /subscribe, Free → /agent
   - `pnpm typecheck` + `pnpm build` pass

2. **Telegram Conversation History — COMPLETE**
   - Added multi-turn memory to @ClawCoachBot via Upstash Redis
   - History stored at `telegram:history:<chatId>` key
   - Capped at 20 messages (10 turns) per chat
   - 7-day TTL on inactivity (auto-expires unused chats)
   - `/reset` command clears history
   - `/start` also clears history for fresh onboarding
   - Graceful fallback to single-turn if Redis unavailable
   - Can only test on live deploy (Telegram webhook needs public URL)

3. **Hero Orb Fix — COMPLETE**
   - Removed `overflow-hidden` from hero section (was clipping orb + wallet dropdown)
   - Added `overflow-x-clip` to layout wrapper (prevents horizontal scroll without clipping)
   - Fixed double-translate in orb animation keyframes (keyframes had `translate(-50%, -50%)` but wrapper already uses Tailwind `-translate-x/y-1/2`)
   - Orb confirmed looking great on both mobile and desktop

4. **Mobile Wallet — STILL BROKEN (see CURRENT_ISSUES.md High #1)**
   - Replaced toggle dropdown with direct `<Button>` per connector
   - Filtered out generic "Injected" connector
   - Buttons render (Coinbase Wallet + WalletConnect visible) but tapping does nothing
   - This is the THIRD attempt (S25: Radix onSelect, S26: plain toggle buttons, S27: direct buttons) — underlying issue is likely wagmi connector initialization on mobile, not the UI layer
   - **Needs deep investigation in S28**: check wagmi `connect()` error handling, test in Safari mobile devtools, check if connectors need async provider resolution before `connect()` is callable

### Session 26

1. **Fixed Mobile Wallet Connect (P0) — PARTIAL (reverted in S27)**
2. **E2E Tested x402 Flow (P1) — COMPLETE**
3. **Telegram Integration (P2) — COMPLETE (TASK-014)**

---

## What's In Progress

_(nothing — S29 P0 fix complete, clean slate for next session)_

---

## What's Next (Priority Order)

1. **Test remaining Privy flows (P1)** — Chat confirmed working on desktop. Still need: email login, Farcaster login, external wallet on mobile, disconnect
2. **Improve mobile load time (P1)** — ~10s on mobile. Mount guard returns `null` → blank page. Show loading skeleton instead.
3. **Test Telegram conversation history (P1)** — deployed but untested on live bot
4. **Telegram wallet linking (P2)** — `/connect` command, one-time link code, Supabase `telegram_links` table
5. **PartnerRewardPool contract (P2)** — Stage 2, partner token promos alongside $CLAWC
6. **Wearable integrations (P3)** — Strava, Apple Health, Garmin

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

- **MetaMask SDK stub pattern**: `@react-native-async-storage/async-storage` aliased to empty in both Turbopack (`resolveAlias`) and webpack (`resolve.alias`) configs. Required because `@metamask/sdk` (pulled in by wagmi connectors via Privy) imports React Native deps. (Session 29)
- **Vercel env var hygiene**: Always use `printf` (not `echo`) when piping values to `vercel env add` to avoid trailing newlines. (Session 29)
- **Privy replaces wagmi-only auth**: `@privy-io/react-auth@3.13.1` + `@privy-io/wagmi@4.0.1`. PrivyProvider wraps WagmiProvider. Email + Farcaster + wallet login. Embedded wallets for email users. (Session 28)
- **Privy App ID**: `cmlj0izut00hg0cjrd7rrm80b` (Session 28)
- **Privy SSR pattern**: WalletProvider mount guard returns `null` during SSR (not `{children}`). ConnectWallet dynamically imported with `ssr: false` in all consumer files. `page.tsx` uses `"use client"` for Turbopack compat. (Session 28)
- **Pricing simplified to 3 tiers**: Free/Pro/Elite (was 4 tiers with Basic). Pro at $9.99/mo or 1K CLAWC, Elite at $29.99/mo or 10K CLAWC (Session 27)
- **Telegram history in Redis**: Key pattern `telegram:history:<chatId>`, 20 msg cap, 7-day TTL (Session 27)
- **Orb fix approach**: `overflow-x-clip` on layout wrapper instead of `overflow-hidden` on hero section (Session 27)
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
- **Pricing model**: DUAL — Stake $CLAWC OR Subscribe USDC/ETH (Session 14, updated 27)
- **Theme**: Dark mode, lime primary on zinc
- **wagmi**: v3.4.2
- **Brand**: ClawCoach (clawcoach.ai)
- **BaseScan API key**: Created via Etherscan (Session 22)

---

## State of Tests

- `forge build`: **PASSES** (exit 0, lint notes only)
- `forge test`: **PASSES** (216 tests, 0 failures)
- `pnpm typecheck`: **PASSES** (Session 29)
- `pnpm build`: **PASSES** (19 routes, Session 29) — Vercel deploy succeeds

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
- **Redis keys**: `x402:free:<addr>` (free tier counter), `telegram:history:<chatId>` (conversation history)

---

*Last updated: Feb 12, 2026 — Session 29*
