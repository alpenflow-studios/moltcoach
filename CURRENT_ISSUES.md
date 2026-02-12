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
| 1 | Mobile iOS client-side exception — needs verification on production | Privy / WalletProvider | S28 | Reported on iOS mobile. Chrome devtools shows only dev-only warnings (MetaMask SDK `@react-native-async-storage`, Privy `clip-path`, extension noise). None appear in production builds. **Action**: test on deployed `clawcoach.ai` (not localhost) on real iOS device. If it works in production, downgrade to Low/close. |

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
| 1 | Hero orb clipped on left side of mobile + messed up glow | Removed `overflow-hidden` from hero section, added `overflow-x-clip` to layout wrapper, fixed double-translate in orb animation keyframes | S27 |
| 2 | Telegram webhook 500 on Vercel | Resolved after redeploy (Turbopack bundling issue with `NextResponse.json()`) | S26 |
| 3 | Next.js 16 middleware deprecation warning | Migrated `middleware.ts` → `proxy.ts` | S25 |
| 4 | Mobile hero horizontal scroll | Added `overflow-hidden` + `-translate-x/y-1/2` to orb (later refined in S27) | S25 |

---

## Investigation Notes

_(none)_
