# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-08
- **Duration**: Session 7
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 7 (This Session)

1. **Staking UI audit** — Verified all ABIs match deployed contracts, confirmed contract addresses, no critical bugs. `.env.local` was missing — created it with all 4 deployed contract addresses.

2. **Mint script** — `contracts/script/MintTestTokens.s.sol` created. Mints 10,000 FIT to deployer for testing. Usage: `forge script script/MintTestTokens.s.sol --rpc-url base_sepolia --broadcast`

3. **Shared layout system** — Major refactor:
   - `src/components/Navbar.tsx` — Responsive nav with mobile hamburger menu, active route highlighting, links to Home/Staking/Agent/Dashboard
   - `src/components/Footer.tsx` — Shared footer with nav links
   - Root `layout.tsx` updated to include Navbar + Footer globally
   - Landing page (`page.tsx`) stripped of duplicated header/footer, now renders inside layout
   - Staking page (`staking/page.tsx`) stripped of duplicated header/footer, simplified to content only

4. **Agent Creation UI** — Full MoltcoachIdentity frontend integration:
   - `src/config/contracts.ts` — Added `MOLTCOACH_IDENTITY_ADDRESS` + `moltcoachIdentityAbi` (register, hasAgent, getAgent, tokenURI, getMetadata, setMetadata, setAgentURI)
   - `src/hooks/useAgentReads.ts` — Reads: hasAgent, getAgent, tokenURI
   - `src/hooks/useRegisterAgent.ts` — Write: register(agentURI) with state machine
   - `src/components/agent/AgentPageContent.tsx` — Orchestrator (wallet check, loading, has/no agent routing)
   - `src/components/agent/RegisterAgentForm.tsx` — Agent creation form with name input, 4 coaching style picker (Motivator/Drill Sergeant/Scientist/Friend), live preview card, data URI generation
   - `src/components/agent/AgentProfileCard.tsx` — Existing agent display with on-chain data, URI parsing, BaseScan link, capabilities badges
   - `/agent` route with page, loading, error

5. **Dashboard page** — New `/dashboard` route:
   - `src/components/dashboard/DashboardContent.tsx` — Overview with 4 stat cards (FIT balance, staked, tier, agent), staking detail card with tier progress, agent status card with activity placeholders
   - `/dashboard` route with page, loading, error

6. **Supabase scaffold** — Ready for when Michael finishes DB setup:
   - Installed `@supabase/supabase-js` v2.95.3
   - `src/lib/supabase.ts` — Client with Database type
   - `src/types/database.ts` — Types for users, agents, workouts, coaching_sessions tables

7. **Coinbase Wallet project ID** — `wagmi.ts` updated to read `NEXT_PUBLIC_COINBASE_WALLET_PROJECT_ID` from env

8. **Toast notifications** — Installed shadcn sonner component:
   - `src/components/ui/sonner.tsx` — Hardcoded to dark theme (no next-themes dependency)
   - Added `<Toaster>` to root layout
   - StakeForm has toast on successful stake

### Session 6 (Previous)

- All 4 contracts deployed & verified on Base Sepolia
- Full staking UI built
- Deploy script updated for all 4 contracts

### Sessions 1-5

- Dev environment, scaffold, wallet, contracts (Identity, FIT, FeeCollector, Staking), 216 tests

---

## What's In Progress

**Toast notifications** — StakeForm has toast on success. Still need to add toast to:
- `UnstakeForm.tsx` — on successful unstake
- `RegisterAgentForm.tsx` — on successful agent registration

These are ~3-line additions each (import toast, add toast.success in useEffect).

---

## What's Next

1. **Finish toast notifications** — Add to UnstakeForm + RegisterAgentForm (quick, ~5 min)
2. **Commit + push all Session 7 work** — Large commit with all new files
3. **Manual testing** — Run `pnpm dev`, connect wallet, verify all 4 routes render correctly
4. **Mint test FIT** — Run the MintTestTokens script to give deployer tokens for testing staking
5. **Test agent registration** — Register an agent on Base Sepolia via the /agent UI
6. **Supabase integration** — Wire up supabase client once Michael has DB ready
7. **Coinbase Wallet project ID** — Michael needs to obtain from Coinbase developer portal
8. **Wearable integration** — Start Strava OAuth flow (likely first wearable)
9. **Agent coaching chat** — Build the actual coaching interface (Claude API integration)

