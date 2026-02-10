# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-09
- **Duration**: Session 9
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 9 (This Session)

1. **ConnectWallet consolidation** — Deduplicated wagmi connectors by name and replaced 6 separate buttons with a single "Connect Wallet" dropdown using shadcn `DropdownMenu`. Installed `dropdown-menu` component.

2. **Staking UX fix** — Diagnosed that Michael's "successful stake" was actually only an approval — the 2-step approve→stake flow required a manual second click that was easy to miss. Fixed `useStakeAction` to auto-chain the stake tx after approval confirms. One button click, two wallet popups, no missed steps.

3. **On-chain verification** — Used `cast` to verify:
   - Agent #1 registered by deployer (name: "daddy", style: "motivator", category: "fitness")
   - FIT allowance to staking contract: 10,000 (approve went through)
   - Actual staked amount: 0 (stake tx was never sent — now fixed)

4. **Hero orb** — Added a breathing green/white glow effect behind "Your AI Coach. On-Chain." on the landing page. Three layers: green core (6s breathe), white halo (8s drift), conic ring (20s rotate). All CSS animations.

5. **Pricing page** — New `/pricing` route with 4 staking tier cards (Free/Basic/Pro/Elite), feature lists, stake amounts, CTAs linking to /staking. Added to navbar between Agent and Dashboard.

6. **Landing page layout** — Added:
   - "I AM HUMAN" / "I AM NOT" pill buttons (placeholder, will wire to onboarding flows)
   - "Purchase $FIT" large pill button (placeholder, will wire to DEX/purchase flow)
   - "Don't have a wallet? Sign up with your email" text in How it Works (placeholder for Privy)
   - Removed `overflow-hidden` from hero so orb glow extends seamlessly

7. **8 commits pushed** this session, all on `main`

### Session 8 (Previous)

- Finished TASK-007 toasts, minted 10K FIT, multi-wallet support, Farcaster badge, WalletConnect setup

### Sessions 1-7

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment + verification, shared layout, agent creation, dashboard, toast notifications

---

## What's In Progress

**TASK-008 — Manual Testing** (~75% complete):
- [x] All routes render (/, /staking, /agent, /dashboard, /pricing)
- [x] FIT minted (10K to deployer)
- [x] Multi-wallet support
- [x] ConnectWallet consolidated into dropdown
- [x] Staking approve→stake flow fixed (auto-chains)
- [x] Agent #1 registered on-chain
- [ ] Complete staking flow test (approve already done, need to stake + verify on-chain)
- [ ] Unstake flow test (after successful stake)
- [ ] Dashboard shows correct stats after staking + agent creation

---

## What's Next

1. **Finish TASK-008** — Michael needs to re-test staking now that the auto-chain fix is in. Allowance is already set, so "Stake 10000 FIT" should work directly.
2. **Wire placeholder buttons** — "I AM HUMAN"/"I AM NOT", "Purchase $FIT", email sign-up link
3. **Pricing page — ETH/USDC pricing** — Michael noted tiers will need real currency pricing, not just FIT stake amounts
4. **TASK-009: Supabase integration** — If Michael has DB ready
5. **TASK-010: Agent coaching chat** — Claude API integration
6. **Privy integration** — For email/social onboarding (placeholder already in landing page)
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

## Key Files (Session 9 — Modified/Created)

| File | Change |
|------|--------|
| `src/components/ConnectWallet.tsx` | **MODIFIED** — Single dropdown with deduplicated connectors |
| `src/components/ui/dropdown-menu.tsx` | **NEW** — shadcn dropdown-menu component |
| `src/hooks/useStakeAction.ts` | **MODIFIED** — Auto-chains stake after approval via useEffect |
| `src/components/staking/StakeForm.tsx` | **MODIFIED** — Simplified (removed manual "approved" step) |
| `src/app/page.tsx` | **MODIFIED** — Hero orb, pill buttons, Purchase $FIT, email sign-up |
| `src/app/globals.css` | **MODIFIED** — Orb animation keyframes (breathe, drift, rotate) |
| `src/app/pricing/page.tsx` | **NEW** — Pricing page with 4 staking tier cards |
| `src/components/Navbar.tsx` | **MODIFIED** — Added /pricing link |

---

## On-Chain State (Base Sepolia)

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT total supply**: 10,000 FIT (minted in Session 8)
- **FIT daily mint remaining**: 90,000 FIT
- **Agent #1 registered**: owner=deployer, name="daddy", style="motivator"
- **FIT allowance to staking**: 10,000 FIT (approve succeeded, stake pending)
- **Staked amount**: 0 (Michael needs to re-test with fixed flow)

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/` — add to PATH: `export PATH="/Users/openclaw/.foundry/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`
- **pnpm**: `/opt/homebrew/bin/pnpm` (v10.29.1)
- **forge commands**: Must run from `contracts/` directory (or use `cd contracts &&`)
- **forge .env loading**: Use `export $(grep -v '^#' .env | xargs)` before forge commands (source .env fails on macOS)
- **ESLint**: `contracts/**` excluded in `eslint.config.mjs` (OZ JS files caused 1000+ errors)
- **Git**: Remote gets "Add files via upload" commits from GitHub web UI — always `git fetch` + rebase before push
- **tsconfig**: Target `ES2020` (changed from ES2017 in Session 6 for BigInt support)
- **All committed + pushed** — working tree clean

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

*Last updated: Feb 9, 2026 — Session 9*
