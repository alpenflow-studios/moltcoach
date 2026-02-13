# CURRENT_SPRINT.md

> **Purpose**: Active tasks with machine-checkable acceptance criteria. Claude Code checks this at session start.

---

## Sprint: Frontend Integration + UX

### Goal
> Full frontend connected to deployed contracts. Agent creation, staking, dashboard — all working end-to-end on Base Sepolia.

---

## Tasks

### Not Started

_(none)_

---

#### TASK-018: Telegram Wallet Linking
- **Priority**: P2
- **Scope**: `src/app/api/telegram/link/route.ts`, `src/app/api/telegram/route.ts`, `src/components/agent/LinkTelegram.tsx`, `src/types/database.ts`
- **Started**: Session 32 (Feb 12, 2026)
- **Completed**: Session 32 (Feb 12, 2026) — code complete, table pending
- **Notes**: One-time link codes via Redis. `/connect <CODE>` bot command. `LinkTelegram` UI card on agent page. SQL at `docs/sql/telegram_links.sql`.
- **Acceptance Criteria**:
  - [x] `POST /api/telegram/link` generates 6-char code (Redis, 10-min TTL)
  - [x] `/connect <CODE>` bot command verifies code and upserts `telegram_links`
  - [x] `LinkTelegram` UI card on agent page
  - [x] `telegram_links` table types in `database.ts`
  - [x] SQL migration written (`docs/sql/telegram_links.sql`)
  - [ ] `telegram_links` table created in Supabase (Michael: run SQL in dashboard)
  - [ ] End-to-end test: generate code → send `/connect` → verify link in Supabase
  - [x] `pnpm typecheck` passes
  - [x] `pnpm build` passes

---

#### TASK-015: Vercel Deployment + Password Protection
- **Priority**: P0
- **Scope**: Vercel project, env vars, domain, middleware
- **Started**: Session 24 (Feb 11, 2026)
- **Completed**: Session 24 (Feb 11, 2026)
- **Acceptance Criteria**:
  - [x] Vercel project linked (`classcoin/moltcoach`)
  - [x] 14 env vars set on Vercel production
  - [x] `clawcoach.ai` domain configured
  - [x] `www.clawcoach.ai` redirect added
  - [x] ERC-8021 Builder Codes verified on Base Codes
  - [x] Password protection via Basic Auth middleware
  - [x] Site loads after auth at `clawcoach.ai`

#### TASK-016: x402 Pay-Per-Coach Integration
- **Priority**: P1
- **Scope**: x402 packages, API routes, useChat hook, paywall UI
- **Started**: Session 24 (Feb 11, 2026)
- **Completed**: Session 25 (Feb 11, 2026)
- **Acceptance Criteria**:
  - [x] `@x402/next`, `@x402/core`, `@x402/evm` installed
  - [x] `src/lib/x402.ts` server config (FeeCollector, $0.01, Base Sepolia)
  - [x] `src/lib/freeMessages.ts` Redis counter (10 free/30 days)
  - [x] `/api/chat/paid` route wrapped with `withX402`
  - [x] `/api/chat` returns 402 when free tier exceeded
  - [x] `useChat` hook handles 402 response with `paywall` state
  - [x] `AgentChat.tsx` renders paywall banner
  - [x] `pnpm typecheck` passes
  - [x] `pnpm build` passes
  - [x] Changes committed
  - [x] Deployed to Vercel

---

### In Progress

