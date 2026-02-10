# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-10
- **Duration**: Session 10 (hit 75% context limit)
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 10 (This Session)

1. **TASK-008 completed** — Finished all remaining manual testing:
   - Fixed stale Next.js process + lock file after project move from `~/moltcoach` → `~/Projects/moltcoach`
   - Verified all 5 routes render (/, /staking, /agent, /dashboard, /pricing)
   - Confirmed no hardcoded paths in codebase after project move
   - Staked 10,000 FIT successfully (auto-chain approve→stake flow works)
   - Unstaked 500 FIT — 5% early penalty (25 FIT) correctly routed to FeeCollector, 475 FIT returned to wallet
   - Tier correctly dropped from Elite → Pro after unstake
   - Dashboard displays correct stats

2. **TASK-010 started (~70% coded)** — Agent coaching chat implementation:
   - Installed `@anthropic-ai/sdk` (^0.74.0)
   - Created `src/types/chat.ts` — ChatMessage type
   - Created `src/lib/agentURI.ts` — Shared parseAgentURI utility (extracted from AgentProfileCard)
   - Created `src/lib/systemPrompt.ts` — Server-only system prompt builder with 4 coaching style mappings
   - Created `src/app/api/chat/route.ts` — Streaming Claude API route (first API route in the project!)
   - Created `src/hooks/useChat.ts` — Client-side chat state + streaming fetch with ReadableStream
   - Created `src/components/agent/ChatMessage.tsx` — Message bubble component
   - Created `src/components/agent/ChatInput.tsx` — Text input with Enter-to-send, auto-resize
   - Modified `src/components/agent/AgentProfileCard.tsx` — Uses shared parseAgentURI

3. **Session stopped at 75% context** — Two pieces remain to complete TASK-010 (see "What's In Progress")

### Session 9 (Previous)

- ConnectWallet dropdown consolidation, staking UX fix (auto-chain approve→stake), hero orb, pricing page, landing page pill buttons + placeholders, 8 commits

### Sessions 1-8

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment + verification, shared layout, agent creation, dashboard, toast notifications, 10K FIT minted, multi-wallet support

---

## What's In Progress

**TASK-010 — Agent Coaching Chat** (~70% coded, ~30% remaining):

### DONE:
- [x] Install `@anthropic-ai/sdk`
- [x] `src/types/chat.ts` — ChatMessage type
- [x] `src/lib/agentURI.ts` — Shared parseAgentURI (extracted from AgentProfileCard)
- [x] `src/lib/systemPrompt.ts` — System prompt builder with coaching style mapping
- [x] `src/app/api/chat/route.ts` — Streaming API route (POST, uses Anthropic SDK)
- [x] `src/hooks/useChat.ts` — Client-side chat state + streaming
- [x] `src/components/agent/ChatMessage.tsx` — Message bubble (user right-aligned, assistant left with Bot icon)
- [x] `src/components/agent/ChatInput.tsx` — Textarea with Enter-to-send, Shift+Enter newline, auto-resize
- [x] `src/components/agent/AgentProfileCard.tsx` — Refactored to use shared parseAgentURI

### REMAINING (must be done in order):
- [ ] **`src/components/agent/AgentChat.tsx`** — Main chat container component. Needs:
  - Props: `agentName: string`, `coachingStyle: string`
  - Uses `useChat` hook
  - Card wrapper → scrollable messages list → ChatInput at bottom
  - Auto-scroll to bottom on new messages via `useRef` + `scrollIntoView`
  - Empty state: greeting message from agent based on coaching style
  - Error display via sonner toast
- [ ] **`src/components/agent/AgentPageContent.tsx`** — Modify to add AgentChat below AgentProfileCard when agent exists. Needs:
  - Import `parseAgentURI` from `@/lib/agentURI`
  - Parse the agentURI to extract `name` and `style`
  - Render `<AgentChat agentName={name} coachingStyle={style} />` below the profile card
- [ ] **Verification** — `pnpm typecheck`, `pnpm lint`, `pnpm build` must all pass
- [ ] **Manual test** — Chat with Agent #1 ("daddy", style: "motivator") and verify streaming works

### Architecture Overview:
```
User types message → ChatInput.tsx → AgentChat.tsx → useChat hook
  → fetch POST /api/chat (with messages + agentName + coachingStyle)
  → route.ts builds system prompt via buildSystemPrompt()
  → Anthropic SDK streams response (claude-sonnet-4-5)
  → ReadableStream → useChat reads chunks → updates messages state
  → ChatMessage.tsx renders streamed text in real-time
```

