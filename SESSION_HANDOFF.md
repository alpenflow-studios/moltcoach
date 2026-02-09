# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-08
- **Duration**: Session 6
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 6 (This Session)

1. **TASK-006 committed and pushed** — FitStaking contract code + docs from Session 5

2. **Deploy script updated** — `Deploy.s.sol` now deploys all 4 contracts in dependency order:
   - FitToken → ProtocolFeeCollector → FitStaking → MoltcoachIdentity
   - Auto-selects USDC by chain ID (Base Sepolia / Base Mainnet)
   - Treasury wallets default to deployer for testnet convenience
   - Dry-run verified on Base Sepolia fork (~0.00001 ETH gas)

3. **Testnet deployment** — All 4 contracts deployed and verified on Base Sepolia:
   - FitToken: `0xf33c2C2879cfEDb467F70F74418F4Ce30e31B138`
   - ProtocolFeeCollector: `0xBd21945e92BEC4bf23B730987A8eE7f45C4E2cD2`
   - FitStaking: `0x57B6C63fFc4Aac5654C70dFc61469AFEe72c0737`
   - MoltcoachIdentity: `0x949488bD2F10884a0E2eB89e4947837b48814c9a`
   - All verified with `exact_match` status

4. **Supabase prompt created** — Full prompt for Claude.ai with Supabase MCP to set up 9 database tables with RLS, triggers, indexes. Michael is running this separately.

5. **Frontend staking UI** — COMPLETE
   - Foundation: `src/config/contracts.ts` (minimal ABIs + addresses), `src/types/staking.ts`, `src/lib/format.ts`
   - shadcn/ui: card, input, badge, progress, separator, tabs, alert, skeleton, label
   - Hooks: `useStakingReads` (all contract reads), `useStakeAction` (approve→stake 2-tx flow), `useUnstakeAction`
   - Components: StakingPageContent, StakingHeader, TierCard, StakeInfoCard, StakeActions, StakeForm, UnstakeForm, TierBenefitsCard
   - `/staking` route with page, loading, error
   - Landing page updated with "Start Staking" link
   - `tsconfig.json` target ES2017→ES2020 for BigInt support
   - `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass

### Session 5 (Previous)

- TASK-006 (FitStaking) completed — 62 tests, 100% coverage

### Session 4 (Previous)

- TASK-004 ($FIT Token) and TASK-005 (ProtocolFeeCollector) completed

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

1. **Supabase project setup** — Michael is doing this with Claude.ai + MCP
2. **Manual testing of staking UI** — Connect wallet on localhost, verify reads/writes work with deployed contracts
3. **Mint test $FIT** — Need to call `FitToken.mint()` from deployer wallet to give test users tokens
4. **Coinbase Wallet project ID** — Obtain from Coinbase developer portal
5. **Frontend polish** — Visual testing of staking page on mobile/desktop
6. **Agent creation UI** — MoltcoachIdentity frontend integration
7. **Shared nav component** — Extract header/footer from landing page and staking page into shared layout

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

---

## Open Questions

- [ ] Supabase project — Michael setting up with Claude.ai
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

## Key Files (Session 6)

| File | Purpose |
|------|---------|
| `contracts/script/Deploy.s.sol` | Deploy all 4 contracts (updated this session) |
| `src/config/contracts.ts` | Minimal ABIs + contract addresses for wagmi |
| `src/hooks/useStakingReads.ts` | All staking contract read hooks |
| `src/hooks/useStakeAction.ts` | Approve→stake 2-tx write flow |
| `src/hooks/useUnstakeAction.ts` | Unstake write flow |
| `src/components/staking/StakingPageContent.tsx` | Top-level staking page orchestrator |
| `src/components/staking/StakeForm.tsx` | Stake input + approve/stake buttons |
| `src/components/staking/UnstakeForm.tsx` | Unstake input + penalty preview |
| `src/components/staking/TierCard.tsx` | Current tier + progress bar |
| `src/components/staking/StakeInfoCard.tsx` | Staked balance + penalty countdown |
| `src/components/staking/TierBenefitsCard.tsx` | All 4 tiers comparison grid |
| `src/app/staking/page.tsx` | /staking route entry |
| `src/lib/format.ts` | formatFit(), formatStakeDate(), daysUntilPenaltyFree() |

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/` — add to PATH: `export PATH="/Users/openclaw/.foundry/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`
- **pnpm**: `/opt/homebrew/bin/pnpm` (v10.29.1)
- **forge commands**: Must run from `contracts/` directory (or use `cd contracts &&`)
- **ESLint**: `contracts/**` excluded in `eslint.config.mjs` (OZ JS files caused 1000+ errors)
- **Git**: Remote gets "Add files via upload" commits from GitHub web UI — always `git fetch` + rebase before push
- **tsconfig**: Target `ES2020` (changed from ES2017 in Session 6 for BigInt support)

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

*Last updated: Feb 8, 2026 — Session 6*
