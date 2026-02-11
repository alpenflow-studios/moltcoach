# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-10
- **Duration**: Session 12
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 12 (This Session)

1. **Rebrand commit pushed** — `38e384e chore(rebrand): rename moltcoach → ClawCoach`
   - 26 files changed across src/, docs/, config
   - Verified: `grep -ri "moltcoach" src/` returns zero hits
   - Solidity contracts intentionally unchanged (testnet, documented for mainnet)

2. **Beta prep: per-wallet rate limiting** — `6c455c1 feat(chat): add per-wallet rate limiting for beta prep`
   - Installed `@upstash/redis` ^1.36.2 + `@upstash/ratelimit` ^2.0.8
   - Created `src/lib/rateLimit.ts` — dual sliding window (50 msgs/hr + 200 msgs/day per wallet)
   - Threaded wallet address from `AgentPageContent` → `AgentChat` → `useChat` → `X-Wallet-Address` header → `/api/chat` route
   - 429 response with `Retry-After` header when limit exceeded
   - Graceful fallback: if Upstash not configured, rate limiting disabled (local dev works)
   - All checks pass: typecheck, lint, build

3. **ERC-8128 doc reviewed** — `docs/ERC-8128.md` added by Michael via GitHub
   - Signed HTTP Requests with Ethereum — agents authenticate via wallet signatures
   - Excellent fit for Phase 2 (autonomous agent actions, agent-to-agent comms)
   - NOT needed for beta — current agents don't make their own HTTP requests
   - Nonce store uses same Upstash Redis we just set up for rate limiting
   - "I AM NOT HUMAN" button concept: agent hub entry point (ERC-8128 authenticated)

### Session 11 (Previous)

- TASK-010 completed (AgentChat container, streaming chat working end-to-end)
- Rebrand: moltcoach → ClawCoach (all frontend + docs, Solidity deferred)
- Anthropic API key configured

### Session 10

- TASK-008 completed (staking flows verified)
- TASK-010 ~70% coded

### Sessions 1-9

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment + verification, shared layout, agent creation, dashboard, toast notifications, 10K FIT minted, multi-wallet support, landing page, pricing page

---

## What's In Progress