### Style → Coaching Mode Mapping (in systemPrompt.ts):
| Agent Style | Coaching Mode | Personality |
|-------------|--------------|-------------|
| motivator | Coach | High energy, positive reinforcement, accountability |
| drill-sergeant | Drill Sergeant | Tough love, no excuses, military intensity |
| scientist | Mentor (data-driven) | Analytical, systems-thinking, evidence-based |
| friend | Friend | Warm, supportive, conversational |

---

## What's Next

1. **Finish TASK-010** — Build AgentChat.tsx + modify AgentPageContent.tsx + verify (see REMAINING above)
2. **TASK-011: Wire landing page placeholders** — "I AM HUMAN"/"I AM NOT", "Purchase $FIT", email sign-up
3. **TASK-009: Supabase integration** — Depends on Michael completing Supabase project setup
4. **Chat persistence** — Store conversation history in Supabase (after TASK-009)
5. **Pricing page — ETH/USDC pricing** — Michael noted tiers will need real currency pricing
6. **Privy integration** — For email/social onboarding
7. **Wearable integration** — Strava OAuth flow

---

## Decisions Made

- **Theme**: Dark mode default, lime primary accent on zinc base
- **wagmi version**: v3.4.2 (latest)
- **Wallet strategy**: Multi-wallet — injected (MetaMask) + Coinbase Smart Wallet + WalletConnect. Privy planned for production.
- **ERC-8004**: Custom non-upgradeable implementation (not reference UUPS)
- **Agent IDs**: Start at 1, 0 = sentinel for "no agent"
- **Revenue model**: 9 streams, Stage 1 MVP focuses on 3 (tx fees, spawn fee, validation fees)
- **Treasury split**: 40/30/20/10 (dev/buyback/community/insurance)
- **Contract deploy order**: FIT → FeeCollector → Staking → Identity
- **$FIT daily cap**: Adjustable between 10K-500K by owner (default 100K)
- **Staking penalty**: 5% constant (not adjustable), routed to FeeCollector (not burned)
- **stakedAt timer**: Not reset on top-up, only on full unstake + restake
- **Penalty routing**: forceApprove + collectFitFee pattern (preserves FeeCollector tracking)
- **Deploy wallet**: MetaMask for development, Coinbase Wallet for funds
- **Staking UI ABI strategy**: Minimal `as const` ABIs in TypeScript (not Foundry JSON artifacts)
- **Approve flow**: Auto-chained approve→stake (fixed in Session 9, was broken 2-click before)
- **Staking route**: Dedicated `/staking` (not `/dashboard`)
- **tsconfig target**: ES2020 (was ES2017, needed for BigInt literals)
- **Layout**: Shared Navbar + Footer in root layout, pages render content only
- **Agent URI**: `data:application/json,` encoded URI with name, style, version, category
- **Coaching styles**: 4 options — Motivator, Drill Sergeant, Scientist, Friend
- **Toaster**: sonner with hardcoded dark theme (no next-themes dep)
- **Supabase types**: Manual types in `src/types/database.ts` (will replace with generated types later)
- **Farcaster**: "Forged on Farcaster" badge on landing page hero
- **ConnectWallet**: Single button with shadcn DropdownMenu, connectors deduplicated by name
- **Pricing tiers**: Free/Basic(100)/Pro(1000)/Elite(10000) — may change to ETH/USDC pricing later
- **Landing page CTAs**: "I AM HUMAN"/"I AM NOT" pills, "Purchase $FIT" button, email sign-up link (all placeholders)
- **Chat model**: claude-sonnet-4-5-20250929 for coaching responses (fast + capable)
- **Chat architecture**: No external chat library — native fetch + ReadableStream for streaming
- **Chat persistence**: React state only for now (no Supabase yet — TASK-009)
- **Chat location**: Below AgentProfileCard on `/agent` page (not separate route)
- **System prompt**: Built from FITNESS_COACHING_SKILL.md content, customized per coaching style

---

## Open Questions

- [ ] Supabase project — Michael setting up with Claude.ai
- [x] WalletConnect project ID — obtained from cloud.walletconnect.com
- [ ] Coinbase Wallet project ID — needs to be obtained from developer portal
- [ ] XMTP vs Telegram priority for agent comms
- [ ] Agent-to-agent protocol at moltcoach.xyz
- [ ] Which wearable integration first? (Strava likely easiest)
- [ ] Spawn fee: USDC or $FIT or both? (revenue_model.md says both)
- [ ] Privy free tier limits for production auth
- [ ] Pricing in ETH/Base ETH/USDC — Michael flagged this for tiers
- [ ] What do "I AM HUMAN" and "I AM NOT" buttons do? (onboarding paths?)
- [ ] Purchase $FIT mechanism — DEX pool, in-app swap, or external link?

