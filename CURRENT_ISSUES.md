# CURRENT_ISSUES.md

> **Purpose**: Track known bugs, blockers, and tech debt. Check before starting any task.

---

## Critical (Blocks Progress)

> Nothing here should stay longer than 1 session.

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | TASK-019 SQL scripts not yet run | Supabase SQL Editor | S34 | Michael: run `agent_onboarding.sql` → `agent_personas.sql` → `agent_memory_notes.sql` in order. Code is complete but won't work until tables exist. |

---

## High (Fix This Sprint)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | XMTP production fix awaiting verification | clawcoach.ai | S33 | Build switched to `--webpack` (`02c9c5d`). Michael: verify XMTP connects on production. |
| 2 | 0 agents on new contracts | Base Sepolia | S33 | Michael needs to register an agent via the /agent page. Required for testing onboarding. |
| 3 | TASK-019 not yet committed/deployed | git / Vercel | S34 | Code complete, typecheck + build pass. Needs commit + push + Vercel deploy. |

---

## Medium (Tech Debt)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | x402 paid route is non-streaming | `src/app/api/chat/paid/route.ts` | S24 | `withX402` expects `NextResponse<T>`, so paid route uses `messages.create` not `messages.stream`. Consider streaming upgrade later. |
| 2 | Orphaned chat messages from pre-Phase 7 agents | Supabase `messages` table | S32 | Old messages tied to old agent UUIDs. Not actively breaking anything. |
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
| 1 | Supabase tables needed for onboarding | SQL files written in S34 (`docs/sql/agent_onboarding.sql`, `agent_personas.sql`, `agent_memory_notes.sql`). Michael to run. | S34 |
| 2 | XMTP infinite spinner on production | Root cause: `next build` used Turbopack. Fix: `--webpack` flag + 30s timeout + `.trim()`. | S33 |
| 3 | `telegram_links` table not created | Michael ran SQL in Supabase dashboard. Telegram bot verified working. | S33 |
| 4 | Agent page `Address "0xB95..."` error | `.trim()` on all contract address env vars in `contracts.ts`. | S32 |
| 5 | Telegram history not persisting on Vercel | Upstash env vars had whitespace. Cleaned via `printf`. | S31 |

---

## Investigation Notes

### Recurring Pattern: Vercel Env Var Whitespace (S29, S31, S32)

Three separate incidents caused by trailing `\n` in Vercel env vars:
- **S29**: `NEXT_PUBLIC_PRIVY_APP_ID` — fixed via `vercel env rm` + `printf`
- **S31**: `UPSTASH_REDIS_REST_*` — fixed via `vercel env rm` + `printf`
- **S32**: `NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS` — fixed permanently via `.trim()` in code

**Prevention**: S32 added `.trim()` to all contract address reads in `contracts.ts`. For future env vars, either `.trim()` in code or use `printf` when adding to Vercel.

---
