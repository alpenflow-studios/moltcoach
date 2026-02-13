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
| 1 | TASK-019 e2e test pending | clawcoach.ai/agent | S35 | Fix deployed (`86b337b`), Supabase reset. Michael: reload `/agent` after Vercel deploys, confirm onboarding greeting, run full flow. |

---

## Medium (Tech Debt)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | x402 paid route is non-streaming | `src/app/api/chat/paid/route.ts` | S24 | `withX402` expects `NextResponse<T>`, so paid route uses `messages.create` not `messages.stream`. Consider streaming upgrade later. |
| 2 | Orphaned chat messages from pre-Phase 7 agents | Supabase `messages` table | S32 | Cleared in S35 reset. Table now empty. No longer an issue unless old agents re-sync. |
| 3 | Telegram bot not persona-aware | `src/app/api/telegram/route.ts` | S34 | Telegram still uses generic `buildSystemPrompt()`. Should use `resolveSystemPrompt()` with linked wallet's agent. Follow-up task. |

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
| 1 | Onboarding greeting showing motivator instead of interview | `isOnboarded` defaulted to `true`. Fixed to `false` in `86b337b`. | S35 |
| 2 | TASK-019 SQL scripts not run | Michael ran all 3 scripts in Supabase SQL Editor. | S35 |
| 3 | XMTP production fix awaiting verification | Michael verified — `--webpack` fix working. | S35 |
| 4 | 0 agents on new contracts | Deployer wallet has agent "daddy" on-chain + Supabase synced. | S35 |
| 5 | TASK-019 code not committed/deployed | `f3d640b` + `86b337b` pushed, Vercel auto-deploy. | S34→S35 |

---

## Investigation Notes

### Recurring Pattern: Vercel Env Var Whitespace (S29, S31, S32)

Three separate incidents caused by trailing `\n` in Vercel env vars:
- **S29**: `NEXT_PUBLIC_PRIVY_APP_ID` — fixed via `vercel env rm` + `printf`
- **S31**: `UPSTASH_REDIS_REST_*` — fixed via `vercel env rm` + `printf`
- **S32**: `NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS` — fixed permanently via `.trim()` in code

**Prevention**: S32 added `.trim()` to all contract address reads in `contracts.ts`. For future env vars, either `.trim()` in code or use `printf` when adding to Vercel.

---
