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
| 1 | Privy SSR: PrivyProvider validates app ID during static generation, causing Vercel deploy failure | `src/components/providers/WalletProvider.tsx` | S28 | Mount guard added (`useState`+`useEffect`) to defer providers to client-only. But `ConnectWallet` and `EmailSignupLink` use `usePrivy()` which throws without PrivyProvider during initial SSR render. Fix: make these components resilient (dynamic import `ssr: false`, or check provider availability before calling hooks). Local build passes, Vercel deploy fails. |
| 2 | Mobile wallet buttons don't connect (being replaced by Privy) | `src/components/ConnectWallet.tsx` | S27 | S28 is replacing the wagmi-only connector flow with Privy, which handles mobile natively. This bug should be resolved once TASK-017 is deployed. Keep until confirmed. |

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
