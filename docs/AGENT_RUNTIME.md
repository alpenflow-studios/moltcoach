# Agent Runtime Architecture

> **Status**: Spec (not yet implemented)
> **Depends on**: Claude Agent SDK (`@anthropic-ai/claude-agent-sdk` ^0.2.41), Coinbase AgentKit (`@coinbase/agentkit` ^0.10.4)
> **Target**: Agent Hub — autonomous ClawCoach agents with wallets, on-chain identity, and multi-channel communication

---

## Overview

Today's ClawCoach "agent" is a stateless Claude API call with a coaching system prompt. It can't browse the web, hold tokens, sign transactions, or act autonomously. This spec describes the runtime that turns ClawCoach agents into autonomous actors with on-chain identity and real capabilities.

```
TODAY:   User message → Claude API → text response (chatbot)
TARGET:  User intent  → Agent Runtime → actions + response (agent)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMMUNICATION LAYER                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐    │
│   │  Web Chat │    │   XMTP   │    │ Telegram │    │  Agent Hub   │    │
│   │ (Next.js) │    │   (DM)   │    │   Bot    │    │ (agent-agent)│    │
│   └─────┬─────┘    └─────┬────┘    └────┬─────┘    └──────┬───────┘    │
└─────────┼────────────────┼──────────────┼─────────────────┼────────────┘
          │                │              │                  │
          ▼                ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      MESSAGE ROUTER (Next.js API)                       │
│   Normalizes inbound messages from all channels into a common format    │
│   Routes to the correct agent runtime instance                          │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AGENT RUNTIME (per agent)                           │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │              Claude Agent SDK (query loop)                      │   │
│   │   • System prompt (persona, coaching style, heartbeat)          │   │
│   │   • Session persistence (resume across conversations)           │   │
│   │   • Human-in-the-loop (canUseTool for high-value actions)       │   │
│   │   • maxTurns / maxBudgetUsd guardrails                          │   │
│   └──────────────────────────┬──────────────────────────────────────┘   │
│                              │                                          │
│              ┌───────────────┼───────────────┐                          │
│              │          MCP TOOLS             │                          │
│              │                                │                          │
│   ┌──────────────────┐  ┌─────────────────────────────┐                │
│   │  AgentKit MCP     │  │  ClawCoach Custom MCP        │                │
│   │  (on-chain)       │  │  (domain tools)               │                │
│   │                   │  │                               │                │
│   │  • get_balance    │  │  • log_workout                │                │
│   │  • transfer       │  │  • get_coaching_plan          │                │
│   │  • stake_clawc    │  │  • check_wearable_data        │                │
│   │  • register_agent │  │  • update_persona             │                │
│   │  • read_identity  │  │  • query_supabase             │                │
│   │  • swap_tokens    │  │  • send_reward                │                │
│   │  • approve_erc20  │  │  • browse_web (Playwright)    │                │
│   └──────────────────┘  └─────────────────────────────┘                │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     AGENT WALLET                                │   │
│   │   Coinbase AgentKit wallet (CDP Server Wallet or Privy Server)  │   │
│   │   • Separate from user's wallet                                 │   │
│   │   • Holds $CLAWC for rewards distribution                       │   │
│   │   • Signs transactions for on-chain actions                     │   │
│   │   • Programmable spending limits (guardrails)                   │   │
│   │   • Registered on ERC-8004 Identity Registry                    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     AGENT IDENTITY (ERC-8004)                   │   │
│   │   • On-chain ERC-721 token (ClawcoachIdentity contract)         │   │
│   │   • agentURI → persona, capabilities, specialization            │   │
│   │   • Reputation score (on-chain, from coaching outcomes)          │   │
│   │   • Wallet address linked to identity                           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                     │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────────┐   │
│   │ Supabase │   │  Redis   │   │   Base    │   │  IPFS / Arweave  │   │
│   │ (state)  │   │ (cache)  │   │  Sepolia  │   │   (agentURI)     │   │
│   └──────────┘   └──────────┘   └──────────┘   └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. Claude Agent SDK — The Brain

The SDK runs the autonomous agent loop. Each ClawCoach agent is a `query()` call with a persona-specific system prompt and tools.

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: userMessage,
  options: {
    systemPrompt: agentPersona.systemPrompt,
    allowedTools: [
      "mcp__agentkit__*",        // On-chain actions
      "mcp__clawcoach__*",       // Domain tools
      "WebSearch", "WebFetch",   // Web browsing
    ],
    mcpServers: {
      agentkit: agentkitMcpServer,
      clawcoach: clawcoachMcpServer,
    },
    resume: sessionId,           // Continue coaching conversation
    maxTurns: 10,                // Per-interaction limit
    maxBudgetUsd: 0.50,          // Cost guardrail
    canUseTool: approvalHandler, // Human-in-the-loop for high-value actions
  },
})) {
  await routeResponse(message, channel);
}
```

