# CURRENT_ISSUES.md

> **Purpose**: Track known bugs, blockers, and tech debt. Check before starting any task.

---

## Critical (Blocks Progress)

> Nothing here should stay longer than 1 session.

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | Extraction only sees latest 2 messages — onboarding never completes | `AgentChat.tsx:87` | S36 | `chatHistory` prop is stale (loaded once on mount, empty on first visit). Each extraction sends only latest message pair. Haiku never sees fitness_level + goals + schedule together. Fix: add ref to accumulate all session messages. |

---

## High (Fix This Sprint)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | Chat disappears on navigation during onboarding | `AgentChat.tsx:105-112` | S36 | Original fix skipped ALL history when not onboarded. Partial fix written (Supabase always loads, XMTP gated). **UNCOMMITTED** — needs typecheck + commit. |
| 2 | Free tier (10 msg) hit during onboarding — staking tier ignored | `freeMessages.ts` | S36 | x402 free tier is flat 10/30 days. Michael is Pro (9,500 CLAWC) but got capped. Options: exempt onboarding, raise limit for stakers, or reset counter. |

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
| 1 | XMTP history showing during onboarding | Skip XMTP fallback when `isOnboarded` is false (`0f35f72`) | S36 |
| 2 | Onboarding greeting showing motivator instead of interview | `isOnboarded` defaulted to `true`. Fixed to `false` in `86b337b`. | S35 |
| 3 | TASK-019 SQL scripts not run | Michael ran all 3 scripts in Supabase SQL Editor. | S35 |
| 4 | XMTP production fix awaiting verification | Michael verified — `--webpack` fix working. | S35 |
| 5 | 0 agents on new contracts | Deployer wallet has agent "daddy" on-chain + Supabase synced. | S35 |

---

## Investigation Notes

### S36 Onboarding E2E Test Results

Michael ran full onboarding flow on production:
- 6 exchanges (12 messages) saved to Supabase correctly
- Agent asked good questions (fitness level, goals, schedule, injuries, preferences, coaching style)
- `onboarding_complete` never flipped to `true` (Bug A — extraction sees only 2 messages per call)
- Free tier capped at 10 messages (Bug C — staking tier not checked)
- Chat disappeared when navigating to /staking and back (Bug B — history skip too aggressive)
- `agent_personas` table: empty. `agent_memory_notes` table: empty.

### Recurring Pattern: Vercel Env Var Whitespace (S29, S31, S32)

Three separate incidents caused by trailing `\n` in Vercel env vars. Prevention: `.trim()` in code or `printf` when adding to Vercel.

---