#### TASK-017: Privy Integration (Email + Farcaster + Multi-Wallet Auth)
- **Priority**: P0
- **Scope**: `src/config/wagmi.ts`, `src/components/providers/WalletProvider.tsx`, `src/components/ConnectWallet.tsx`, `src/components/EmailSignupLink.tsx`, `src/app/page.tsx`
- **Started**: Session 28 (Feb 12, 2026)
- **Notes**: Replaces wagmi-only connector flow with Privy. `@privy-io/react-auth@3.13.1` + `@privy-io/wagmi@4.0.1`. Privy App ID: `cmlj0izut00hg0cjrd7rrm80b`. All 10 hook/component files that import from wagmi are UNCHANGED. SSR fix: WalletProvider mount guard returns `null` (not `{children}`), ConnectWallet/EmailSignupLink dynamically imported with `ssr: false`. Vercel deploy succeeds (35s). Chat flow confirmed on desktop. S29: Fixed production crash (Privy app ID had trailing `\n` on Vercel + MetaMask SDK React Native import stubbed). Site verified working in incognito + mobile.
- **Acceptance Criteria**:
  - [x] `@privy-io/react-auth` and `@privy-io/wagmi` installed
  - [x] `NEXT_PUBLIC_PRIVY_APP_ID` env var added (local + Vercel)
  - [x] `src/config/wagmi.ts` rewritten (connectors removed, Privy manages them)
  - [x] `WalletProvider` restructured: PrivyProvider → QueryClientProvider → WagmiProvider
  - [x] `ConnectWallet` rewritten with `usePrivy()` login/logout
  - [x] `EmailSignupLink` component created (email-only Privy modal)
  - [x] Landing page wired to `<EmailSignupLink />`
  - [x] `pnpm typecheck` passes locally
  - [x] `pnpm build` passes locally
  - [x] ConnectWallet + EmailSignupLink resilient to SSR (no provider throws)
  - [x] Vercel deploy succeeds
  - [x] Site loads on production (incognito + mobile) — S29 fix
  - [ ] Email login creates embedded wallet (S30: modal opens correctly, needs burner email to complete test)
  - [ ] Farcaster login works (S31: enabled in Privy dashboard + auto-link wallets on, untested)
  - [x] External wallet login works (desktop) — S30: confirmed working
  - [ ] External wallet login works (mobile) — untested S30
  - [ ] Google OAuth (S31: in progress — redirect URI `https://auth.privy.io/api/v1/oauth/callback`, needs Google Cloud Console setup)
  - [x] Disconnect works — S30: confirmed

---

### Done

#### TASK-012: Multi-Token Pricing + Subscription Model
- **Priority**: P1
- **Scope**: `src/app/pricing/page.tsx`, `src/components/pricing/PricingPageContent.tsx`, `src/config/pricing.ts`
- **Started**: Session 14 (Feb 10, 2026)
- **Completed**: Session 27 (Feb 12, 2026)
- **Notes**: Simplified from 4 tiers to 3 (Free/Pro/Elite). Pro: $9.99/mo or 1K CLAWC. Elite: $29.99/mo or 10K CLAWC. Added FAQ section with 5 items.
- **Acceptance Criteria**:
  - [x] Pricing page shows prices in CLAWC, USDC, and ETH
  - [x] Subscription model alongside staking (monthly/quarterly/yearly)
  - [x] Token selector UI on pricing page
  - [x] `src/config/pricing.ts` with tier prices per token
  - [x] Pricing FAQ updated for dual model (stake vs subscribe)
  - [x] `pnpm typecheck` passes
  - [x] `pnpm build` passes

#### TASK-014: Telegram Integration
- **Priority**: P2
- **Scope**: Telegram Bot API, webhook handler, new API routes
- **Started**: Session 26 (Feb 12, 2026)
- **Completed**: Session 26 (Feb 12, 2026)
- **Notes**: grammy v1.40 installed (not used at runtime). Webhook handler uses direct fetch to Telegram API. Bot: `@ClawCoachBot`. Proxy bypass for `/api/telegram`. Bot is live and responding.
- **Acceptance Criteria**:
  - [x] Telegram bot created and configured
  - [x] Webhook handler at `/api/telegram`
  - [x] Agent can respond to Telegram messages
  - [x] Landing page Telegram button functional

#### TASK-009: Supabase Integration
- **Priority**: P1
- **Scope**: `src/lib/supabase.ts`, new hooks, API routes
- **Started**: Session 14 (Feb 10, 2026)
- **Completed**: Session 17 (Feb 11, 2026)
- **Notes**: Supabase project `clawcoach` (ref `agvdivapnrqpstvhkbmk`, East US/Ohio). 6 tables, RLS enabled. Workout storage deferred (API route exists, needs wearable integration). Changes NOT YET COMMITTED.
- **Acceptance Criteria**:
  - [x] Supabase project ID and anon key in `.env.local`
  - [x] User record created on wallet connect
  - [x] Agent registration synced to Supabase
  - [ ] Workout data stored in Supabase (API route ready, needs wearable integration)
  - [x] Chat messages persisted in Supabase
  - [x] RLS policies working (users can only read/write own data)