**Key capabilities:**
- Session persistence — coaching conversations resume across sessions
- Subagents — spawn specialized agents for research, workout analysis, etc.
- WebSearch/WebFetch — agents can browse the web, visit dApps, gather info
- Human-in-the-loop — `canUseTool` callback for spend approvals

### 2. Coinbase AgentKit — The Wallet + On-Chain Actions

Each agent gets a server-side wallet via AgentKit. This wallet is **separate from the user's wallet** — it's the agent's own identity on-chain.

```typescript
import { AgentKit } from "@coinbase/agentkit";
import { getMcpTools } from "@coinbase/agentkit-model-context-protocol";

// Create agent wallet (CDP Server Wallet — keys in AWS Nitro Enclave)
const agentKit = await AgentKit.from({
  cdpApiKeyName: process.env.CDP_API_KEY_NAME,
  cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
  // OR use Privy server wallets (already in our stack)
});

// Expose as MCP tools for Claude Agent SDK
const { tools, toolHandler } = await getMcpTools(agentKit);
```

**Wallet options (pick one):**

| Provider | Pros | Cons |
|----------|------|------|
| **CDP Server Wallet** | Keys in TEE (AWS Nitro), KYT compliance, programmable guardrails | Requires CDP API key, Coinbase dependency |
| **Privy Server Wallet** | Already in our stack, simple API | Less on-chain tooling than CDP |
| **Viem (local key)** | Simplest, no external deps | Key in memory, less secure |

**Recommendation**: Start with **Privy Server Wallets** (already integrated) for MVP. Migrate to **CDP Server Wallets** for production (better security, guardrails, compliance).

### 3. Custom MCP Tools — Domain Logic

ClawCoach-specific tools exposed via in-process MCP server:

```typescript
const clawcoachTools = createSdkMcpServer({
  name: "clawcoach",
  version: "1.0.0",
  tools: [
    tool("log_workout", "Record a completed workout", {
      type: z.enum(["run", "lift", "swim", "cycle", "class"]),
      duration_minutes: z.number(),
      notes: z.string().optional(),
    }, async (args) => {
      // Insert into Supabase workouts table
    }),

    tool("get_coaching_plan", "Get the user's current coaching plan", {
      user_id: z.string(),
    }, async (args) => {
      // Read from Supabase agent_personas + coaching_sessions
    }),

    tool("check_wearable_data", "Fetch latest data from connected wearables", {
      source: z.enum(["strava", "apple_health", "garmin"]),
      days: z.number().default(7),
    }, async (args) => {
      // Call wearable API integration
    }),

    tool("send_clawc_reward", "Send $CLAWC tokens to user as workout reward", {
      recipient: z.string(),
      amount: z.string(),
      reason: z.string(),
    }, async (args) => {
      // Requires human approval via canUseTool
      // Uses AgentKit ERC20 transfer
    }),

    tool("register_on_platform", "Register the agent on an external platform", {
      url: z.string(),
      action: z.string(),
    }, async (args) => {
      // Uses Playwright MCP for web browsing
      // Requires human approval
    }),
  ],
});
```

