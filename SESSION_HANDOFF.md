# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-11
- **Duration**: Session 23
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 23

1. **Phase 7 — Deployed $CLAWC contracts to Base Sepolia (COMPLETE)**
   - Deployed all 4 contracts via `forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify`
   - All 4 contracts verified on BaseScan automatically
   - Minted 10,000 CLAWC to deployer via `MintTestTokens.s.sol`
   - Updated addresses in: `.env.local`, `.env.example`, `CLAUDE.md`, `docs/CONTRACTS.md`
   - Fixed 2 hardcoded old addresses in frontend (`AgentProfileCard.tsx`, `HubAgentCard.tsx`)
   - Updated `MintTestTokens.s.sol` with new ClawcToken address
   - Michael smoke-tested: staked 9,500 CLAWC, unstaked 500 CLAWC — all working
   - **Committed**: `692aaba` — `chore(deploy): deploy $CLAWC contracts to Base Sepolia`

2. **Builder Codes wagmi integration (COMPLETE)**
   - Installed `ox` (`^0.12.1`) for `Attribution.toDataSuffix` from `ox/erc8021`
   - Created `src/lib/builderCodes.ts` — generates data suffix from builder code `698cc32e289e9e19f580444f`
   - Added `dataSuffix` to all 5 `writeContract` calls (register, approve, stake x2, unstake)
   - `pnpm typecheck` + `pnpm build` both pass
   - **Committed**: `818fb59` — `feat(web3): integrate Builder Codes dataSuffix for Base attribution`

3. **Multi-token reward model (DISCUSSED, NOT BUILT)**
   - Designed architecture for partner token promos alongside $CLAWC rewards
   - Key distinction: Fitcaster's $FIT is a SEPARATE token from a different project, NOT the old $FIT we renamed
   - Model: PartnerRewardPool contract where partners deposit their tokens, ClawCoach distributes alongside $CLAWC
   - Stage 2 feature — needs RewardDistributor + WorkoutValidator first

4. **Commits this session**:
   - `692aaba` — `chore(deploy): deploy $CLAWC contracts to Base Sepolia`
   - `818fb59` — `feat(web3): integrate Builder Codes dataSuffix for Base attribution`

---

## What's In Progress

### $FIT → $CLAWC Rebrand (7 Phases) — ALL COMPLETE

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Contract source files | **DONE** | Renamed + updated all 4 `.sol` files |
| 2. Test files | **DONE** | All 4 test files updated |
| 3. Deployment scripts | **DONE** | `Deploy.s.sol` + `MintTestTokens.s.sol` |
| 4. Frontend | **DONE** | Config, hooks, components, pages, types, env vars |
| 5. Supabase migration | **DONE** | `fit_earned` → `clawc_earned` live in DB |
| 6. Documentation | **DONE** | 10 doc files updated, committed |
| 7. Deploy to Base Sepolia | **DONE** | 4 contracts deployed, verified, 10K CLAWC minted |

### Builder Codes — COMPLETE

- `ox/erc8021` Attribution wired into all 5 write calls
- Builder code: `698cc32e289e9e19f580444f`
- Every on-chain tx now appends attribution bytes

---

## What's Next

1. **Vercel deployment + password protection** — get clawcoach.ai live with staging password
2. **x402 integration** — pay-per-coach endpoints
3. **Telegram integration (TASK-014)** — bot + webhook handler
4. **Multi-token pricing (TASK-012)** — pricing page with CLAWC/USDC/ETH
5. **PartnerRewardPool contract** (Stage 2) — partner token promos alongside $CLAWC

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
- **Multi-token reward model**: Agents distribute partner tokens ($FIT, $LEARN, etc.), $CLAWC for staking/governance (Session 18, refined Session 23)
- **Partner token model**: PartnerRewardPool contract — partners deposit tokens, ClawCoach distributes alongside $CLAWC, 5% platform fee (Session 23)
- **Fitcaster's $FIT is SEPARATE**: NOT the old $FIT we renamed — it's Fitcaster's own reward token, a different project (Session 23)
- **Builder Codes**: app_id `698cc32e289e9e19f580444f`, dataSuffix wired via `ox/erc8021` (Session 23)
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
- **BaseScan API key**: Created via Etherscan (Session 22)

---

## State of Tests

- `forge build`: **PASSES** (exit 0, lint notes only)
- `forge test`: **PASSES** (216 tests, 0 failures)
- `pnpm typecheck`: **PASSES** (zero errors)
- `pnpm build`: **PASSES** (all 17 routes)

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
- **Project**: `~/Projects/moltcoach`
- **Dev server**: `pnpm dev` uses `--webpack` (not Turbopack) for XMTP WASM compatibility
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project), PRIVATE_KEY, BASESCAN_KEY
- **NOT configured**: Coinbase Wallet project ID
- **New dep**: `ox` ^0.12.1 (Builder Codes Attribution)

---

*Last updated: Feb 11, 2026 — Session 23*
