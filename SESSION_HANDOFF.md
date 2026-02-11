# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-10
- **Duration**: Session 16
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 16 (This Session)

1. **XMTP V2 → V3 Migration (TASK-013)**
   - XMTP V2 (`@xmtp/xmtp-js`) is fully deprecated (May 2025). Registration returned: "publishing to XMTP V2 is no longer available"
   - Replaced `@xmtp/xmtp-js` with `@xmtp/browser-sdk` v6.3.0 (XMTP V3/MLS)
   - Rewrote 3 core files for V3 API:
     - `src/lib/xmtpSigner.ts` — V3 signer: `getIdentifier()` + `Uint8Array` returns + `type: "EOA"`
     - `src/hooks/useXmtpClient.ts` — V3 client types (`inboxId` instead of `address`, `XmtpDmRef`)
     - `src/hooks/useXmtpConversation.ts` — V3 DMs: `createDmWithIdentifier()`, `sendText()`, `sync()` before `messages()`

2. **Agent Registered on XMTP V3**
   - Used `@xmtp/cli` (works on Node v25) to register the agent identity
   - Command: `npx @xmtp/cli client info --wallet-key ... --env dev --db-encryption-key ...`
   - Agent is confirmed reachable: `npx @xmtp/cli can-message 0xC7F8... --env dev` → `true`
   - **Inbox ID**: `b9e2011e0f68256545dc1ee6d06e6de0b38c6721b5dbd424e31503b619a17964`

