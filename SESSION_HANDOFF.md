# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-10
- **Duration**: Session 11
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 11 (This Session)

1. **TASK-010 completed** — Agent coaching chat fully working:
   - Built `src/components/agent/AgentChat.tsx` — main chat container with auto-scroll, style-specific greetings, error toasts
   - Modified `src/components/agent/AgentPageContent.tsx` — parses agentURI, renders AgentChat below profile card
   - All checks pass: `pnpm typecheck`, `pnpm lint`, `pnpm build`
   - Manual test: chatted with Agent #1 ("daddy", motivator style), streaming works end-to-end
   - Committed + pushed: `5dbdd1c feat(chat): add AgentChat container + wire into agent page (TASK-010)`

2. **Rebrand: moltcoach → ClawCoach** — Full frontend + documentation rebrand:
   - All `src/` files: page titles, UI copy, system prompt, wagmi config, variable names
   - `MOLTCOACH_IDENTITY_ADDRESS` → `CLAWCOACH_IDENTITY_ADDRESS` (env var + code)
   - `moltcoachIdentityAbi` → `clawcoachIdentityAbi`
   - `package.json` name: `moltcoach` → `clawcoach`
   - `.env.local` + `.env.example` updated
   - All documentation files rebranded
   - Primary domain: `clawcoach.ai` (also owns clawcoach.dev, clawcoach.xyz, klawcoach)
   - Solidity contracts NOT renamed (testnet only — documented for mainnet prep)
   - GitHub repo name stays `alpenflow-studios/moltcoach`

3. **Anthropic API key set up** — `ANTHROPIC_API_KEY` configured in `.env.local`

### Session 10 (Previous)

- TASK-008 completed (all staking flows verified end-to-end)
- TASK-010 ~70% coded (8 new files, 595 lines added)
- 2 commits pushed to main

### Sessions 1-9

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment + verification, shared layout, agent creation, dashboard, toast notifications, 10K FIT minted, multi-wallet support, landing page, pricing page

---

## What's In Progress

Nothing currently in progress. TASK-010 is complete.

---

## What's Next

1. **Beta preparation** — Rate limit `/api/chat` (per-wallet caps, Upstash Redis), Vercel password protection
2. **TASK-009: Supabase integration** — Michael setting up project, then wire user records + chat persistence
3. **TASK-011: Wire landing page placeholders** — "I AM HUMAN"/"I AM NOT", "Purchase $FIT", email sign-up
4. **Chat persistence** — Store conversation history in Supabase (after TASK-009)
5. **Pricing page — ETH/USDC pricing** — Michael noted tiers will need real currency pricing
6. **Privy integration** — For email/social onboarding
7. **Wearable integration** — Strava OAuth flow

---

## Decisions Made

- **Theme**: Dark mode default, lime primary accent on zinc base
- **wagmi version**: v3.4.2 (latest)
- **Wallet strategy**: Multi-wallet — injected (MetaMask) + Coinbase Smart Wallet + WalletConnect. Privy planned for production.
- **ERC-8004**: Custom non-upgradeable implementation (not reference UUPS)
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
- **Landing page CTAs**: "I AM HUMAN"/"I AM NOT" pills, "Purchase $FIT" button, email sign-up link (all placeholders)
- **Chat model**: claude-sonnet-4-5-20250929 for coaching responses (fast + capable)
- **Chat architecture**: No external chat library — native fetch + ReadableStream for streaming
- **Chat persistence**: React state only for now (no Supabase yet — TASK-009)
- **Chat location**: Below AgentProfileCard on `/agent` page (not separate route)
- **System prompt**: Built from FITNESS_COACHING_SKILL.md content, customized per coaching style
- **Brand name**: ClawCoach (rebranded from moltcoach in Session 11)
- **Primary domain**: clawcoach.ai (also owns clawcoach.dev, clawcoach.xyz, klawcoach)
- **Contract rename**: Deferred to mainnet prep (testnet contracts keep "Moltcoach" names)
- **Beta strategy**: Vercel password protection first, invite codes after Supabase

---

## Open Questions

- [ ] Supabase project — Michael setting up with Claude.ai
- [x] WalletConnect project ID — obtained from cloud.walletconnect.com
- [ ] Coinbase Wallet project ID — needs to be obtained from developer portal
- [ ] XMTP vs Telegram priority for agent comms
- [ ] Agent-to-agent protocol at clawcoach.ai
- [ ] Which wearable integration first? (Strava likely easiest)
- [ ] Spawn fee: USDC or $FIT or both? (revenue_model.md says both)
- [ ] Privy free tier limits for production auth
- [ ] Pricing in ETH/Base ETH/USDC — Michael flagged this for tiers
- [ ] What do "I AM HUMAN" and "I AM NOT" buttons do? (onboarding paths?)
- [ ] Purchase $FIT mechanism — DEX pool, in-app swap, or external link?
- [ ] Beta invite distribution — how to find 100 testers?

---

## State of Tests

- `forge test` (contracts/): **216 tests pass** (62 FitStaking + 61 FeeCollector + 50 FitToken + 43 MoltcoachIdentity)
- `forge build`: Compiles (pre-existing notes/warnings only, no errors)
- `pnpm typecheck`: **PASSES** (verified Session 11)
- `pnpm lint`: **PASSES** (verified Session 11)
- `pnpm build`: **PASSES** (verified Session 11)

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
- **Duplicate env var**: Cleaned up in Session 11 (was `ANTHROPIC_API_KEY` defined twice)

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
| sonner | latest | node_modules |
| @radix-ui/react-dropdown-menu | latest | node_modules (via shadcn) |

---

*Last updated: Feb 10, 2026 — Session 11*
