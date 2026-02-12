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
| 1 | Mobile wallet buttons don't connect — Coinbase Wallet and WalletConnect show as stacked buttons on touch devices but tapping does nothing | `src/components/ConnectWallet.tsx` | S27 | S27 replaced toggle dropdown with direct `<Button>` elements calling `connect({ connector })`. Buttons render but `connect()` call appears to fail silently on mobile. Needs investigation: check if connectors are properly initialized on mobile, check wagmi error handling, test in mobile Safari devtools. Previous Radix dropdown also didn't work (S26) — underlying issue may be wagmi connector init on mobile, not the UI approach. |

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
