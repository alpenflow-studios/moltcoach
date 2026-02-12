# Epic Prompt — Session 28

## Session 28 — Fix Mobile Wallet + Telegram Polish

Read SESSION_HANDOFF.md first. Here's the state:

**DONE (Session 27):**

- TASK-012 (Multi-Token Pricing) COMPLETE — 3 tiers (Free/Pro/Elite), FAQ section, token selector, billing toggle
- Telegram conversation history COMPLETE — Redis-backed, 20-msg cap, /reset command, 7-day TTL
- Hero orb fix COMPLETE — removed overflow-hidden, fixed double-translate in keyframes, overflow-x-clip on layout wrapper
- Orb confirmed looking great on mobile and desktop
- pnpm typecheck + pnpm build pass (17 routes)
- 7 commits total, all pushed, deployed to Vercel, clean tree

**OPEN BUG (CURRENT_ISSUES.md High #1):**

Mobile wallet buttons don't connect. Coinbase Wallet and WalletConnect render as stacked buttons on touch devices but tapping does nothing. This is the THIRD UI attempt (S25: Radix onSelect, S26: plain toggle buttons, S27: direct buttons). The UI renders fine — the issue is deeper.

---

### Task A: Fix Mobile Wallet Connect (P0)

This has been attempted 3 times with different UI approaches. The problem is NOT the UI — `connect({ connector })` is being called but nothing happens on mobile. Time to investigate at the wagmi/connector level.

**File**: `src/components/ConnectWallet.tsx`, `src/config/wagmi.ts`

**Investigation steps:**

1. Add error handling around `connect()` — wagmi's `useConnect` has an `error` state and an `onError` callback. Wire these up and log/display the error so we can see what's actually failing
2. Check wagmi connector config in `src/config/wagmi.ts`:
   - `coinbaseWallet({ preference: "smartWalletOnly" })` — does Smart Wallet work on mobile Safari? Try `preference: "all"` to allow both Smart Wallet and extension
   - `injected()` — on mobile, this won't have a provider unless a wallet app is installed. Should be filtered out (S27 already filters generic "Injected" name)
   - `walletConnect` — requires `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to be set. Verify it's in `.env.local` and on Vercel
3. Test with Safari mobile devtools (Mac → Safari → Develop → iPhone):
   - Check console for errors when tapping a wallet button
   - Check if `connect()` is even being called (add a console.log)
   - Check if the connector's `getProvider()` resolves
4. Consider: Coinbase Smart Wallet on mobile may need to open an external URL or popup. Does the proxy (Basic Auth) interfere with the redirect flow?
5. Fix whatever the root cause is, test on actual mobile device, deploy

**Acceptance criteria:**
- [ ] At least one wallet connects successfully on mobile Safari
- [ ] Error state shown to user if connection fails (not silent failure)
- [ ] `pnpm typecheck` + `pnpm build` pass
- [ ] Deployed and tested on live site

---

### Task B: Test Telegram Conversation History (P1)

Conversation history was deployed in S27 but never tested on the live bot. Verify it works.

**Steps:**

1. Send a few messages to @ClawCoachBot on Telegram
2. Verify the bot remembers context from previous messages (e.g., "My name is Michael" → later ask "What's my name?")
3. Test `/reset` command — send it, then verify the bot no longer remembers prior context
4. Test `/start` command — verify it clears history and shows welcome message
5. If anything is broken, fix it

---

### Task C: If Time — Telegram Wallet Linking (P2)

Let Telegram users link their wallet for x402 integration and on-chain identity.

**Steps:**

1. `/connect` command generates a one-time link to `clawcoach.ai/link?code=<uuid>`
2. Web page lets user connect wallet + associate with Telegram chat ID
3. Store mapping in Supabase: `telegram_links` table (`chat_id`, `wallet_address`, `linked_at`)
4. Once linked, Telegram messages count against the wallet's free tier

---

### 75% rule: Task A is the #1 priority. If you hit 75% after Task A, hand off Tasks B and C.

Session 27 complete. 7 commits total. Pricing page done, telegram history deployed, orb fixed. Mobile wallet is the open P0 bug. Clean tree, all pushed, live at clawcoach.ai.
