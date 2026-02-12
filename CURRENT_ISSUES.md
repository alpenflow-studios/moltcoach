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
| 1 | Telegram webhook returns 500 on Vercel | `src/app/api/telegram/route.ts` | S26 | `TypeError: p.end is not a function` in bundled chunk. Likely Turbopack bundling issue with `NextResponse.json()`. Try replacing with `Response.json()`. See investigation notes below. |

---

## Medium (Tech Debt)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | x402 paid route is non-streaming | `src/app/api/chat/paid/route.ts` | S24 | `withX402` expects `NextResponse<T>`, so paid route uses `messages.create` not `messages.stream`. Consider streaming upgrade later. |

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
| 1 | Mobile wallet dropdown not responding to taps | Replaced Radix DropdownMenu with plain buttons on touch devices (`useIsTouchDevice` + `pointer: coarse`) | S26 |
| 2 | Next.js 16 middleware deprecation warning | Migrated `middleware.ts` → `proxy.ts` | S25 |
| 3 | Mobile hero horizontal scroll | Added `overflow-hidden` + `-translate-x/y-1/2` to orb | S25 |

---

## Investigation Notes

### High #1: Telegram webhook 500 on Vercel (S26)

**Symptom**: POST to `https://clawcoach.ai/api/telegram` returns 500. Vercel function log shows:
```
TypeError: p.end is not a function
    at Object.end (.next/server/chunks/[root-of-the-server]__9b036066._.js:36:18529)
```

**What was tried (S26)**:
1. grammy `webhookCallback("next-js")` adapter → 500 (adapter is Pages Router, not App Router)
2. grammy `bot.handleUpdate(update)` manually → 500 (same `p.end` error)
3. Direct fetch to Telegram API, no grammy at runtime → 500 (same `p.end` error)

**Root cause**: Error is in Turbopack-bundled chunk, not in user code. The `p.end` call is likely from `NextResponse.json()` being incorrectly bundled by Turbopack for this route.

**Fix to try**:
- Replace all `NextResponse.json(...)` with `Response.json(...)` or `new Response(JSON.stringify(...), { headers: { "Content-Type": "application/json" } })`
- Remove `import { NextResponse } from "next/server"` entirely
- This is the same pattern used in `/api/chat/route.ts` which works fine (`Response.json()`)
