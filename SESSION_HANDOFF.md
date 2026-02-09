# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-08
- **Duration**: Session 5
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 5 (This Session)

1. **TASK-006: FIT Staking Contract** — COMPLETE
   - `FitStaking.sol` — Utility-only $FIT staking:
     - Ownable + ReentrancyGuard + SafeERC20
     - `stake(amount)` — transfer FIT from user, record StakeInfo
     - `unstake(amount)` — partial/full unstaking supported
     - Early unstake (< 30 days): 5% penalty routed to ProtocolFeeCollector via `collectFitFee`
     - Normal unstake (≥ 30 days): no penalty, full payout
     - stakedAt set on first stake only (not reset on top-up)
     - stakedAt reset to 0 on full unstake (restaking starts fresh timer)
     - Tier enum: Free(0), Basic(100 FIT), Pro(1K FIT), Elite(10K FIT)
     - `getTier(address)` — computed dynamically from staked balance
     - `isEarlyUnstake(address)` — check if within 30-day window
     - `updateThresholds(basic, pro, elite)` — owner-only, strictly increasing
     - TierChanged event emitted on stake/unstake when tier changes
     - `totalStaked` protocol-level metric tracked
     - IFeeCollector interface defined inline for penalty routing
     - forceApprove + collectFitFee pattern for safe penalty transfer
   - 62 tests (57 unit + 5 fuzz), **100% coverage** (lines, statements, branches, functions)

### Session 4 (Previous)

- TASK-004 ($FIT Token) and TASK-005 (ProtocolFeeCollector) completed
- See session 4 handoff for details

### Session 3 (Previous)

- TASK-003 (ERC-8004 Identity) completed

### Session 2 (Previous)

- TASK-001 (scaffold) + TASK-002 (wallet) completed

### Session 1 (Previous)

- Dev environment setup, all project docs created

---

## What's In Progress

Nothing — clean handoff.

---

## What's Next

1. **Deploy scripts update** — Update `Deploy.s.sol` to include FitStaking in deployment order
2. **Supabase project setup** — Create project, define tables
3. **Coinbase Wallet project ID** — Obtain from Coinbase developer portal
4. **Testnet deployment** — Deploy all 4 contracts to Base Sepolia
5. **Frontend contract integration** — Wire up wagmi hooks for staking UI

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

---

## Open Questions

- [ ] Supabase project — needs to be created
- [ ] Coinbase Wallet project ID — needs to be obtained
- [ ] XMTP vs Telegram priority for agent comms
- [ ] Agent-to-agent protocol at moltcoach.xyz
- [ ] Which wearable integration first? (Strava likely easiest)
- [ ] Spawn fee: USDC or $FIT or both? (revenue_model.md says both)

---

## State of Tests

- `forge test` (contracts/): **216 tests pass** (62 FitStaking + 61 FeeCollector + 50 FitToken + 43 MoltcoachIdentity)
- `forge coverage`:
  - **100% lines** on FitStaking.sol
  - **100% lines** on ProtocolFeeCollector.sol
  - **100% lines** on FitToken.sol
  - **98.67% lines** on MoltcoachIdentity.sol
- `pnpm typecheck`: PASSES
- `pnpm lint`: PASSES
- `pnpm build`: PASSES

---

## Key Files (Session 5)

| File | Purpose |
|------|---------|
| `contracts/src/FitStaking.sol` | $FIT staking contract (tiers, early unstake penalty) |
| `contracts/test/FitStaking.t.sol` | 62 tests: staking, tiers, unstaking, penalties, admin, fuzz |
| `contracts/src/fees/ProtocolFeeCollector.sol` | Central fee router ($FIT + USDC, treasury distribution) |
| `contracts/test/ProtocolFeeCollector.t.sol` | 61 tests: collection, distribution, allocation, fee updates |
| `contracts/src/FitToken.sol` | $FIT ERC-20 token (burn, permit, daily cap, max supply) |
| `contracts/test/FitToken.t.sol` | 50 tests: deployment, minting, daily cap, burn, permit, fuzz |
| `contracts/src/MoltcoachIdentity.sol` | ERC-8004 Identity Registry (ERC-721 + metadata + EIP-712 wallet) |
| `contracts/test/MoltcoachIdentity.t.sol` | 43 tests: registration, URI, metadata, wallet, transfers, fuzz |
| `contracts/script/Deploy.s.sol` | Deployment script for Base Sepolia |

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/` — add to PATH: `export PATH="/Users/openclaw/.foundry/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`
- **pnpm**: `/opt/homebrew/bin/pnpm` (v10.29.1)
- **forge commands**: Must run from `contracts/` directory (or use `cd contracts &&`)
- **ESLint**: `contracts/**` excluded in `eslint.config.mjs` (OZ JS files caused 1000+ errors)
- **Git**: Remote gets "Add files via upload" commits from GitHub web UI — always `git fetch` + rebase before push

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

---

*Last updated: Feb 8, 2026 — Session 5*
