# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-11
- **Duration**: Session 21
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 21

1. **$FIT → $CLAWC rebrand — Phases 2-4 completed**

   **Phase 2 (test files) — completed**
   - `contracts/test/ProtocolFeeCollector.t.sol` — full rewrite (FitToken→ClawcToken, collectFitFee→collectClawcFee, etc.)
   - `contracts/test/ClawcoachIdentity.t.sol` — full rewrite (MoltcoachIdentity→ClawcoachIdentity, EIP-712 domain)

   **Phase 3 (deployment scripts) — completed**
   - `contracts/script/Deploy.s.sol` — imports, types, variable names, console.log strings
   - `contracts/script/MintTestTokens.s.sol` — import, constant, variable, console.log

   **Phase 3 checkpoint**: `forge build` zero warnings, `forge test` 216 tests pass.
   **Committed**: `6725293` — `refactor(contracts): rename $FIT to $CLAWC token rebrand`

   **Phase 4 (frontend) — completed**
   - Config: `contracts.ts`, `pricing.ts` — all FIT→CLAWC exports, env var refs, types
   - Lib: `format.ts` — `formatFit`→`formatClawc`
   - Hooks: `useStakingReads.ts`, `useStakeAction.ts`, `useUnstakeAction.ts` — CLAWC imports
   - Staking components (7 files): `StakeForm`, `UnstakeForm`, `StakeInfoCard`, `TierBenefitsCard`, `TierCard`, `StakingHeader`, `StakingPageContent`
   - Other components: `DashboardContent`, `AgentProfileCard`, `PricingPageContent`
   - Pages: `layout.tsx`, `page.tsx`, `staking/page.tsx`, `pricing/page.tsx`, `subscribe/page.tsx`
   - Env: `.env.example`, `.env.local` — `FIT_TOKEN`→`CLAWC_TOKEN`, `FIT_STAKING`→`CLAWC_STAKING`
   - Types: `database.ts` — `fit_earned`→`clawc_earned`, `"FIT"`→`"CLAWC"` in payment_token

   **Phase 4 checkpoint**: `pnpm typecheck` zero errors, `pnpm build` passes clean.

2. **Commits this session**:
   - `6725293` — `refactor(contracts): rename $FIT to $CLAWC token rebrand` (Phases 1-3)
   - (pending) — `refactor(frontend): rename $FIT to $CLAWC across all UI` (Phase 4)

---

## What's In Progress

### $FIT → $CLAWC Rebrand (7 Phases)

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Contract source files | **DONE** | Renamed + updated all 4 `.sol` files |
| 2. Test files | **DONE** | All 4 test files updated |
| 3. Deployment scripts | **DONE** | `Deploy.s.sol` + `MintTestTokens.s.sol` |
| 4. Frontend | **DONE** | Config, hooks, components, pages, types, env vars |
| 5. Supabase migration | **NOT STARTED** | `fit_earned` → `clawc_earned` column rename in live DB |
| 6. Documentation | **NOT STARTED** | CLAUDE.md, CONTRACTS.md, TOKENOMICS.md, PRD.md, etc. |
| 7. Deploy to Base Sepolia | **NOT STARTED** | Fresh deploy with $CLAWC branding |

---

## What's Next

1. **Phase 5 — Supabase migration** — Rename `fit_earned` column → `clawc_earned` in workouts table, update `payment_token` enum in subscriptions table (FIT→CLAWC). Use Supabase Management API.
2. **Phase 6 — Documentation** — Update CLAUDE.md (contract table, env vars, domain concepts), CONTRACTS.md, TOKENOMICS.md, PRD.md, revenue docs, CURRENT_SPRINT.md references
3. **Phase 7 — Deploy** — Fresh deploy to Base Sepolia with $CLAWC branding, update contract addresses everywhere
4. **x402 integration** — pay-per-coach endpoints
5. **Builder Codes wagmi integration** — wire `ox` + `Attribution.toDataSuffix`
6. **Vercel deployment + password protection**
7. **Telegram integration (TASK-014)**

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
  → POST /api/chat → Claude streams response
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

- **$CLAWC replaces $FIT**: $FIT becomes a partner reward token (fitcaster.xyz). $CLAWC is the native platform token (Session 18)
- **Multi-token reward model**: Agents distribute partner tokens ($FIT, $LEARN, etc.), $CLAWC for staking/governance (Session 18)
- **Builder Codes app_id**: `698cc32e289e9e19f580444f` (Session 18)
- **x402 integration planned**: Pay-per-coach, agent autonomous spending, Bazaar discovery (Session 18)
- **Supabase project**: `clawcoach`, East US (Ohio), ref `agvdivapnrqpstvhkbmk` (Session 17)
- **Supabase auth model**: Wallet-based. Anon key for reads, service_role for writes via API routes (Session 17)
- **Chat persistence priority**: Supabase history > XMTP history > empty (Session 17)
- **XMTP V3 SDK**: `@xmtp/browser-sdk` v6.3.0 (Session 16)
- **Dev bundler**: webpack (not Turbopack) — XMTP WASM workers incompatible with Turbopack (Session 16)
- **Pricing model**: DUAL — Stake $CLAWC OR Subscribe USDC/ETH (Session 14, updated 18)
- **Theme**: Dark mode, lime primary on zinc
- **wagmi**: v3.4.2
- **Brand**: ClawCoach (clawcoach.ai)

---

## State of Tests

- `forge build`: **PASSES** (zero warnings)
- `forge test`: **PASSES** (216 tests, 0 failures)
- `pnpm typecheck`: **PASSES** (zero errors)
- `pnpm build`: **PASSES** (all 17 routes)

---

## On-Chain State (Base Sepolia) — OLD CONTRACTS

> These will be replaced by $CLAWC versions after Phase 7 redeploy.

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT supply**: 10,000 FIT | **Wallet**: 475 FIT | **Staked**: 9,500 FIT
- **Tier**: Pro (2) | **FeeCollector**: 25 FIT
- **Agent #1**: "daddy", motivator

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/`
- **pnpm**: v10.29.1 | **Next.js**: 16.1.6 | **Node**: v25.6.0
- **Project**: `~/Projects/moltcoach`
- **Dev server**: `pnpm dev` uses `--webpack` (not Turbopack) for XMTP WASM compatibility
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project)
- **NOT configured**: Coinbase Wallet project ID

---

*Last updated: Feb 11, 2026 — Session 21*