#### TASK-013: XMTP Integration
- **Priority**: P2
- **Scope**: XMTP SDK, agent messaging, new hooks/components
- **Started**: Session 15 (Feb 10, 2026)
- **Completed**: Session 16 (Feb 10, 2026)
- **Notes**: Migrated from V2 (`@xmtp/xmtp-js`) to V3 (`@xmtp/browser-sdk` v6.3.0) after V2 deprecation. Agent registered via `@xmtp/cli`. Dev server switched from Turbopack to webpack for WASM compatibility.
- **Acceptance Criteria**:
  - [x] XMTP client initialized with wallet
  - [x] Agent can send/receive messages via XMTP
  - [x] Chat UI supports XMTP channel
  - [x] Landing page XMTP button functional
  - [x] `pnpm typecheck` passes
  - [x] `pnpm lint` passes
  - [x] `pnpm build` passes

#### TASK-011: Wire Landing Page Placeholders (Partial)
- **Priority**: P1
- **Scope**: `src/app/page.tsx`, landing page buttons
- **Completed**: Session 13 (Feb 10, 2026)
- **Notes**: Buttons wired ("I AM HUMAN" → /agent, "I AM NOT" → /hub, "Purchase $CLAWC" → /staking). Privy email signup and ETH/USDC pricing deferred to separate tasks.
- **Acceptance Criteria**:
  - [x] "I AM HUMAN" / "I AM NOT" buttons trigger distinct onboarding paths
  - [x] "Purchase $CLAWC" links to staking page
  - [ ] "Sign up with your email" opens Privy modal (deferred — needs Privy integration)
  - [ ] Pricing page tiers show ETH/USDC (moved to TASK-012)

#### TASK-010: Agent Coaching Chat
- **Priority**: P1
- **Scope**: Chat interface, Claude API integration
- **Started**: Session 10 (Feb 10, 2026)
- **Completed**: Session 11 (Feb 10, 2026)
- **Acceptance Criteria**:
  - [x] Chat interface within `/agent` page (below AgentProfileCard)
  - [x] Streaming API route at `/api/chat` using Anthropic SDK
  - [x] System prompt built from FITNESS_COACHING_SKILL.md per coaching style
  - [x] useChat hook with streaming fetch via ReadableStream
  - [x] ChatMessage + ChatInput components
  - [x] AgentChat container component (auto-scroll, empty state greeting)
  - [x] Integration into AgentPageContent (parse agentURI, render chat)
  - [ ] Conversation history stored in Supabase (deferred to TASK-009)
  - [x] `pnpm typecheck` passes
  - [x] `pnpm lint` passes
  - [x] `pnpm build` passes