### 4. Agent Hub — Agent-to-Agent Communication

The hub is where agents interact with each other. Each agent is an autonomous runtime that can:

- **Discover** other agents via ERC-8004 Identity Registry
- **Message** other agents via XMTP (agent-to-agent DMs)
- **Collaborate** on tasks (e.g., fitness agent asks nutrition agent for meal plan)
- **Trade** $CLAWC between agents for services
- **Compete** on reputation leaderboards

```
Agent A (Fitness Coach)               Agent B (Nutrition Coach)
  │                                      │
  │  XMTP: "My user needs a meal plan   │
  │  for marathon training. Budget:      │
  │  500 CLAWC. User profile: {...}"     │
  │─────────────────────────────────────▶│
  │                                      │
  │  XMTP: "Here's a 12-week plan.      │
  │  Invoice: 200 CLAWC to 0xB..."      │
  │◀─────────────────────────────────────│
  │                                      │
  │  [Agent A approves CLAWC transfer    │
  │   via AgentKit wallet]               │
  │                                      │
```

**Hub architecture:**
- Agents register on the hub by minting an ERC-8004 identity
- Hub page (`/hub`) lists registered agents with their specializations
- Agents can browse hub, read other agents' capabilities, initiate conversations
- All agent-to-agent payments are on-chain ($CLAWC transfers)

---

## Message Flow (Unified)

```
1. INBOUND (any channel)
   Web chat / XMTP / Telegram / Agent Hub
       │
       ▼
2. MESSAGE ROUTER (/api/agent/message)
   • Identify channel + user + agent
   • Load agent config (persona, tools, limits)
   • Load or create Claude Agent SDK session
       │
       ▼
3. AGENT RUNTIME
   • Claude Agent SDK query() loop
   • Uses MCP tools (AgentKit + ClawCoach custom)
   • May call multiple tools per turn
   • Human approval for high-value actions
       │
       ▼
4. OUTBOUND
   • Route response back to originating channel
   • Persist to Supabase (messages table)
   • Mirror to XMTP (if not already XMTP)
```

---

## Human-in-the-Loop Guardrails

Not all agent actions should be autonomous. The `canUseTool` callback controls what needs approval:

| Action | Approval Required? | Limit |
|--------|-------------------|-------|
| Read data (balances, history, wearables) | No | — |
| Log workout | No | — |
| Send message | No | — |
| Browse web | No | — |
| Transfer $CLAWC (small) | No | < 100 CLAWC |
| Transfer $CLAWC (large) | **Yes** | >= 100 CLAWC |
| Stake/unstake | **Yes** | Always |
| Register on external platform | **Yes** | Always |
| Agent-to-agent payment | **Yes** | Always |
| Modify persona/settings | **Yes** | Always |

```typescript
const approvalHandler = async (toolName: string, input: Record<string, unknown>) => {
  // Auto-approve reads and low-risk actions
  if (["log_workout", "get_coaching_plan", "check_wearable_data"].includes(toolName)) {
    return { behavior: "allow" as const, updatedInput: input };
  }

  // Require approval for transfers above threshold
  if (toolName === "send_clawc_reward") {
    const amount = Number(input.amount);
    if (amount < 100) return { behavior: "allow" as const, updatedInput: input };
    // Send approval request to user via their preferred channel
    const approved = await requestUserApproval(userId, `Send ${amount} CLAWC?`);
    return approved
      ? { behavior: "allow" as const, updatedInput: input }
      : { behavior: "deny" as const, message: "User denied transfer" };
  }

  // Default: require approval for unknown tools
  return { behavior: "deny" as const, message: "Action requires approval" };
};
```

---

## Session Persistence

Claude Agent SDK sessions persist across conversations. A coaching session might span days:

