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
| 1 | Wallet connect dropdown items don't respond to taps on mobile | `src/components/ConnectWallet.tsx` | S25 | Radix DropdownMenu + mobile touch. Tried `onSelect` instead of `onClick` + `modal={false}` — still broken. Dropdown opens and shows Injected/Coinbase/WalletConnect but tapping items does nothing. May need to replace dropdown with inline buttons or a Dialog on mobile. See investigation notes below. |

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
| 1 | Next.js 16 middleware deprecation warning | Migrated `middleware.ts` → `proxy.ts` | S25 |
| 2 | Mobile hero horizontal scroll | Added `overflow-hidden` + `-translate-x/y-1/2` to orb | S25 |

---

## Investigation Notes

### High #1: Mobile wallet dropdown (S25)

**Symptom**: On mobile (iOS Safari tested), tapping "Connect Wallet" opens the Radix DropdownMenu. Items visible: Injected, Coinbase Wallet, WalletConnect. Tapping any item does nothing — no wallet popup, no error, no console output.

**What was tried (S25)**:
1. Changed `onClick` → `onSelect` on `DropdownMenuItem` (Radix canonical event) — no change
2. Added `modal={false}` on `DropdownMenu` to avoid focus trap — no change

**Root cause hypotheses**:
- Radix `DropdownMenuPrimitive.Item` may have a pointer event conflict on mobile Safari where `pointerup` doesn't fire correctly inside portaled content
- The `[&_svg]:pointer-events-none` CSS rule on menu items may interfere with touch target
- Wallet `connect()` opens popups (Coinbase Smart Wallet → keys.coinbase.com). If `connect()` call loses the "user gesture" synchronous context, the browser silently blocks the popup

**Recommended fix approaches (for S26)**:
1. **Replace DropdownMenu with Dialog/Sheet on mobile** — use `useMediaQuery` to render inline buttons or a bottom sheet instead of Radix dropdown on touch devices
2. **Replace DropdownMenu entirely** — use plain `<button>` elements that each call `connect()` directly, styled as a list. Avoids all Radix pointer event complexity
3. **Debug on actual device** — connect Safari Web Inspector to iPhone to see if `onSelect` fires at all (console.log before `connect()` call)
