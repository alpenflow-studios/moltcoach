# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-13
- **Duration**: Session 37
- **Branch**: `main`
- **Model**: Claude Opus 4.6
- **Commits**: `8f54b03` — fix(onboarding): accumulate messages for extraction + skip free tier during onboarding, `340427e` — chore(docs): S36 handoff

---

## What Was Done

### Session 37

1. **Fixed Bug A (CRITICAL)** — Extraction only saw latest 2 messages. Added `allMessagesRef` (useRef) to accumulate all messages across the session. Extraction now receives full conversation so Haiku can see fitness_level + goals + schedule together and flip `onboarding_complete`. (`8f54b03`)
2. **Fixed Bug B** — Chat disappeared on navigation. Committed the S36 uncommitted fix: Supabase history always loads, only XMTP fallback gated by onboarding status. (`8f54b03`)
3. **Fixed Bug C** — Free tier counter incremented during onboarding. Restructured `/api/chat/route.ts`: parses body first, checks `onboarding_complete` in Supabase, skips free message counter during onboarding. Added `createServerClient` import. (`8f54b03`)
4. **Reset Supabase data** — Cleared messages, agent_personas, agent_memory_notes via REST API. Confirmed `onboarding_complete: false`.
5. **Reset Redis counter** — Deleted `x402:free:0xad4e...` key. Verified null.
6. **Pushed + deployed** — Both commits pushed to main, Vercel auto-deploy triggered.
7. **Researched Multi-Token Reward Distribution** — Explored contracts architecture for partner token rewards (see Research section below).

---

## Immediate Priority for Next Session

1. **Michael: re-test on clawcoach.ai/agent** — Full onboarding flow with clean data
2. **Verify in Supabase**: `onboarding_complete` flipped to `true`, `agent_personas` populated, `agent_memory_notes` created
3. **Close TASK-019** — Check off final acceptance criteria
4. **Build MultiTokenRewardDistributor** — Full stack (contract + tests + frontend + deploy)

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

### Key Files for Implementation
| File | Purpose |
|------|---------|
| `contracts/src/ClawcToken.sol` | Mint function (owner-only, daily cap) |
| `contracts/src/ClawcStaking.sol` | Tier system reference |
| `contracts/src/fees/ProtocolFeeCollector.sol` | Dual-token pattern reference |
| `contracts/script/Deploy.s.sol` | Deployment script to extend |
| `src/config/contracts.ts` | Frontend contract config + ABIs |
| `src/hooks/useStakingReads.ts` | Pattern for on-chain reads |
| `src/components/staking/` | UI pattern reference |
| `docs/TOKENOMICS.md` | Reward formula: baseReward x tierMultiplier x streakBonus |

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

### 1. Conversational Onboarding — All 3 bugs FIXED, deployed, awaiting re-test (S37)
### 2. Agent Memory — Same impl, will work once onboarding completes
### 3. Multi-Token Reward Distribution — Researched S37, ready to build
### 4. Proactive Telegram Nudges — Trigger.dev cron
### 5. Agent Hub as Social Feed — /hub live feed

**Also planned:**
- Make Telegram bot persona-aware (currently uses generic `buildSystemPrompt`)

---

## Decisions Made

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
- `pnpm typecheck`: **PASSES** (Session 37)
- `pnpm build`: **PASSES** (Session 35)

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
| `src/components/agent/AgentChat.tsx` | Bug A+B fixes — verify extraction works e2e |
| `src/app/api/chat/route.ts` | Bug C fix — onboarding exemption from free tier |
| `contracts/src/ClawcToken.sol` | Mint permission for RewardDistributor |
| `contracts/src/fees/ProtocolFeeCollector.sol` | Dual-token pattern reference |
| `docs/TOKENOMICS.md` | Reward formula spec |

---

*Last updated: Feb 13, 2026 — Session 37 end*
