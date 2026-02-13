# CURRENT_ISSUES.md

> **Purpose**: Track known bugs, blockers, and tech debt. Check before starting any task.

---

## Critical (Blocks Progress)

> Nothing here should stay longer than 1 session.

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| — | — | — | — | — |

---

## High (Fix This Sprint)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| — | — | — | — | — |

---

## Medium (Tech Debt)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | x402 paid route is non-streaming | `src/app/api/chat/paid/route.ts` | S24 | `withX402` expects `NextResponse<T>`, so paid route uses `messages.create` not `messages.stream`. Consider streaming upgrade later. |
| 2 | Telegram bot not persona-aware | `src/app/api/telegram/route.ts` | S34 | Telegram still uses generic `buildSystemPrompt()`. Should use `resolveSystemPrompt()` with linked wallet's agent. Follow-up task. |

---

## Low (Nice to Have)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| — | — | — | — | — |

---

## Resolved (Last 5)

> Keep recent resolutions for context. Delete older ones.

| # | Issue | Resolution | Date |
|---|-------|------------|------|
| 1 | Extraction only sees latest 2 messages | Added `allMessagesRef` to accumulate full conversation (`8f54b03`) | S37 |
| 2 | Chat disappears on navigation during onboarding | Supabase history always loads, XMTP fallback gated (`8f54b03`) | S37 |
| 3 | Free tier (10 msg) hit during onboarding | Onboarding messages exempt from counter — checks `onboarding_complete` in Supabase (`8f54b03`) | S37 |
| 4 | XMTP history showing during onboarding | Skip XMTP fallback when `isOnboarded` is false (`0f35f72`) | S36 |
| 5 | Onboarding greeting showing motivator instead of interview | `isOnboarded` defaulted to `true`. Fixed to `false` in `86b337b`. | S35 |

---

## Investigation Notes

### S37 Multi-Token Reward Distribution Research

Michael wants partner companies (e.g., FitCaster) to distribute their tokens alongside $CLAWC. Architecture designed:
- `MultiTokenRewardDistributor.sol` — mints CLAWC + distributes partner tokens per workout
- Partner rewards flat per workout (not scaled by tier/streak)
- Anyone can fund partner pools
- Full stack scope: contract + tests + frontend + deploy
- RewardDistributor does NOT exist yet — building from scratch

### Recurring Pattern: Vercel Env Var Whitespace (S29, S31, S32)

Three separate incidents caused by trailing `\n` in Vercel env vars. Prevention: `.trim()` in code or `printf` when adding to Vercel.

---
