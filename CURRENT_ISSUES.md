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
| 2 | Mobile load time ~10s | WalletProvider mount guard | S29 | Mount guard returns `null` during SSR → blank page until all JS + Privy init completes. Show loading skeleton instead of `null` to improve perceived performance. |

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
| 1 | Production crash — all browsers, incognito, mobile | Two root causes: (1) `NEXT_PUBLIC_PRIVY_APP_ID` had trailing `\n` on Vercel — removed and re-added cleanly. (2) `@metamask/sdk` imports `@react-native-async-storage/async-storage` which doesn't exist in browsers — added `resolveAlias` (Turbopack) + `resolve.alias` (webpack) in `next.config.ts`. Also added `global-error.tsx` for better error visibility. | S29 |
| 2 | Hero orb clipped on left side of mobile + messed up glow | Removed `overflow-hidden` from hero section, added `overflow-x-clip` to layout wrapper, fixed double-translate in orb animation keyframes | S27 |
| 3 | Telegram webhook 500 on Vercel | Resolved after redeploy (Turbopack bundling issue with `NextResponse.json()`) | S26 |
| 4 | Next.js 16 middleware deprecation warning | Migrated `middleware.ts` → `proxy.ts` | S25 |
| 5 | Mobile hero horizontal scroll | Added `overflow-hidden` + `-translate-x/y-1/2` to orb (later refined in S27) | S25 |

---

## Investigation Notes

_(none)_
