# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-13
- **Duration**: Session 38
- **Branch**: `main`
- **Model**: Claude Opus 4.6
- **Commits**:
  - `341d920` — fix(auth): clear cached data on logout + add mobile viewport
  - `cdab137` — fix(auth): force wagmi disconnect on Privy logout
  - `8706186` — fix(auth): disconnect wagmi on page load when Privy session is gone
  - `8babcbd` — fix(auth): don't disconnect wagmi during active login flow

---

## What Was Done

### Session 38

1. **Security fix: React Query cache cleanup on logout** — Added `useAuthCleanup` hook in WalletProvider that clears React Query cache when wallet disconnects. Also added cleanup in `useChatHistory` (reset history state) and `AgentPageContent` (reset agentDbId, onboardingComplete, agentSyncedRef). (`341d920`)

2. **Mobile: viewport meta tag** — Added `export const viewport: Viewport` to `layout.tsx` with `width: device-width`, `initialScale: 1`, `viewportFit: cover`. Without this, mobile browsers render at desktop width and responsive breakpoints don't apply. (`341d920`)

3. **Mobile: auto-close menu on connect** — Navbar now watches `isConnected` and closes mobile menu when wallet connects. (`341d920`)

4. **Privy APP_ID trim** — Added `.trim()` to PRIVY_APP_ID env var (4th whitespace prevention). (`341d920`)

5. **Auth cleanup iterations** — Went through 3 iterations trying to fix the stale session problem:
   - v1 (`cdab137`): Watch `authenticated` from Privy instead of `isConnected` from wagmi, force wagmi disconnect
   - v2 (`8706186`): Simplified — whenever Privy ready + not authenticated + wagmi connected, disconnect. **BROKE LOGIN** — disconnected wagmi during active MetaMask login flow
   - v3 (`8babcbd`): Separated into 3 cases (stale page load / logout / active login). **STILL BROKE LOGIN** — `disconnectWagmi()` appears to corrupt wagmi internal state, preventing subsequent connections

---

## BLOCKER: Auth Cleanup Breaking Wallet Login

