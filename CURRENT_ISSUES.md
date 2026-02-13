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
| 1 | XMTP production fix awaiting verification | clawcoach.ai | S33 | Build switched to `--webpack` (`02c9c5d`). Michael: verify XMTP connects on production after Vercel deploys. |
| 2 | New Supabase tables needed for onboarding | Supabase SQL Editor | S33 | `agent_personas`, `agent_memory_notes`, + `onboarding_complete` column on `agents`. SQL files to be written in S34. |

---

## Medium (Tech Debt)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | x402 paid route is non-streaming | `src/app/api/chat/paid/route.ts` | S24 | `withX402` expects `NextResponse<T>`, so paid route uses `messages.create` not `messages.stream`. Consider streaming upgrade later. |
| 2 | Orphaned chat messages from pre-Phase 7 agents | Supabase `messages` table | S32 | Old messages tied to old agent UUIDs. Not actively breaking anything. Could clean up or migrate later. Not a launch blocker. |

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
| 1 | XMTP infinite spinner on production | Root cause: `next build` used Turbopack (Next.js 16 default), XMTP WASM config only in webpack block. Fix: `--webpack` flag on build + 30s timeout + `.trim()` on XMTP address. | S33 |
| 2 | `telegram_links` table not created | Michael ran SQL in Supabase dashboard. Telegram bot verified working end-to-end. | S33 |
| 3 | Agent page `Address "0xB95..."` error | `.trim()` on all contract address env vars in `contracts.ts`. Chain guard UX + error parser added. | S32 |
| 4 | Telegram history not persisting on Vercel | Upstash env vars had whitespace. Cleaned via `printf`. | S31 |
| 5 | Production crash — all browsers | Privy App ID trailing `\n` + MetaMask SDK React Native import. | S29 |

---

## Investigation Notes

### Recurring Pattern: Vercel Env Var Whitespace (S29, S31, S32)

Three separate incidents caused by trailing `\n` in Vercel env vars:
- **S29**: `NEXT_PUBLIC_PRIVY_APP_ID` — fixed via `vercel env rm` + `printf`
- **S31**: `UPSTASH_REDIS_REST_*` — fixed via `vercel env rm` + `printf`
- **S32**: `NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS` — fixed permanently via `.trim()` in code

**Prevention**: S32 added `.trim()` to all contract address reads in `contracts.ts`. For future env vars, either `.trim()` in code or use `printf` when adding to Vercel.

---