---

## State of Tests

- `forge test` (contracts/): **216 tests pass** (62 FitStaking + 61 FeeCollector + 50 FitToken + 43 MoltcoachIdentity)
- `forge build`: Compiles (pre-existing notes/warnings only, no errors)
- `pnpm typecheck`: NOT YET VERIFIED (TASK-010 in progress)
- `pnpm lint`: NOT YET VERIFIED (TASK-010 in progress)
- `pnpm build`: NOT YET VERIFIED (TASK-010 in progress)

---

## Key Files (Session 10 — Created/Modified)

| File | Action | Status |
|------|--------|--------|
| `src/types/chat.ts` | **NEW** | Complete — ChatMessage type |
| `src/lib/agentURI.ts` | **NEW** | Complete — Shared parseAgentURI |
| `src/lib/systemPrompt.ts` | **NEW** | Complete — System prompt builder with 4 coaching styles |
| `src/app/api/chat/route.ts` | **NEW** | Complete — Streaming POST route using Anthropic SDK |
| `src/hooks/useChat.ts` | **NEW** | Complete — Chat state + streaming fetch |
| `src/components/agent/ChatMessage.tsx` | **NEW** | Complete — Message bubble component |
| `src/components/agent/ChatInput.tsx` | **NEW** | Complete — Text input with auto-resize |
| `src/components/agent/AgentProfileCard.tsx` | **MODIFIED** | Complete — Uses shared parseAgentURI |
| `src/components/agent/AgentChat.tsx` | **NOT CREATED** | Needs building — main chat container |
| `src/components/agent/AgentPageContent.tsx` | **NOT MODIFIED** | Needs chat integration |

---

## On-Chain State (Base Sepolia)

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT total supply**: 10,000 FIT (minted in Session 8)
- **FIT daily mint remaining**: 90,000 FIT
- **Agent #1 registered**: owner=deployer, name="daddy", style="motivator"
- **FIT wallet balance**: 475 FIT (unstaked 500, got 475 after 5% penalty)
- **Staked amount**: 9,500 FIT
- **Staking tier**: Pro (2)
- **FeeCollector balance**: 25 FIT (from early unstake penalty)
- **Protocol total staked**: 9,500 FIT

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/` — add to PATH: `export PATH="/Users/openclaw/.foundry/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"`
- **pnpm**: `/opt/homebrew/bin/pnpm` (v10.29.1)
- **forge commands**: Must run from `contracts/` directory (or use `cd contracts &&`)
- **forge .env loading**: Use `export $(grep -v '^#' .env | xargs)` before forge commands (source .env fails on macOS)
- **ESLint**: `contracts/**` excluded in `eslint.config.mjs` (OZ JS files caused 1000+ errors)
- **Git**: Remote gets "Add files via upload" commits from GitHub web UI — always `git fetch` + rebase before push
- **tsconfig**: Target `ES2020` (changed from ES2017 in Session 6 for BigInt support)
- **Project path**: `~/Projects/moltcoach` (moved from `~/moltcoach` in Session 10)
- **ANTHROPIC_API_KEY**: Must be set in `.env.local` for chat to work
- **Uncommitted work**: TASK-010 files staged but not committed (commit before continuing)

---

## Installed Tools & Packages

| Tool/Package | Version | Location |
|-------------|---------|----------|
| forge | 1.5.1 | `~/.foundry/bin/forge` |
| cast | 1.5.1 | `~/.foundry/bin/cast` |
| anvil | 1.5.1 | `~/.foundry/bin/anvil` |
| OpenZeppelin | 5.2.0 | `contracts/lib/openzeppelin-contracts/` |
| forge-std | latest | `contracts/lib/forge-std/` |
| next | 16.1.6 | node_modules |
| wagmi | 3.4.2 | node_modules |
| viem | 2.45.1 | node_modules |
| @supabase/supabase-js | 2.95.3 | node_modules |
| @anthropic-ai/sdk | ^0.74.0 | node_modules (NEW — Session 10) |
| sonner | latest | node_modules |
| @radix-ui/react-dropdown-menu | latest | node_modules (via shadcn) |

---

*Last updated: Feb 10, 2026 — Session 10*
