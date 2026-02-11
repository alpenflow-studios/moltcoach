# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-10
- **Duration**: Session 13
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 13 (This Session)

1. **ERC-8128 agent auth infrastructure** — `cf10ca9 feat(hub): add ERC-8128 agent auth infrastructure + Agent Hub + wire landing page buttons`
   - Installed `@slicekit/erc8128` ^0.1.0
   - Created `src/lib/nonce-store.ts` — Upstash Redis NonceStore (erc8128:nonce: prefix, graceful degradation)
   - Created `src/lib/verify-agent.ts` — Server-side ERC-8128 verifier (lazy init, baseSepolia, clawcoach label)
   - Created `src/lib/agent-auth.ts` — Agent-side signing client (SDK reference for developers)
   - Created `src/middleware/agent-auth.ts` — `verifyAgentRequest()` middleware (ERC-8128 sig → ERC-8004 on-chain check)

2. **Agent Hub page at `/hub`** — 8 new files
   - `src/types/agent-hub.ts` — HubAgent type
   - `src/hooks/useHubAgents.ts` — Fetches all Registered events from ERC-8004 contract, resolves tokenURI per agent
   - `src/components/hub/HubHeader.tsx` — Terminal-inspired header with `>_` prompt, ERC-8128 badge
   - `src/components/hub/HubStatsBar.tsx` — Total Agents / ERC-8128 Verified / Network stats row
   - `src/components/hub/HubAgentCard.tsx` — Agent card (name, ID, style, owner, BaseScan link)
   - `src/components/hub/HubRegisterCTA.tsx` — Developer registration section with code examples + spec links
   - `src/components/hub/HubPageContent.tsx` — Client orchestrator (loading/error/empty/grid states)
   - `src/app/hub/page.tsx` + `loading.tsx` + `error.tsx`

3. **Protected API routes** — 3 new endpoints
   - `GET /api/v1/agents` — Public agent listing from chain events (no auth)
   - `POST /api/v1/agents/verify` — ERC-8128 authenticated agent identity verification
   - `POST /api/v1/workouts` — ERC-8128 authenticated workout logging (storage pending TASK-009)

4. **TASK-011: Landing page buttons wired**
   - "I AM HUMAN" → `/agent` (human onboarding path)
   - "I AM NOT" → `/hub` (agent hub, ERC-8128 pathway)
   - "Purchase $FIT" → `/staking`

5. **Navigation updated** — Hub link added to Navbar (between Agent and Pricing) and Footer

