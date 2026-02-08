# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-08
- **Duration**: Session 4
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 4 (This Session)

1. **TASK-004: $FIT Token Contract** — COMPLETE
   - `FitToken.sol` — ERC-20 move-to-earn token:
     - ERC20 + ERC20Burnable + ERC20Permit + Ownable
     - Name: "MoltCoach FIT", Symbol: "FIT", 18 decimals
     - `MAX_SUPPLY`: 1B (immutable constant)
     - `dailyEmissionCap`: 100K/day (adjustable by owner, range 10K-500K)
     - UTC day tracking with automatic rollover
     - Owner-only `mint()` enforcing both max supply and daily cap
     - `remainingDailyMint()` and `remainingSupply()` view functions
     - Custom errors (gas-optimized)
   - 50 tests passing (45 unit + 5 fuzz), **100% line/statement/branch/function coverage**
   - Test categories: deployment, minting, daily cap rollover, burning, EIP-2612 permit, cap updates, view functions, standard ERC-20, fuzz

### Session 3 (Previous)

- TASK-003 (ERC-8004 Identity) completed
- Revenue model docs integrated (TASK-005, TASK-006 added)
- See session 3 handoff for details

### Session 2 (Previous)

- TASK-001 (scaffold) + TASK-002 (wallet) completed

### Session 1 (Previous)

- Dev environment setup, all project docs created

---

## What's In Progress

Nothing — clean handoff.

---

## What's Next

1. **TASK-005**: ProtocolFeeCollector (P0)
   - Spec: `docs/revenue_integration.md` (Patch 1)
   - Central fee router: $FIT + USDC collection
   - Treasury distribution: 40% dev / 30% buyback / 20% community / 10% insurance
   - Configurable fee rates, capped at 5% max
   - Depends on TASK-004 ($FIT address) — DONE
2. **TASK-006**: FIT Staking (P1)
   - Stake/unstake with tiers (Free/Basic/Pro/Elite)
   - Early unstake penalty (5%) routed to FeeCollector
   - Depends on TASK-004 + TASK-005
3. Supabase project setup
4. Coinbase Wallet project ID

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

- `forge test` (contracts/): **93 tests pass** (50 FitToken + 43 MoltcoachIdentity)
- `forge coverage`: **100% lines** on FitToken.sol, **98.67% lines** on MoltcoachIdentity.sol
- `pnpm typecheck`: PASSES
- `pnpm lint`: PASSES
- `pnpm build`: PASSES

---

## Key Files (Session 4)

| File | Purpose |
|------|---------|
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

*Last updated: Feb 8, 2026 — Session 4*
