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
| 1 | `telegram_links` table not yet created in Supabase | Supabase SQL Editor | S32 | Run `docs/sql/telegram_links.sql` in dashboard. `/connect` bot command will fail until table exists. |

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
| 1 | Agent page `Address "0xB95..."` error | Root cause: `NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS` on Vercel had trailing whitespace. Fix: `.trim()` on all contract address env vars in `contracts.ts`. Also added chain guard UX + error parser. | S32 |
| 2 | Telegram history not persisting on Vercel | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` had trailing whitespace. Cleaned via `vercel env rm` + `vercel env add` with `printf`. Redeployed. Multi-turn verified. | S31 |
| 3 | Mobile load time ~10s (blank page) | Replaced `return null` mount guard with loading skeleton (navbar/spinner/footer) in WalletProvider | S30 |
| 4 | Production crash — all browsers, incognito, mobile | Two root causes: (1) `NEXT_PUBLIC_PRIVY_APP_ID` had trailing `\n` on Vercel. (2) `@metamask/sdk` React Native import stubbed. | S29 |
| 5 | Hero orb clipped on left side of mobile | Removed `overflow-hidden`, added `overflow-x-clip`, fixed double-translate in orb keyframes | S27 |

---

## Investigation Notes

### Recurring Pattern: Vercel Env Var Whitespace (S29, S31, S32)

Three separate incidents caused by trailing `\n` in Vercel env vars:
- **S29**: `NEXT_PUBLIC_PRIVY_APP_ID` — fixed via `vercel env rm` + `printf`
- **S31**: `UPSTASH_REDIS_REST_*` — fixed via `vercel env rm` + `printf`
- **S32**: `NEXT_PUBLIC_CLAWCOACH_IDENTITY_ADDRESS` — fixed permanently via `.trim()` in code

**Prevention**: S32 added `.trim()` to all contract address reads in `contracts.ts`. For future env vars, either `.trim()` in code or use `printf` when adding to Vercel.

---
