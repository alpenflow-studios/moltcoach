# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-13
- **Duration**: Session 36
- **Branch**: `main`
- **Model**: Claude Opus 4.6
- **Commits**: `0f35f72` — fix(onboarding): skip XMTP history fallback during onboarding

---

## What Was Done

### Session 36

1. **Fixed XMTP history fallback** — Old XMTP messages showed as chat history when Supabase was empty. Fixed by skipping XMTP fallback when `isOnboarded` is false (`0f35f72`, pushed + deployed)
2. **Updated CLAUDE.md** — Database tables section: moved telegram_links, agent_personas, agent_memory_notes from pending/planned to implemented
3. **Verified production state** — Confirmed via API: `onboarding_complete: false`, messages: `[]`, deploy live on Vercel
4. **Michael tested full onboarding flow** — 6 exchanges (12 messages) on production. Agent "daddy" ran through the full onboarding interview. Messages saved to Supabase correctly.
5. **Discovered 3 bugs during e2e test** (see below)
6. **Partial fix for Bug B** — Changed history loading so Supabase always loads, only XMTP fallback gated. **UNCOMMITTED** in `AgentChat.tsx`.

---

## 3 Bugs Found in S36 E2E Test

### Bug A: Extraction only sees latest 2 messages (CRITICAL — blocks onboarding completion)
- **File**: `src/components/agent/AgentChat.tsx` line 87
- **Root cause**: `chatHistory` prop loaded once on mount (empty on first visit). Each extraction sends `[...(chatHistory ?? []), userMsg, assistantMsg]` = only latest 2 messages. Haiku never sees fitness_level + goals + schedule together.
- **Fix**: Add a ref to accumulate all session messages. Pass full conversation to `/api/chat/extract`.
- **Status**: Root cause identified, fix NOT written yet

### Bug B: Chat disappears when navigating away and back
- **File**: `src/components/agent/AgentChat.tsx` lines 105-112
- **Root cause**: Original S36 fix skipped ALL history when not onboarded, including Supabase messages from the current onboarding session
- **Fix**: Supabase history always loads; only XMTP fallback gated by onboarding status
- **Status**: Fix written, **UNCOMMITTED** — needs typecheck + commit

### Bug C: Free tier (10 messages) hit during onboarding
- **File**: `src/lib/freeMessages.ts`
- **Root cause**: x402 free tier is flat 10 messages/30 days regardless of staking tier. Michael is Pro tier (9,500 CLAWC staked) but hit the cap during onboarding.
- **Fix options**: Exempt onboarding from counter, raise limit for stakers, or reset counter
- **Status**: Not investigated yet

---

## Immediate Priority for Next Session

1. **Fix Bug A** (extraction accumulation) — add ref in AgentChat to pass full conversation
2. **Commit Bug B fix** (already written, just needs typecheck + commit)
3. **Fix Bug C** (free tier) — at minimum, reset Michael's counter so he can re-test
4. **Reset Supabase state** — flip `onboarding_complete` back to false, clear messages for clean re-test (OR keep existing 12 messages and test extraction with fixed Bug A)
5. **Re-test full onboarding e2e** — verify extraction flips `onboarding_complete`, persona is saved, toast fires
6. Close TASK-019

---

## What's Next (Priority Order) — THE BIG FOUR

### 1. Conversational Onboarding — CODE COMPLETE, 3 bugs from e2e (S36)
### 2. Agent Memory — CODE COMPLETE (same impl, blocked on onboarding completion)

### 3. Proactive Telegram Nudges
Agent reaches out to YOU instead of waiting:
- Trigger.dev cron job checks each agent's last activity
- No workout in 3 days → send nudge via Telegram
- Hit a milestone → send congratulations
- Usual workout time → send reminder

### 4. Agent Hub as Social Feed
`/hub` becomes a live feed of agent activity:
- "Coach Alpha earned 50 CLAWC (coached @michael through leg day)"
- Agents have profiles, stats, reputation
- Agent-to-agent XMTP messaging + $CLAWC payments

**Also planned:**
- Make Telegram bot persona-aware (currently uses generic `buildSystemPrompt`)

---

## Supabase Data State (after S36 e2e test)

- **agents**: "daddy", `onboarding_complete: false` (extraction never flipped — Bug A)
- **messages**: 12 messages (6 exchanges from onboarding test)
- **agent_personas**: empty (extraction never had full conversation)
- **agent_memory_notes**: empty (never reached memory mode)
- **Redis free tier**: 10/10 used for deployer wallet

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

### Env Vars on Vercel (17 total)

| Variable | Env | Sensitive |
|----------|-----|-----------|
| NEXT_PUBLIC_PRIVY_APP_ID | production | no |
| NEXT_PUBLIC_CHAIN_ID | production | no |
| NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS | production | no |
| NEXT_PUBLIC_CLAWC_TOKEN_ADDRESS | production | no |
| NEXT_PUBLIC_CLAWC_STAKING_ADDRESS | production | no |
| NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS | production | no |
| NEXT_PUBLIC_SUPABASE_URL | production | no |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | production | no |
| NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID | production | no |
| NEXT_PUBLIC_CLAWCOACH_AGENT_XMTP_ADDRESS | production | no |
| SUPABASE_SERVICE_ROLE_KEY | production | yes |
| ANTHROPIC_API_KEY | production | yes |
| UPSTASH_REDIS_REST_URL | production | no |
| UPSTASH_REDIS_REST_TOKEN | production | yes |
| STAGING_USERNAME | production | yes |
| STAGING_PASSWORD | production | yes |
| TELEGRAM_BOT_TOKEN | production | yes |

---

## Decisions Made

- **Supabase history always loads during onboarding**: Only XMTP fallback gated by onboarding status. (Session 36 — uncommitted)
- **Onboarding default false**: `isOnboarded` defaults to `false`. (Session 35)
- **resolveSystemPrompt is async + shared**: Single function for both chat routes. (Session 34)
- **Onboarding completion threshold**: fitness_level + goals + schedule must all be filled. (Session 34)
- **Memory note categories**: general, preference, achievement, health, schedule. (Session 34)
- **Extraction model**: `claude-haiku-4-5-20251001` ~$0.001/call. (Session 34)
- **Production build uses webpack**: Turbopack can't handle XMTP WASM. (Session 33)
- **Brand colors**: Primary `#7CCF00`, Background `#09090B`, Card `#18181B`. (Session 33)
- **Env var `.trim()` pattern**: All contract address env vars trimmed. (Session 32)
- **Privy replaces wagmi-only auth**: `@privy-io/react-auth@3.13.1`. (Session 28)

---

## State of Tests

- `forge build`: **PASSES**
- `forge test`: **PASSES** (216 tests)
- `pnpm typecheck`: **PASSES** (Session 36)
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
- **Agents**: 1 ("daddy", onboarding NOT complete)

---

## Key Files for Next Session

| File | Why |
|------|-----|
| `src/components/agent/AgentChat.tsx` | **UNCOMMITTED fix** (Bug B) + needs Bug A fix (extraction accumulation) |
| `src/lib/freeMessages.ts` | Bug C — free tier doesn't respect staking |
| `src/lib/personaExtractor.ts` | Working correctly, just receiving insufficient data |
| `src/app/api/chat/extract/route.ts` | Extraction endpoint — working, receives data from frontend |
| `src/lib/systemPrompt.ts` | All prompt logic — working correctly |

---

*Last updated: Feb 13, 2026 — Session 36 end*
