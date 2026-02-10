# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-09
- **Duration**: Session 8
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 8 (This Session)

1. **Finished TASK-007** — Added toast notifications to UnstakeForm and RegisterAgentForm (the last 2 items from Session 7). Committed + pushed all Session 7 work in 2 commits (docs + code).

2. **TASK-008 started — Manual testing + Mint tokens**:
   - `pnpm dev` verified: all 4 routes return HTTP 200 (/, /staking, /agent, /dashboard)
   - **Minted 10,000 FIT** to deployer (`0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`) on Base Sepolia via MintTestTokens script
   - `contracts/.env` created with deployer PRIVATE_KEY (gitignored)

3. **Multi-wallet support** — Expanded wallet connection beyond Coinbase Smart Wallet only:
   - Added `injected()` connector (MetaMask, Brave, etc.)
   - Added `walletConnect()` connector (conditionally, needs project ID)
   - Michael created WalletConnect Cloud project, got project ID, added to `.env.local`
   - ConnectWallet component updated to show per-connector buttons

4. **Farcaster badge** — Added "Forged on Farcaster" pill with inline SVG Farcaster logo in Farcaster purple (`#8A63D2`) above the existing "Built on Base" badge on landing page.

5. **WalletConnect Cloud setup** — Michael created project at cloud.walletconnect.com, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` added to `.env.local` and `.env.example`.

### Session 7 (Previous)

- Shared Navbar/Footer, Agent Creation UI, Dashboard, Supabase scaffold, toast notifications, MoltcoachIdentity ABI + hooks, MintTestTokens script

### Sessions 1-6

- Dev environment, scaffold, wallet, 4 contracts (Identity, FIT, FeeCollector, Staking), 216 tests, staking UI, Base Sepolia deployment + verification

---

## What's In Progress

**ConnectWallet consolidation** — Currently shows 6 separate wallet buttons (wagmi detects duplicates from injected). Needs to be consolidated into a single "Connect Wallet" button that opens a dropdown/modal to pick wallet. This is the immediate next task.

---

## What's Next

1. **Consolidate wallet buttons** — Single "Connect Wallet" → dropdown with wallet options (deduplicate injected connectors)
2. **Manual wallet testing** — Connect MetaMask, test staking flow with minted FIT, test agent registration on Base Sepolia
3. **Test all pages connected** — Staking reads, dashboard stats, agent creation end-to-end
4. **TASK-009: Supabase integration** — If Michael has DB ready
5. **TASK-010: Agent coaching chat** — Claude API integration
6. **Privy integration** — For production onboarding (email + social + wallets), planned for pre-launch
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
- **Approve flow**: 2-tx approve→stake (not ERC20Permit) for Smart Wallet reliability
- **Staking route**: Dedicated `/staking` (not `/dashboard`) — dashboard later when more features exist
- **tsconfig target**: ES2020 (was ES2017, needed for BigInt literals)
- **Layout**: Shared Navbar + Footer in root layout, pages render content only (no per-page headers)
- **Agent URI**: `data:application/json,` encoded URI with name, style, version, category
- **Coaching styles**: 4 options — Motivator, Drill Sergeant, Scientist, Friend
- **Toaster**: sonner with hardcoded dark theme (no next-themes dep)
- **Supabase types**: Manual types in `src/types/database.ts` (will replace with generated types later)
- **Farcaster**: "Forged on Farcaster" badge on landing page hero

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

---

## State of Tests

- `forge test` (contracts/): **216 tests pass** (62 FitStaking + 61 FeeCollector + 50 FitToken + 43 MoltcoachIdentity)
- `forge build`: Compiles (pre-existing notes/warnings only, no errors)
- `pnpm typecheck`: PASSES
- `pnpm lint`: PASSES
- `pnpm build`: PASSES (all 4 routes: /, /staking, /agent, /dashboard)

---

## Key Files (Session 8 — Modified)

| File | Change |
|------|--------|
| `src/config/wagmi.ts` | **MODIFIED** — Added injected + walletConnect connectors |
| `src/components/ConnectWallet.tsx` | **MODIFIED** — Shows per-connector buttons (needs consolidation) |
| `src/app/page.tsx` | **MODIFIED** — Added Farcaster badge + FarcasterIcon SVG |
| `.env.example` | **MODIFIED** — Added NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID |
| `src/components/staking/UnstakeForm.tsx` | **MODIFIED** — Added toast import + toast.success on unstake |
| `src/components/agent/RegisterAgentForm.tsx` | **MODIFIED** — Added toast import + toast.success on register |
| `contracts/.env` | **NEW** — Deployer PRIVATE_KEY (gitignored) |

---

## On-Chain State (Base Sepolia)

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT total supply**: 10,000 FIT (minted in Session 8)
- **FIT daily mint remaining**: 90,000 FIT
- **No agents registered yet** — awaiting manual testing
- **No stakes yet** — awaiting manual testing

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

---

*Last updated: Feb 9, 2026 — Session 8*