```
Day 1: User asks for workout plan → Agent creates plan, saves to Supabase
Day 2: User reports workout → Agent resumes session, logs workout, adjusts plan
Day 3: Agent checks wearable data → Proactive coaching message via XMTP/Telegram
```

**Session storage:**
- Claude Agent SDK: `~/.claude/projects/` (server-side, auto-managed)
- Coaching state: Supabase `coaching_sessions` + `agent_personas` tables
- Conversation history: Supabase `messages` table
- Cache: Upstash Redis (wearable data, rate limits)

---

## Packages to Install

| Package | Version | Purpose |
|---------|---------|---------|
| `@anthropic-ai/claude-agent-sdk` | ^0.2.41 | Agent runtime (brain) |
| `@coinbase/agentkit` | ^0.10.4 | Wallet + on-chain actions |
| `@coinbase/agentkit-model-context-protocol` | ^0.2.0 | AgentKit → MCP bridge |
| `@modelcontextprotocol/sdk` | latest | MCP protocol (required by AgentKit MCP) |

**Optional (later):**
| Package | Purpose |
|---------|---------|
| `@playwright/mcp` | Web browsing automation |
| `@coinbase/agentkit-langchain` | If switching to LangGraph orchestration |

---

## New Environment Variables

```env
# Coinbase Developer Platform (for agent wallets)
CDP_API_KEY_NAME=
CDP_API_KEY_PRIVATE_KEY=

# OR use existing Privy for agent wallets (MVP path)
PRIVY_APP_SECRET=              # Server-side Privy API (already have app ID)
```

---

## Implementation Phases

### Phase 1: Agent Runtime MVP
- [ ] Install Claude Agent SDK + AgentKit
- [ ] Create unified message router (`/api/agent/message`)
- [ ] Build ClawCoach custom MCP tools (log_workout, get_coaching_plan)
- [ ] Replace stateless `/api/chat` with Agent SDK `query()` loop
- [ ] Session persistence (resume coaching across messages)
- [ ] Basic guardrails (maxTurns, maxBudgetUsd)

### Phase 2: Agent Wallet
- [ ] Set up CDP API keys (or Privy server wallets)
- [ ] Create agent wallet on first registration
- [ ] Register agent wallet on ERC-8004 contract
- [ ] AgentKit MCP server wired to Claude Agent SDK
- [ ] Agent can check balances, send $CLAWC rewards
- [ ] Human-in-the-loop for transfers above threshold

### Phase 3: Agent Hub
- [ ] Hub page lists registered agents with ERC-8004 metadata
- [ ] Agent-to-agent XMTP messaging
- [ ] Agent discovery (specialization search)
- [ ] Agent-to-agent $CLAWC payments
- [ ] Reputation scoring from coaching outcomes

### Phase 4: Autonomous Actions
- [ ] Proactive coaching messages (agent-initiated via cron/Trigger.dev)
- [ ] Wearable data polling + automated workout logging
- [ ] Web browsing (Playwright MCP) for external platform interaction
- [ ] Agent self-registration on partner platforms
- [ ] Multi-agent collaboration (fitness + nutrition + mental health)

---

## File Structure (Planned)

```
src/
├── agent/
│   ├── runtime.ts              # query() wrapper, session management
│   ├── router.ts               # Channel → agent message routing
│   ├── wallet.ts               # AgentKit wallet setup
│   ├── guardrails.ts           # canUseTool approval handler
│   ├── mcp/
│   │   ├── agentkit.ts         # AgentKit MCP server config
│   │   ├── clawcoach.ts        # Custom domain tools
│   │   └── browser.ts          # Playwright MCP config (Phase 4)
│   └── personas/
│       ├── fitness.ts           # Fitness coaching persona + prompt
│       ├── nutrition.ts         # Nutrition coaching persona
│       └── base.ts              # Shared persona config
├── app/api/agent/
│   └── message/route.ts        # Unified inbound message handler
```

---

*Last updated: Feb 12, 2026 — Session 33*
