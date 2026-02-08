# ARCHITECTURE.md — System Design

> **Version**: 1.0.0
> **Project**: moltcoach

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENTS                                  │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌──────────────┐  │
│  │  Web App  │   │  XMTP    │   │  Telegram   │   │  moltcoach   │  │
│  │ (Next.js) │   │  Client  │   │    Bot      │   │   .xyz Hub   │  │
│  └─────┬─────┘   └─────┬────┘   └──────┬──────┘   └──────┬───────┘  │
└────────┼───────────────┼───────────────┼────────────────┼───────────┘
         │               │               │                │
         ▼               ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Next.js)                          │
│  /api/auth/*     /api/agent/*     /api/ai/*     /api/rewards/*      │
└─────────────────────────────────────────────────────────────────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                   │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Postgres    │  │  Redis   │  │  IPFS    │  │  Base Chain   │   │
│  │  (Supabase)   │  │(Upstash) │  │(agentURI)│  │  (8453)       │   │
│  └──────────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

Coinbase Smart Wallet authentication:

```
User clicks "Connect Wallet"
    │
    ▼
wagmi connects via Coinbase Smart Wallet
    │
    ▼
Client gets wallet address
    │
    ▼
POST /api/auth/verify
    │  - Server generates nonce
    │  - Client signs nonce with wallet
    │  - Server verifies signature
    │  - Server creates session
    │
    ▼
Authenticated session established
    │
    ▼
Check: Does wallet have a moltcoach agent?
    │
    ├── YES → Load agent, go to dashboard
    └── NO  → Redirect to agent creation + onboarding
```

---

## Agent Creation Flow (ERC-8004)

```
User triggers "Create My Coach"
    │
    ▼
POST /api/agent/create
    │  - Generate agent registration file (personality defaults)
    │  - Upload to IPFS → get agentURI
    │
    ▼
Smart Contract: MoltcoachIdentity.createAgent(agentURI)
    │  - Mints ERC-721 to user wallet
    │  - Registers in ERC-8004 Identity Registry
    │
    ▼
Agent created → Begin onboarding flow
    │  - Personality questions
    │  - Heartbeat preferences
    │  - Persona selection (FHW)
    │
    ▼
Update agent registration file + agentURI
    │
    ▼
Agent active → Dashboard
```

---

## Data Model (Postgres)

```sql
-- Users (canonical identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agents (ERC-8004 identity)
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id_onchain BIGINT UNIQUE,  -- ERC-721 tokenId
    agent_uri TEXT,                    -- IPFS URI
    personality JSONB,
    heartbeat JSONB,
    persona TEXT DEFAULT 'fhw',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workouts
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    type TEXT NOT NULL,
    duration_minutes INT,
    intensity TEXT,
    source TEXT,  -- 'manual', 'strava', 'apple_health', 'garmin'
    raw_data JSONB,
    fit_reward NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Wearable connections
CREATE TABLE wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    provider TEXT NOT NULL,  -- 'strava', 'apple_health', 'garmin'
    access_token TEXT,
    refresh_token TEXT,
    connected_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Caching Strategy

| Data | Store | TTL |
|------|-------|-----|
| User session | Redis | 24h |
| $FIT balance | Client (wagmi) | 15s |
| Agent profile | TanStack Query | 5min |
| Workout history | TanStack Query | 30s |

---

## Monitoring

| Tool | What It Monitors |
|------|------------------|
| Sentry | Frontend + API errors |
| PostHog | User analytics |
| Tenderly | Smart contract transactions |