---

## Decisions Made

- **Theme**: Dark mode default, lime primary accent on zinc base
- **wagmi version**: v3.4.2 (latest)
- **Smart Wallet**: `smartWalletOnly` preference
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

---

## Open Questions

- [ ] Supabase project — Michael setting up with Claude.ai
- [ ] Coinbase Wallet project ID — needs to be obtained from developer portal
- [ ] XMTP vs Telegram priority for agent comms
- [ ] Agent-to-agent protocol at moltcoach.xyz
- [ ] Which wearable integration first? (Strava likely easiest)
- [ ] Spawn fee: USDC or $FIT or both? (revenue_model.md says both)

---

## State of Tests

- `forge test` (contracts/): **216 tests pass** (62 FitStaking + 61 FeeCollector + 50 FitToken + 43 MoltcoachIdentity)
- `forge build`: Compiles (pre-existing notes/warnings only, no errors)
- `pnpm typecheck`: PASSES
- `pnpm lint`: PASSES
- `pnpm build`: PASSES (all 4 routes: /, /staking, /agent, /dashboard)

---

## Key Files (Session 7 — New/Modified)

| File | Purpose |
|------|---------|
| `.env.local` | **NEW** — Local env with all 4 deployed contract addresses |
| `contracts/script/MintTestTokens.s.sol` | **NEW** — Mint test FIT tokens to deployer |
| `src/components/Navbar.tsx` | **NEW** — Shared responsive navbar with mobile menu |
| `src/components/Footer.tsx` | **NEW** — Shared footer |
| `src/app/layout.tsx` | **MODIFIED** — Now includes Navbar, Footer, Toaster |
| `src/app/page.tsx` | **MODIFIED** — Stripped header/footer, renders content only |
| `src/app/staking/page.tsx` | **MODIFIED** — Stripped header/footer, simplified |
| `src/config/contracts.ts` | **MODIFIED** — Added MoltcoachIdentity address + ABI |
| `src/config/wagmi.ts` | **MODIFIED** — Added Coinbase project ID env var |
| `src/hooks/useAgentReads.ts` | **NEW** — Agent reads (hasAgent, getAgent, tokenURI) |
| `src/hooks/useRegisterAgent.ts` | **NEW** — Agent registration write hook |
| `src/components/agent/AgentPageContent.tsx` | **NEW** — Agent page orchestrator |
| `src/components/agent/RegisterAgentForm.tsx` | **NEW** — Agent creation form with style picker |
| `src/components/agent/AgentProfileCard.tsx` | **NEW** — Agent profile display |
| `src/app/agent/page.tsx` | **NEW** — /agent route |
| `src/app/agent/loading.tsx` | **NEW** — Agent loading state |
| `src/app/agent/error.tsx` | **NEW** — Agent error boundary |
| `src/components/dashboard/DashboardContent.tsx` | **NEW** — Dashboard overview page |
| `src/app/dashboard/page.tsx` | **NEW** — /dashboard route |
| `src/app/dashboard/loading.tsx` | **NEW** — Dashboard loading state |
| `src/app/dashboard/error.tsx` | **NEW** — Dashboard error boundary |
| `src/lib/supabase.ts` | **NEW** — Supabase client |
| `src/types/database.ts` | **NEW** — Supabase table types |
| `src/components/ui/sonner.tsx` | **NEW** — Toast notification component |
| `src/components/staking/StakeForm.tsx` | **MODIFIED** — Added toast on success |

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/` — add to PATH: `export PATH="/Users/openclaw/.foundry/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`
- **pnpm**: `/opt/homebrew/bin/pnpm` (v10.29.1)
- **forge commands**: Must run from `contracts/` directory (or use `cd contracts &&`)
- **ESLint**: `contracts/**` excluded in `eslint.config.mjs` (OZ JS files caused 1000+ errors)
- **Git**: Remote gets "Add files via upload" commits from GitHub web UI — always `git fetch` + rebase before push
- **tsconfig**: Target `ES2020` (changed from ES2017 in Session 6 for BigInt support)
- **NOTHING IS COMMITTED YET** — All Session 7 work is unstaged. Commit + push is the first task for Session 8.

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
| @supabase/supabase-js | 2.95.3 | node_modules (**NEW**) |
| sonner | latest | node_modules (**NEW**) |

---

*Last updated: Feb 8, 2026 — Session 7*