6. **Upstash Redis credentials configured** — Michael added `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to `.env.local`. Rate limiting and nonce store now live.

7. **All checks pass**: typecheck, lint, build (22 files changed, 814 insertions)

### Session 12 (Previous)

- Rebrand moltcoach → ClawCoach complete
- Per-wallet rate limiting shipped (Upstash Redis, 50/hr + 200/day)
- Navbar/Footer logo text fixed
- ERC-8128 doc reviewed (docs/ERC-8128.md)

### Session 11

- TASK-010 completed (AgentChat container, streaming chat end-to-end)
- Rebrand started, Anthropic API key configured

### Sessions 1-10

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment + verification, shared layout, agent creation, dashboard, toast notifications, 10K FIT minted, multi-wallet support, landing page, pricing page, staking flows verified

---

## What's In Progress

- Nothing actively in progress. Session ended clean.

---

## What's Next

1. **TASK-009: Supabase integration** — Michael setting up project. Wire user records + chat persistence + workout storage.
2. **Chat persistence** — Store conversation history in Supabase (after TASK-009). Currently React state only.
3. **Workout storage** — `/api/v1/workouts` route returns success but doesn't persist yet. Wire to Supabase `workouts` table.
4. **Vercel password protection** — Dashboard toggle for beta gate (not code).
5. **Pricing page — ETH/USDC pricing** — Michael flagged this.
6. **Privy integration** — Email/social onboarding. "Sign up with your email" button is non-functional.
7. **XMTP + Telegram buttons** — Landing page comms section buttons are non-functional stubs.
8. **Wearable integration** — Strava OAuth flow (likely first wearable).
9. **ERC-8128 Phase 2** — Agent runtime that actually signs requests. Current infra is server-side verification only. Need agent runtime + Coinbase Smart Wallet signing.
10. **Agent-to-agent communication** — ERC-8128 is auth layer, comms layer TBD.

---

## Decisions Made

- **Theme**: Dark mode default, lime primary accent on zinc base
- **wagmi version**: v3.4.2 (latest)
- **Wallet strategy**: Multi-wallet — injected (MetaMask) + Coinbase Smart Wallet + WalletConnect. Privy planned for production.
- **ERC-8004**: Custom non-upgradeable implementation (not reference UUPS)
- **ERC-8128**: Launched at launch (not Phase 2). Infrastructure built in Session 13. Uses `@slicekit/erc8128` ^0.1.0, Upstash Redis nonce store. See `docs/ERC-8128.md`.
- **Agent Hub**: `/hub` route — reads agents from ERC-8004 contract events (no Supabase dependency)
- **Agent Hub UX**: Terminal-inspired header, agent card grid, developer registration CTA with code examples
- **API versioning**: `/api/v1/` prefix for agent-facing endpoints (separate from `/api/chat` human-facing)
- **Agent verification flow**: ERC-8128 signature → ERC-8004 on-chain registry check → authenticated
- **Graceful degradation**: All ERC-8128 infra follows same pattern as rateLimit.ts — lazy init, env check, permissive fallback
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
- **Approve flow**: Auto-chained approve→stake (fixed in Session 9)
- **Staking route**: Dedicated `/staking` (not `/dashboard`)
- **tsconfig target**: ES2020 (for BigInt literals)
- **Layout**: Shared Navbar + Footer in root layout, pages render content only
- **Agent URI**: `data:application/json,` encoded URI with name, style, version, category
- **Coaching styles**: 4 options — Motivator, Drill Sergeant, Scientist, Friend
- **Toaster**: sonner with hardcoded dark theme (no next-themes dep)
- **Supabase types**: Manual types in `src/types/database.ts` (will replace with generated types later)
- **Farcaster**: "Forged on Farcaster" badge on landing page hero
- **ConnectWallet**: Single button with shadcn DropdownMenu, connectors deduplicated by name
- **Pricing tiers**: Free/Basic(100)/Pro(1000)/Elite(10000) — may change to ETH/USDC pricing later
- **Landing page CTAs**: "I AM HUMAN" → `/agent`, "I AM NOT" → `/hub`, "Purchase $FIT" → `/staking`
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

- [x] Upstash Redis credentials — configured in .env.local (Session 13)
- [ ] Supabase project — Michael setting up with Claude.ai
- [x] WalletConnect project ID — obtained from cloud.walletconnect.com
- [ ] Coinbase Wallet project ID — needs to be obtained from developer portal
- [x] "I AM NOT HUMAN" agent hub — built at `/hub` with ERC-8128 infrastructure (Session 13)
- [ ] Agent-to-agent protocol at clawcoach.ai (ERC-8128 is auth layer, comms layer TBD)
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
- `pnpm typecheck`: **PASSES** (verified Session 13)
- `pnpm lint`: **PASSES** (verified Session 13)
- `pnpm build`: **PASSES** (verified Session 13, 11 routes including 4 new)

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
- **Upstash Redis**: Fully configured in `.env.local` as of Session 13. Rate limiting + nonce store both live.

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
| @slicekit/erc8128 | ^0.1.0 | node_modules |
| sonner | latest | node_modules |
| @radix-ui/react-dropdown-menu | latest | node_modules (via shadcn) |

---

## Key Files Added in Session 13

| File | Purpose |
|------|---------|
| `src/lib/nonce-store.ts` | Upstash Redis NonceStore for ERC-8128 replay protection |
| `src/lib/verify-agent.ts` | Server-side ERC-8128 verifier (lazy init) |
| `src/lib/agent-auth.ts` | Agent-side signing client (SDK/docs) |
| `src/middleware/agent-auth.ts` | `verifyAgentRequest()` — ERC-8128 sig + ERC-8004 check |
| `src/types/agent-hub.ts` | HubAgent type |
| `src/hooks/useHubAgents.ts` | Fetch agents from chain via Registered events |
| `src/components/hub/*.tsx` | 5 Hub UI components |
| `src/app/hub/*.tsx` | Hub route (page + loading + error) |
| `src/app/api/v1/agents/route.ts` | Public agent listing API |
| `src/app/api/v1/agents/verify/route.ts` | ERC-8128 agent verification API |
| `src/app/api/v1/workouts/route.ts` | ERC-8128 workout logging API |

---

*Last updated: Feb 10, 2026 — Session 13*