3. **Fixed Turbopack/WASM Blocker**
   - `@xmtp/browser-sdk` uses Web Workers + WASM internally
   - Turbopack serves workers as blob URLs → WASM `fetch()` fails inside blob context (vercel/next.js#84782)
   - Fix: switched `pnpm dev` from `--turbopack` to `--webpack`
   - Added `next.config.ts`: `asyncWebAssembly`, `.wasm` asset rule, server externals for XMTP packages, `turbopack: {}` to keep build working

4. **Cleaned Up**
   - Deleted broken temp files: `scripts/register-xmtp-agent.mjs`, `src/app/api/xmtp-register/route.ts`
   - Deleted one-time `src/app/admin/xmtp-register/page.tsx` (agent already registered via CLI)
   - Fixed `.env.local` — removed duplicate Upstash entries, fixed malformed `UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL="..."` value

5. **E2E Test — XMTP Connect Works**
   - Michael tested: Connect wallet → agent page → "Connect XMTP" → badge turns green → chat functional
   - Persistence test (load history on reconnect) deferred to next morning

### Session 15 (Previous)

- XMTP V2 code written (5 new files, 5 modified), agent wallet generated, all checks passing
- XMTP agent registration blocked by WASM/ESM issues (resolved in Session 16)

### Sessions 1-14

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment, shared layout, agent creation, dashboard, landing page, pricing page, rebrand to ClawCoach, per-wallet rate limiting, streaming chat, ERC-8128 agent auth, Agent Hub, multi-token pricing, Supabase setup guide

---

## What's In Progress

### XMTP Persistence Test (Manual)

Michael will test the full persistence loop in the morning:
1. Send messages with XMTP connected
2. Refresh page → reconnect XMTP
3. Verify history loads and Claude has context from prior messages

If it works: TASK-013 core acceptance criteria are met.
If history doesn't load: debug `useXmtpConversation` init flow.

---

## What's Next

1. **Verify XMTP persistence** — morning test (see above)
2. **Supabase Integration (TASK-009)** — Michael setting up project, guide at `docs/SUPABASE_SETUP.md`
3. **Telegram Integration (TASK-014)** — not started
4. **Vercel password protection** — dashboard toggle
5. **Privy integration** — email/social onboarding

---

## XMTP Architecture (Implemented — V3)

### How It Works (MVP)
```
User clicks "Connect XMTP" in chat header
  → useXmtpClient: dynamic import @xmtp/browser-sdk, create V3 client (wallet signature)
  → useXmtpConversation: createDmWithIdentifier(agent address), sync(), load history

User sends message:
  ├─ HTTP path (existing): POST /api/chat → Claude → streamed response
  └─ XMTP path (new): onMessageComplete callback writes both user + AI messages to XMTP DM

On page reload with XMTP connected:
  → Load DM history from XMTP → seed useChat with initialMessages
```

### V3 Key Differences from V2
- Package: `@xmtp/browser-sdk` (not `@xmtp/xmtp-js`)
- Identity: `inboxId` (not Ethereum address)
- Conversations: `createDmWithIdentifier()` (not `newConversation(address)`)
- Send: `dm.sendText()` (not `conversation.send()`)
- History: `dm.sync()` then `dm.messages()` (not just `conversation.messages()`)
- Signer: `getIdentifier()` + `Uint8Array` returns (not `getAddress()` + hex string)
- DB: OPFS (Origin Private File System) — no COOP/COEP headers needed (uses SyncAccessHandle Pool VFS)
- Bundler: Requires webpack for dev (Turbopack can't handle Workers + WASM)

### Message Role Convention
- User messages: sent as-is to XMTP
- AI responses: sent with `[assistant] ` prefix (parsed back on reload)
- Phase 2: Agent has own XMTP client, prefix no longer needed

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/xmtpSigner.ts` | viem → XMTP V3 signer adapter |
| `src/config/xmtp.ts` | XMTP env, agent address, prefix constant |
| `src/hooks/useXmtpClient.ts` | V3 client lifecycle + structural types |
| `src/hooks/useXmtpConversation.ts` | DM creation, sync, history, send |
| `src/components/agent/XmtpStatus.tsx` | Status badge component |
| `src/hooks/useChat.ts` | Extended with `initialMessages` + `onMessageComplete` |
| `src/components/agent/AgentChat.tsx` | Integrates XMTP status + mirroring |
| `src/components/agent/AgentPageContent.tsx` | Wires hooks, auto-connect from `?xmtp=1` |
| `next.config.ts` | Webpack WASM config + server externals for XMTP |

---

## Decisions Made

- **XMTP V3 SDK**: `@xmtp/browser-sdk` v6.3.0 (V2 deprecated, forced migration) (Session 16)
- **XMTP agent inbox ID**: `b9e2011e0f68256545dc1ee6d06e6de0b38c6721b5dbd424e31503b619a17964` (Session 16)
- **Dev bundler**: webpack (not Turbopack) — XMTP WASM workers incompatible with Turbopack (Session 16)
- **XMTP agent address**: `0xC7F839B81bc55a400423B7c8A6beF0Ad7c48E4bB` (Session 15)
- **XMTP message convention**: `[assistant] ` prefix for AI responses from user's client (Session 15)
- **XMTP dynamic import**: code-split, only loaded on "Connect XMTP" click (Session 15)
- **Pricing model**: DUAL — Stake $FIT OR Subscribe USDC/ETH (Session 14)
- **Subscription pricing**: Free / $10 / $50 / $200 per month
- **Billing discounts**: Quarterly 10%, Annual 20%
- **XMTP architecture**: Browser-side + HTTP AI for MVP
- **Agent XMTP wallet**: New dedicated wallet (not deployer)
- **Theme**: Dark mode, lime primary on zinc
- **wagmi**: v3.4.2
- **Wallets**: Multi-wallet (MetaMask + Coinbase Smart Wallet + WalletConnect)
- **ERC-8004**: Custom non-upgradeable
- **ERC-8128**: `@slicekit/erc8128`, Upstash Redis nonce store
- **Agent Hub**: `/hub` — chain events, no Supabase dependency
- **API versioning**: `/api/v1/` for agent endpoints
- **Revenue**: 9 streams, MVP focuses on 3. Treasury 40/30/20/10
- **Chat model**: claude-sonnet-4-5-20250929
- **Brand**: ClawCoach (clawcoach.ai)
- **Beta**: Vercel password + rate limiting (50/hr, 200/day)

---

## State of Tests

- `forge test`: **216 tests pass**
- `pnpm typecheck`: **PASSES**
- `pnpm lint`: **PASSES** (0 errors, 0 warnings)
- `pnpm build`: **PASSES** (14 routes)

---

## On-Chain State (Base Sepolia)

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT supply**: 10,000 FIT | **Wallet**: 475 FIT | **Staked**: 9,500 FIT
- **Tier**: Pro (2) | **FeeCollector**: 25 FIT
- **Agent #1**: "daddy", motivator

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/`
- **pnpm**: v10.29.1 | **Next.js**: 16.1.6 | **Node**: v25.6.0
- **Project**: `~/Projects/moltcoach`
- **Dev server**: `pnpm dev` uses `--webpack` (not Turbopack) for XMTP WASM compatibility
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent address + registered on V3
- **NOT configured**: Supabase (guide ready), Coinbase Wallet project ID

---

*Last updated: Feb 10, 2026 — Session 16*
