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
| 1 | Telegram conversation history not persisting on Vercel | `src/app/api/telegram/route.ts` | S30 | Bot responds but `saveHistory` silently fails on Vercel. Works locally. Likely `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` env vars have whitespace/newline (same pattern as Privy app ID S29). Fix: `vercel env rm` + `vercel env add` with `printf`. |

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
| 1 | Mobile load time ~10s (blank page) | Replaced `return null` mount guard with loading skeleton (navbar/spinner/footer) in WalletProvider | S30 |
| 2 | Production crash — all browsers, incognito, mobile | Two root causes: (1) `NEXT_PUBLIC_PRIVY_APP_ID` had trailing `\n` on Vercel — removed and re-added cleanly. (2) `@metamask/sdk` imports `@react-native-async-storage/async-storage` which doesn't exist in browsers — added `resolveAlias` (Turbopack) + `resolve.alias` (webpack) in `next.config.ts`. Also added `global-error.tsx` for better error visibility. | S29 |
| 3 | Hero orb clipped on left side of mobile + messed up glow | Removed `overflow-hidden` from hero section, added `overflow-x-clip` to layout wrapper, fixed double-translate in orb animation keyframes | S27 |
| 4 | Telegram webhook 500 on Vercel | Resolved after redeploy (Turbopack bundling issue with `NextResponse.json()`) | S26 |
| 5 | Next.js 16 middleware deprecation warning | Migrated `middleware.ts` → `proxy.ts` | S25 |

---

## Investigation Notes

### Telegram Redis on Vercel (S30)
- Webhook returns 200, Claude API responds, `sendTelegramMessage` works
- `saveHistory` executes without throwing (bot message IS sent after it)
- But no `telegram:history:*` keys appear in Redis
- Local test: `telegram:history:55555` created successfully with full conversation
- Vercel test (curl to production): no key created
- `getRedis()` likely returning null on Vercel → env var issue
- Rate limit keys exist but may be from local dev, not Vercel

---
