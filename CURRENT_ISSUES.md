# CURRENT_ISSUES.md

> **Purpose**: Track known bugs, blockers, and tech debt. Check before starting any task.

---

## Critical (Blocks Progress)

> Nothing here should stay longer than 1 session.

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | Wallet login broken — `disconnectWagmi()` corrupts `@privy-io/wagmi` connector state | `WalletProvider.tsx`, `ConnectWallet.tsx` | S38 | Calling wagmi's `useDisconnect().disconnect()` prevents subsequent Privy logins. Remove all `disconnectWagmi()` calls. Use Privy `authenticated` as page guard instead of wagmi `isConnected`. See SESSION_HANDOFF.md "BLOCKER" section for 3 options. |

---

## High (Fix This Sprint)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | Stale data visible after logout (security) | `StakingPageContent`, `DashboardContent`, `AgentPageContent` | S38 | Page guards use wagmi `isConnected` which auto-reconnects. Fix: change guards to Privy `authenticated`. Partially fixed in S38 (cache cleanup + chat history reset work), but wagmi reconnection undoes it. |

---

## Medium (Tech Debt)

| # | Issue | File/Area | Found | Notes |
|---|-------|-----------|-------|-------|
| 1 | x402 paid route is non-streaming | `src/app/api/chat/paid/route.ts` | S24 | `withX402` expects `NextResponse<T>`, so paid route uses `messages.create` not `messages.stream`. Consider streaming upgrade later. |
| 2 | Telegram bot not persona-aware | `src/app/api/telegram/route.ts` | S34 | Telegram still uses generic `buildSystemPrompt()`. Should use `resolveSystemPrompt()` with linked wallet's agent. Follow-up task. |

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
| 1 | Extraction only sees latest 2 messages | Added `allMessagesRef` to accumulate full conversation (`8f54b03`) | S37 |
| 2 | Chat disappears on navigation during onboarding | Supabase history always loads, XMTP fallback gated (`8f54b03`) | S37 |
| 3 | Free tier (10 msg) hit during onboarding | Onboarding messages exempt from counter — checks `onboarding_complete` in Supabase (`8f54b03`) | S37 |
| 4 | Missing mobile viewport meta tag | Added `export const viewport` to `layout.tsx` (`341d920`) | S38 |
| 5 | Mobile menu stays open after wallet connect | Navbar auto-closes on `isConnected` change (`341d920`) | S38 |

---

## Investigation Notes

### S38 Auth Cleanup — What NOT To Do

**Do NOT call wagmi's `useDisconnect().disconnect()`** when using `@privy-io/wagmi`. It corrupts the connector management and prevents subsequent logins. Three iterations were tried (commits `cdab137`, `8706186`, `8babcbd`) — all broke login.

**Correct approach**: Use Privy's `authenticated` state as the page guard. Let wagmi manage its own connections — just don't show data to unauthenticated users at the UI level.

### S37 Multi-Token Reward Distribution Research

Michael wants partner companies (e.g., FitCaster) to distribute their tokens alongside $CLAWC. Architecture designed:
- `MultiTokenRewardDistributor.sol` — mints CLAWC + distributes partner tokens per workout
- Partner rewards flat per workout (not scaled by tier/streak)
- Anyone can fund partner pools
- Full stack scope: contract + tests + frontend + deploy
- RewardDistributor does NOT exist yet — building from scratch

### Recurring Pattern: Vercel Env Var Whitespace (S29, S31, S32, S38)

Four separate incidents caused by trailing `\n` in Vercel env vars. Prevention: `.trim()` in code or `printf` when adding to Vercel.

---