#### TASK-008: Manual Testing + Mint Test Tokens
- **Priority**: P0
- **Scope**: `pnpm dev` testing, wallet connection, staking + agent registration
- **Started**: Session 8 (Feb 9, 2026)
- **Completed**: Session 10 (Feb 10, 2026)
- **Acceptance Criteria**:
  - [x] Run `pnpm dev`, all 5 routes render correctly (/, /staking, /agent, /pricing, /dashboard)
  - [x] Execute MintTestTokens script to mint 10K FIT to deployer
  - [x] Multi-wallet support (MetaMask, Coinbase, WalletConnect)
  - [x] Consolidate wallet buttons into single "Connect Wallet" dropdown
  - [x] Connect wallet on Base Sepolia and verify connection
  - [x] Agent registration works end-to-end on Base Sepolia (Agent #1 minted)
  - [x] Staking page reads show correct data from deployed contracts
  - [x] Complete stake flow with fixed auto-chain (10,000 FIT staked)
  - [x] Unstake flow test (500 FIT unstaked, 5% penalty to FeeCollector, tier dropped to Pro)
  - [x] Dashboard shows correct stats after staking + agent creation

#### TASK-007: Frontend Pages + Shared Layout
- **Priority**: P0
- **Scope**: Layout, agent UI, dashboard, Supabase scaffold
- **Completed**: Session 8 (Feb 9, 2026)
- **Acceptance Criteria**:
  - [x] Shared Navbar with responsive mobile menu
  - [x] Shared Footer with nav links
  - [x] Root layout includes Navbar + Footer (no per-page duplication)
  - [x] `/agent` route — register agent or view profile
  - [x] `/dashboard` route — overview of wallet, staking, agent
  - [x] Supabase client scaffold (`src/lib/supabase.ts` + types)
  - [x] MoltcoachIdentity ABI + address in `contracts.ts`
  - [x] Agent hooks (`useAgentReads`, `useRegisterAgent`)
  - [x] Toast notifications (sonner) on stake, unstake, agent registration
  - [x] `pnpm typecheck` passes
  - [x] `pnpm lint` passes
  - [x] `pnpm build` passes
  - [x] All changes committed + pushed

#### TASK-006: FIT Staking Contract
- **Priority**: P1
- **Scope**: `contracts/src/FitStaking.sol`, `contracts/test/FitStaking.t.sol`
- **Completed**: Session 5 (Feb 8, 2026)
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 62 tests (including 5 fuzz tests)
  - [x] Stake/unstake $FIT with ReentrancyGuard
  - [x] Staking tiers: Free(0), Basic(100), Pro(1K), Elite(10K)
  - [x] Early unstake (< 30 days) charges 5% penalty to ProtocolFeeCollector
  - [x] Normal unstake (≥ 30 days) has no penalty
  - [x] `forge coverage` shows 100% line coverage on contract

#### TASK-005: ProtocolFeeCollector Contract
- **Priority**: P0
- **Scope**: `contracts/src/fees/ProtocolFeeCollector.sol`, `contracts/test/ProtocolFeeCollector.t.sol`
- **Completed**: Session 4 (Feb 8, 2026)
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 61 tests (including 5 fuzz tests)
  - [x] Fee collection works for $FIT and USDC
  - [x] `distribute()` splits to 4 treasury wallets at correct ratios (40/30/20/10)
  - [x] Allocation update enforces sum = 10000 bps
  - [x] Transaction fee capped at 5% max
  - [x] Only owner can update fees and allocations
  - [x] All state changes emit events
  - [x] `forge coverage` shows 100% line coverage on contract

#### TASK-004: $FIT Token Contract
- **Priority**: P0
- **Scope**: `contracts/src/FitToken.sol`, `contracts/test/FitToken.t.sol`
- **Completed**: Session 4 (Feb 8, 2026)
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 50 tests (including 5 fuzz tests)
  - [x] Standard ERC-20 with mint/burn capabilities (ERC20Burnable + ERC20Permit)
  - [x] Owner-only minting (for move-to-earn rewards)
  - [x] 1B max supply, 100K/day emission cap enforced on-chain
  - [x] `forge coverage` shows 100% line coverage on contract

#### TASK-003: ERC-8004 Agent Identity Contract
- **Priority**: P1
- **Scope**: `contracts/src/MoltcoachIdentity.sol`, `contracts/test/MoltcoachIdentity.t.sol`
- **Completed**: Session 3 (Feb 8, 2026)
- **Commit**: `a4adcfd`
- **Acceptance Criteria**:
  - [x] `forge build` passes with zero warnings
  - [x] `forge test` passes all 43 tests (including 3 fuzz tests)
  - [x] Contract implements ERC-8004 Identity Registry interface (register, metadata, wallet, URI)
  - [x] Agent creation mints ERC-721 with agentURI
  - [x] Only wallet owner can create their agent (1-per-wallet constraint)
  - [x] `forge coverage` shows 98.67% line coverage on contract

#### TASK-001: Scaffold Next.js App
- **Priority**: P0
- **Scope**: Root project setup
- **Completed**: Session 2 (Feb 7, 2026)
- **Commit**: `97cbf6d`
- **Acceptance Criteria**:
  - [x] `pnpm dev` starts Next.js dev server without errors
  - [x] `pnpm typecheck` passes with zero errors
  - [x] `pnpm lint` passes
  - [x] App Router structure in place (`app/` directory)
  - [x] TailwindCSS + shadcn/ui configured
  - [x] `.env.example` committed with all required vars (empty)

#### TASK-002: Coinbase Smart Wallet Integration
- **Priority**: P0
- **Scope**: `src/config/`, `src/components/`
- **Completed**: Session 2 (Feb 7, 2026)
- **Commit**: `46cdc47`
- **Acceptance Criteria**:
  - [x] Coinbase Smart Wallet connects successfully on Base Sepolia
  - [x] Connected address displayed in header (truncated)
  - [x] Disconnect clears session and state
  - [x] Wrong network triggers chain switch to Base Sepolia
  - [x] Connection persists across page refresh
  - [x] `pnpm typecheck` passes