- **Upstash Redis setup** — Michael creating database at console.upstash.com. Need `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in `.env.local`. Code is ready, just needs credentials.

---

## What's Next

1. **Upstash Redis credentials** → paste into `.env.local` → rate limiting goes live
2. **Vercel password protection** — Dashboard toggle, not code. Gate beta deployment.
3. **TASK-009: Supabase integration** — Michael setting up project, then wire user records + chat persistence
4. **TASK-011: Wire landing page buttons** — Two paths now clarified:
   - "I AM HUMAN" → Human onboarding (connect wallet → create agent → coaching)
   - "I AM NOT" → Agent hub (placeholder for beta, ERC-8128 authenticated in Phase 2)
5. **ERC-8128 integration (Phase 2)** — Agent-side signing, server-side verification, nonce store. See `docs/ERC-8128.md` for full spec. Dependencies: agent runtime, Supabase agents table.
6. **Chat persistence** — Store conversation history in Supabase (after TASK-009)
7. **Pricing page — ETH/USDC pricing**
8. **Privy integration** — For email/social onboarding
9. **Wearable integration** — Strava OAuth flow

---

## Decisions Made

- **Theme**: Dark mode default, lime primary accent on zinc base
- **wagmi version**: v3.4.2 (latest)
- **Wallet strategy**: Multi-wallet — injected (MetaMask) + Coinbase Smart Wallet + WalletConnect. Privy planned for production.
- **ERC-8004**: Custom non-upgradeable implementation (not reference UUPS)
- **ERC-8128**: Planned for Phase 2 agent authentication. Uses `@slicekit/erc8128` package, Upstash Redis nonce store. See `docs/ERC-8128.md`.
- **Agent IDs**: Start at 1, 0 = sentinel for "no agent"
- **Revenue model**: 9 streams, Stage 1 MVP focuses on 3 (tx fees, spawn fee, validation fees)
- **Treasury split**: 40/30/20/10 (dev/buyback/community/insurance)
- **Contract deploy order**: FIT → FeeCollector → Staking → Identity
- **$FIT daily cap**: Adjustable between 10K-500K by owner (default 100K)
- **Staking penalty**: 5% constant (not adjustable), routed to FeeCollector (not burned)
- **stakedAt timer**: Not reset on top-up, only on full unstake + restake
- **Penalty routing**: forceApprove + collectFitFee pattern (preserves FeeCollector tracking)
- **Deploy wallet**: MetaMask for development, Coinbase Wallet for funds
- **Staking UI ABI strategy**: Minimal `as const` ABIs in TypeScript (not Foundry JSON artifacts)
- **Approve flow**: Auto-chained approve→stake (fixed in Session 9, was broken 2-click before)
- **Staking route**: Dedicated `/staking` (not `/dashboard`)
- **tsconfig target**: ES2020 (was ES2017, needed for BigInt literals)
- **Layout**: Shared Navbar + Footer in root layout, pages render content only
- **Agent URI**: `data:application/json,` encoded URI with name, style, version, category
- **Coaching styles**: 4 options — Motivator, Drill Sergeant, Scientist, Friend
- **Toaster**: sonner with hardcoded dark theme (no next-themes dep)
- **Supabase types**: Manual types in `src/types/database.ts` (will replace with generated types later)
- **Farcaster**: "Forged on Farcaster" badge on landing page hero
- **ConnectWallet**: Single button with shadcn DropdownMenu, connectors deduplicated by name
- **Pricing tiers**: Free/Basic(100)/Pro(1000)/Elite(10000) — may change to ETH/USDC pricing later
- **Landing page CTAs**: "I AM HUMAN" = human onboarding, "I AM NOT" = agent hub (ERC-8128 pathway)
- **Chat model**: claude-sonnet-4-5-20250929 for coaching responses (fast + capable)
- **Chat architecture**: No external chat library — native fetch + ReadableStream for streaming
- **Chat persistence**: React state only for now (no Supabase yet — TASK-009)
- **Chat location**: Below AgentProfileCard on `/agent` page (not separate route)
- **System prompt**: Built from FITNESS_COACHING_SKILL.md content, customized per coaching style
- **Brand name**: ClawCoach (rebranded from moltcoach in Session 11)
- **Primary domain**: clawcoach.ai (also owns clawcoach.dev, clawcoach.xyz, klawcoach)
- **Contract rename**: Deferred to mainnet prep (testnet contracts keep "Moltcoach" names)
- **Beta strategy**: Vercel password protection + per-wallet rate limiting (50/hr, 200/day)
- **Rate limiting**: Upstash Redis sliding window, graceful fallback when unconfigured

---

## Open Questions

- [ ] Upstash Redis credentials — Michael setting up at console.upstash.com
- [ ] Supabase project — Michael setting up with Claude.ai
- [x] WalletConnect project ID — obtained from cloud.walletconnect.com
- [ ] Coinbase Wallet project ID — needs to be obtained from developer portal
- [ ] "I AM NOT HUMAN" agent hub — placeholder UX for beta, full ERC-8128 auth in Phase 2
- [ ] Agent-to-agent protocol at clawcoach.ai (ERC-8128 is the auth layer, what's the comms layer?)
- [ ] Which wearable integration first? (Strava likely easiest)
- [ ] Spawn fee: USDC or $FIT or both? (revenue_model.md says both)
- [ ] Privy free tier limits for production auth
- [ ] Pricing in ETH/Base ETH/USDC — Michael flagged this for tiers
- [ ] Purchase $FIT mechanism — DEX pool, in-app swap, or external link?
- [ ] Beta invite distribution — how to find 100 testers?
- [ ] ERC-8128 `keyid` format may change (draft ERC) — monitor Ethereum Magicians thread

---

## State of Tests

- `forge test` (contracts/): **216 tests pass** (62 FitStaking + 61 FeeCollector + 50 FitToken + 43 MoltcoachIdentity)
- `forge build`: Compiles (pre-existing notes/warnings only, no errors)
- `pnpm typecheck`: **PASSES** (verified Session 12)
- `pnpm lint`: **PASSES** (verified Session 12)
- `pnpm build`: **PASSES** (verified Session 12)

---

## On-Chain State (Base Sepolia)

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT total supply**: 10,000 FIT (minted in Session 8)
- **FIT daily mint remaining**: 90,000 FIT
- **Agent #1 registered**: owner=deployer, name="daddy", style="motivator"
- **FIT wallet balance**: 475 FIT (unstaked 500, got 475 after 5% penalty)
- **Staked amount**: 9,500 FIT
- **Staking tier**: Pro (2)
- **FeeCollector balance**: 25 FIT (from early unstake penalty)
- **Protocol total staked**: 9,500 FIT

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/` — add to PATH: `export PATH="/Users/openclaw/.foundry/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`
- **pnpm**: `/opt/homebrew/bin/pnpm` (v10.29.1)
- **forge commands**: Must run from `contracts/` directory (or use `cd contracts &&`)
- **forge .env loading**: Use `export $(grep -v '^#' .env | xargs)` before forge commands (source .env fails on macOS)
- **ESLint**: `contracts/**` excluded in `eslint.config.mjs` (OZ JS files caused 1000+ errors)
- **Git**: Remote gets "Add files via upload" commits from GitHub web UI — always `git fetch` + rebase before push
- **tsconfig**: Target `ES2020` (changed from ES2017 in Session 6 for BigInt support)
- **Project path**: `~/Projects/moltcoach` (repo name unchanged, brand is ClawCoach)
- **ANTHROPIC_API_KEY**: Set in `.env.local` — working as of Session 11
- **Upstash Redis**: Packages installed (`@upstash/redis` ^1.36.2, `@upstash/ratelimit` ^2.0.8). Credentials NOT yet in `.env.local` — Michael setting up.

---

## Installed Tools & Packages

| Tool/Package | Version | Location |
|-------------|---------|----------|
| forge | 1.5.1 | `~/.foundry/bin/forge` |
| cast | 1.5.1 | `~/.foundry/bin/cast` |
| anvil | 1.5.1 | `~/.foundry/bin/anvil` |
| OpenZeppelin | 5.2.0 | `contracts/lib/openzeppelin-contracts/` |
| forge-std | latest | `contracts/lib/forge-std/` |
| next | 16.1.6 | node_modules |
| wagmi | 3.4.2 | node_modules |
| viem | 2.45.1 | node_modules |
| @supabase/supabase-js | 2.95.3 | node_modules |
| @anthropic-ai/sdk | ^0.74.0 | node_modules |
| @upstash/redis | ^1.36.2 | node_modules |
| @upstash/ratelimit | ^2.0.8 | node_modules |
| sonner | latest | node_modules |
| @radix-ui/react-dropdown-menu | latest | node_modules (via shadcn) |

---

*Last updated: Feb 10, 2026 — Session 12*