### The Problem
After calling `disconnectWagmi()` (from wagmi's `useDisconnect()`), subsequent wallet connections via Privy fail. MetaMask login does not complete. The `disconnectWagmi()` call appears to interfere with `@privy-io/wagmi`'s connector management.

### Root Cause Analysis
- **Privy** is the auth source of truth (`authenticated` from `usePrivy()`)
- **wagmi** has its own localStorage persistence and auto-reconnects independently
- After Privy `logout()`, wagmi reconnects from stored session → stale data appears
- Calling wagmi's `disconnect()` clears the session but seems to corrupt the connector state managed by `@privy-io/wagmi`

### What Was Tried (all in `WalletProvider.tsx` `useAuthCleanup`)
1. Watch `isConnected` transition → wagmi bounces back after Privy logout
2. Watch `authenticated` + force `disconnectWagmi()` → catches stale sessions but kills login
3. Separate initial check vs transition → still kills login because `disconnectWagmi()` is the problem

### Recommended Approach for Next Session
**Don't call wagmi's `disconnect()` at all.** Instead:
- **Option A**: Change page guards (`StakingPageContent`, `DashboardContent`, `AgentPageContent`) to check `usePrivy().authenticated` instead of `useAccount().isConnected`. This way Privy is the gate, not wagmi. wagmi can do whatever it wants — the UI won't show data unless Privy says authenticated.
- **Option B**: Use Privy's `useLogout()` hook with `onSuccess` callback to clear React Query cache without touching wagmi's connector state.
- **Option C**: Disable wagmi's localStorage persistence in the config (`createConfig` with `storage: null` or similar).

### Current State of `useAuthCleanup` (commit `8babcbd`)
```tsx
function useAuthCleanup() {
  // 3 cases: stale page load / logout transition / active login (skip)
  // Uses wasAuthenticated + initialCheckDone refs
  // Calls disconnectWagmi() which BREAKS subsequent logins
}
```

### Files Changed in S38
| File | Changes |
|------|---------|
| `src/components/providers/WalletProvider.tsx` | `useAuthCleanup` hook (3 iterations), `.trim()` on PRIVY_APP_ID |
| `src/components/ConnectWallet.tsx` | Added `useDisconnect`, calls `disconnectWagmi()` on logout click |
| `src/components/Navbar.tsx` | Auto-close mobile menu on wallet connect |
| `src/app/layout.tsx` | Added viewport metadata |
| `src/components/agent/AgentPageContent.tsx` | Reset local state on disconnect |
| `src/hooks/useChatHistory.ts` | Reset history on wallet disconnect |

---

## Immediate Priority for Next Session

1. **FIX AUTH CLEANUP** — Use Option A (page guards check `authenticated` from Privy, not `isConnected` from wagmi) or Option C (disable wagmi persistence). Do NOT call `disconnectWagmi()`.
2. **Test login flow** — MetaMask + Coinbase Wallet on desktop and mobile
3. **Test logout flow** — Verify staking/agent/dashboard data clears
4. **Then**: Re-test onboarding on clawcoach.ai/agent
5. **Then**: Build TASK-020 (MultiTokenRewardDistributor)

---

## Multi-Token Reward Distribution — Research (S37)

### What Michael Wants
Partner companies (e.g., FitCaster at fitcaster.xyz) distribute THEIR tokens alongside $CLAWC through ClawCoach. Users earn both $CLAWC + partner tokens per workout. Scales to any number of partnerships.

### Michael's Design Decisions (S37)
- **Partner rewards**: Flat per workout (NOT scaled by tier/streak multipliers)
- **Pool funding**: Anyone can fund (partners call `fundPool()` themselves)
- **Scope**: Full stack — contract + tests + frontend + deploy to Base Sepolia

### Existing Infrastructure
- **RewardDistributor does NOT exist yet** — needs to be built from scratch
- **ClawcToken** has owner-only `mint()` with daily cap (100K/day) + max supply (1B)
- **ProtocolFeeCollector** already handles dual-token (CLAWC + USDC) fee collection + 4-way treasury distribution
- **ClawcStaking** has 4-tier system (Free/Basic/Pro/Elite)

### Proposed Architecture: `MultiTokenRewardDistributor.sol`

```
contract MultiTokenRewardDistributor {
    // Primary: Mint $CLAWC with tier/streak multipliers
    // Partners: Flat per-workout from funded pool

    struct PartnerReward {
        IERC20 token;
        uint256 rewardPerWorkout;
        uint256 poolBalance;
        bool active;
        string name;
    }

    // Owner registers partners, anyone funds pools
    // distributeReward() mints CLAWC + transfers partner tokens
    // Streak tracking per user (7/30/90 day bonuses)
    // Tier multipliers (1.0x/0.85x/0.7x/0.5x)
}
```

### Contract Dependencies
```
ClawcToken (existing) ← MultiTokenRewardDistributor needs mint permission
ClawcStaking (existing) ← Read tier for multipliers
ProtocolFeeCollector (existing) ← Optional fee routing
Partner ERC-20s (external) ← transferFrom for partner rewards
```

---

## Supabase Data State (after S37 reset)

- **agents**: "daddy", `onboarding_complete: false` (reset for clean re-test)
- **messages**: empty (cleared)
- **agent_personas**: empty (cleared)
- **agent_memory_notes**: empty (cleared)
- **Redis free tier**: 0/10 (counter deleted)

---

## What's Next (Priority Order)

### 0. Fix auth cleanup (BLOCKER) — S38 left wallet login broken
### 1. Conversational Onboarding — All 3 bugs FIXED (S37), awaiting re-test
### 2. Agent Memory — Same impl, will work once onboarding completes
### 3. Multi-Token Reward Distribution — Researched S37, ready to build
### 4. Proactive Telegram Nudges — Trigger.dev cron
### 5. Agent Hub as Social Feed — /hub live feed

**Also planned:**
- Make Telegram bot persona-aware (currently uses generic `buildSystemPrompt`)

---

## Decisions Made

- **Don't call wagmi disconnect()**: It corrupts `@privy-io/wagmi` connector state. Use Privy `authenticated` as page guard instead. (Session 38)
- **Viewport meta tag required**: Without it, mobile CSS breakpoints don't apply. (Session 38)
- **Privy APP_ID must be trimmed**: 4th env var whitespace incident. (Session 38)
- **Onboarding messages exempt from free tier**: Chat route checks `onboarding_complete` in Supabase before incrementing Redis counter. (Session 37)
- **Message accumulation via ref**: `allMessagesRef` in AgentChat accumulates messages across session for extraction. Seeded from Supabase history on return visits. (Session 37)
- **Partner rewards flat per workout**: Not scaled by tier/streak multipliers. Simpler for partners to budget. (Session 37)
- **Anyone can fund partner pools**: Partners call `fundPool()` directly. More decentralized. (Session 37)
- **Supabase history always loads during onboarding**: Only XMTP fallback gated by onboarding status. (Session 36)
- **Onboarding default false**: `isOnboarded` defaults to `false`. (Session 35)
- **resolveSystemPrompt is async + shared**: Single function for both chat routes. (Session 34)
- **Onboarding completion threshold**: fitness_level + goals + schedule must all be filled. (Session 34)
- **Extraction model**: `claude-haiku-4-5-20251001` ~$0.001/call. (Session 34)
- **Production build uses webpack**: Turbopack can't handle XMTP WASM. (Session 33)
- **Env var `.trim()` pattern**: All contract address env vars trimmed. (Session 32)
- **Privy replaces wagmi-only auth**: `@privy-io/react-auth@3.13.1`. (Session 28)

---

## State of Tests

- `forge build`: **PASSES**
- `forge test`: **PASSES** (216 tests)
- `pnpm typecheck`: **PASSES** (Session 38)
- `pnpm build`: **PASSES** (Session 38)

---

## On-Chain State (Base Sepolia)

| Contract | Address |
|----------|---------|
| ClawcToken ($CLAWC) | `0x275534e19e025058d02a7837350ffaD6Ba136b7c` |
| ProtocolFeeCollector | `0x9233CC1Ab2ca19F7a240AD9238cBcf59516Def55` |
| ClawcStaking | `0x6B2D2f674373466F0C490E26a1DE00FF7F63BFad` |
| ClawcoachIdentity (ERC-8004) | `0xB95fab07C7750C50583eDe6CE751cc753811116c` |
| USDC (testnet) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **Staked**: 9,500 CLAWC | **Wallet**: ~475 CLAWC | **FeeCollector**: ~25 CLAWC
- **Agents**: 1 ("daddy", onboarding NOT complete — reset for re-test)

---

## Vercel Deployment Details

| Field | Value |
|-------|-------|
| Team | `classcoin` |
| Project | `moltcoach` |
| Production URL | `https://clawcoach.ai` |
| Vercel URL | `https://moltcoach.vercel.app` |
| Password | Basic Auth via proxy (`beta` / `democlawcoachbeta`) |
| Builder | **webpack** (Turbopack broke XMTP WASM) |

---

## Key Files for Next Session

| File | Why |
|------|-----|
| `src/components/providers/WalletProvider.tsx` | `useAuthCleanup` — needs rewrite (don't call `disconnectWagmi()`) |
| `src/components/ConnectWallet.tsx` | Has `disconnectWagmi()` in onClick — may need to remove |
| `src/components/staking/StakingPageContent.tsx` | Page guard: change `isConnected` → `authenticated` |
| `src/components/dashboard/DashboardContent.tsx` | Page guard: change `isConnected` → `authenticated` |
| `src/components/agent/AgentPageContent.tsx` | Page guard: change `isConnected` → `authenticated` |

---

*Last updated: Feb 13, 2026 — Session 38 end*
