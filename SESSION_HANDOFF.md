# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-10
- **Duration**: Session 10
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 10 (This Session)

1. **TASK-008 completed** — Finished all remaining manual testing items:
   - Fixed stale Next.js process + lock file after project move from `~/moltcoach` → `~/Projects/moltcoach`
   - Verified all 5 routes render (/, /staking, /agent, /dashboard, /pricing)
   - Confirmed no hardcoded paths in codebase (only stale `.claude/settings.local.json` entries)
   - Staked 10,000 FIT successfully (auto-chain approve→stake flow works)
   - Unstaked 500 FIT — 5% early penalty (25 FIT) correctly routed to FeeCollector, 475 FIT returned to wallet
   - Tier correctly dropped from Elite → Pro after unstake
   - Dashboard displays correct stats (staking, tier, agent)

2. **On-chain verification** — All contract interactions confirmed working end-to-end via frontend + `cast` checks

3. **No code changes this session** — purely testing + doc updates

### Session 9 (Previous)

- ConnectWallet dropdown consolidation, staking UX fix (auto-chain approve→stake), hero orb, pricing page, landing page pill buttons + placeholders, 8 commits

### Sessions 1-8

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment + verification, shared layout, agent creation, dashboard, toast notifications, 10K FIT minted, multi-wallet support

---

## What's In Progress

> Nothing currently in progress. TASK-008 completed this session.

---

## What's Next

1. **TASK-009: Supabase integration** — Depends on Michael completing Supabase project setup
2. **TASK-010: Agent coaching chat** — Claude API integration, chat UI
3. **TASK-011: Wire landing page placeholders** — "I AM HUMAN"/"I AM NOT", "Purchase $FIT", email sign-up
4. **Pricing page — ETH/USDC pricing** — Michael noted tiers will need real currency pricing, not just FIT stake amounts
5. **Privy integration** — For email/social onboarding (placeholder already in landing page)
6. **Wearable integration** — Strava OAuth flow

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

---

## Open Questions

- [ ] Supabase project — Michael setting up with Claude.ai
- [x] WalletConnect project ID — obtained from cloud.walletconnect.com
- [ ] Coinbase Wallet project ID — needs to be obtained from developer portal
- [ ] XMTP vs Telegram priority for agent comms
- [ ] Agent-to-agent protocol at moltcoach.xyz
- [ ] Which wearable integration first? (Strava likely easiest)
- [ ] Spawn fee: USDC or $FIT or both? (revenue_model.md says both)
- [ ] Privy free tier limits for production auth
- [ ] Pricing in ETH/Base ETH/USDC — Michael flagged this for tiers
- [ ] What do "I AM HUMAN" and "I AM NOT" buttons do? (onboarding paths?)
- [ ] Purchase $FIT mechanism — DEX pool, in-app swap, or external link?

---

## State of Tests

- `forge test` (contracts/): **216 tests pass** (62 FitStaking + 61 FeeCollector + 50 FitToken + 43 MoltcoachIdentity)
- `forge build`: Compiles (pre-existing notes/warnings only, no errors)
- `pnpm typecheck`: PASSES
- `pnpm lint`: PASSES
- `pnpm build`: PASSES (5 routes: /, /staking, /agent, /pricing, /dashboard)

---

## Key Files (Session 10 — No Code Changes)

> No source code modified this session. Session 10 was testing + documentation only.
> See Session 9 key files in git log for last code changes.

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
- **Project path**: Moved from `~/moltcoach` → `~/Projects/moltcoach` (no code changes needed, all paths relative)
- **All committed + pushed** — working tree clean (doc updates pending commit)

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
| sonner | latest | node_modules |
| @radix-ui/react-dropdown-menu | latest | node_modules (via shadcn) |

---

*Last updated: Feb 10, 2026 — Session 10*
