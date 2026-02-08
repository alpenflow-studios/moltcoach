# ARCHITECTURE.md — MoltCoach System Design

> **Version**: 1.1.0
> **Project**: MoltCoach
> **Last Updated**: February 7, 2026
> **Changelog**: v1.1 — Corrected health data tracks, added agent lifecycle, database indexes, migration strategy, oracle error handling, rate limiting, x402 clarification, RLS documentation

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                              │
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │    XMTP     │  │  Telegram   │  │ moltcoach   │  │  Farcaster  │       │
│   │  (wallet)   │  │    Bot      │  │    .xyz     │  │  (future)   │       │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
└──────────┼────────────────┼────────────────┼────────────────┼───────────────┘
           │                │                │                │
           └────────────────┴────────┬───────┴────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                        CLAUDE AGENT SDK RUNTIME                             │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    MoltCoach Agent Instance                          │  │
│   │                                                                      │  │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │  │
│   │  │  Personality   │  │   Coaching     │  │    Custom MCP Tools    │ │  │
│   │  │    Engine      │  │    Engine      │  │                        │ │  │
│   │  │  (mode-aware)  │  │  (workouts)    │  │  • wearable_fetch      │ │  │
│   │  └────────────────┘  └────────────────┘  │  • reward_trigger      │ │  │
│   │                                          │  • wallet_ops          │ │  │
│   │  Skills (.claude/skills/):               │  • erc8004_registry    │ │  │
│   │  • fitness-coaching                      │  • health_query        │ │  │
│   │  • nutrition-guidance                    └────────────────────────┘ │  │
│   │  • motivation-support                                               │  │
│   │  • workout-tracking                                                 │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   Hooks:                                                                    │
│   • on_workout_complete → trigger validation request                        │
│   • on_user_message → personality/mode-aware response                       │
│   • on_reward_earned → smart wallet transfer                               │
│   • on_mode_change → personality engine reconfiguration                     │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                      ERC-8004 TRUST LAYER (Base L2)                         │
│                                                                             │
│   ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐  │
│   │  Identity Registry  │ │ Reputation Registry │ │ Validation Registry │  │
│   │                     │ │                     │ │                     │  │
│   │  • Agent NFT (721)  │ │  • Feedback signals │ │  • Workout proofs   │  │
│   │  • Registration     │ │  • Coach ratings    │ │  • Oracle responses │  │
│   │    file (IPFS)      │ │  • Tag filtering    │ │  • TEE attestations │  │
│   │  • Agent wallet     │ │  • Off-chain agg    │ │  • Confidence scores│  │
│   │  • Lifecycle state  │ │  • clientAddresses  │ │  • Rate limiting    │  │
│   └─────────────────────┘ └─────────────────────┘ └─────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                           FINANCIAL LAYER                                   │
│                                                                             │
│   ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐  │
│   │  Coinbase Smart     │ │    $FIT Token       │ │   x402 Payments     │  │
│   │  Wallet (Multisig)  │ │    (ERC-20)         │ │   (micropayments)   │  │
│   │                     │ │                     │ │                     │  │
│   │  • 2-of-2 signing   │ │  • Move-to-earn     │ │  • Premium features │  │
│   │  • Spending limits  │ │  • Staking vault    │ │  • Agent services   │  │
│   │  • User revocation  │ │  • Reward distrib   │ │  • HTTP 402 flow    │  │
│   └─────────────────────┘ └─────────────────────┘ └─────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                         DATA / ORACLE LAYER                                 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Health Data Sources                               │  │
│   │                                                                      │  │
│   │  TRACK A: Direct Wearable APIs (Highest Confidence)                 │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  Strava │ Garmin │ Whoop │ Oura │ Fitbit (OAuth + MCP tools)   │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  TRACK B: Image Upload (Vision-Parsed)                              │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  Apple Watch photo │ Garmin screen │ Gym equipment display     │ │  │
│   │  │  → Claude vision extracts: duration, HR, calories, distance    │ │  │
│   │  │  → Image hash stored for validation evidence                   │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  TRACK C: Manual Entry (Always Available)                           │  │
│   │  ┌────────────────────────────────────────────────────────────────┐ │  │
│   │  │  Chat input │ /log-workout command │ Optional photo/video      │ │  │
│   │  │  Rate limit: max 3/week for no-proof manual (Tier 4)           │ │  │
│   │  └────────────────────────────────────────────────────────────────┘ │  │
│   │                                                                      │  │
│   │  NOTE: Anthropic Health Connectors (Apple Health, Health Connect,   │  │
│   │  HealthEx, Function Health) are consumer-only features in the        │  │
│   │  Claude iOS/Android app. NOT available via Agent SDK for             │  │
│   │  programmatic access. If exposed in the future, integrate as         │  │
│   │  Track D (highest confidence, 1.0x+ multiplier).                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    Validation Oracles                                │  │
│   │                                                                      │  │
│   │  • Stake-secured re-execution (wearable APIs — Tier 1)             │  │
│   │  • Image analysis via Claude vision (image upload — Tier 2)         │  │
│   │  • Peer review + image analysis (manual + proof — Tier 3)          │  │
│   │  • Rate limiting + stake requirement (manual no proof — Tier 4)    │  │
│   │  • zkML proofs (future, sensitive computations)                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Claude Agent SDK Runtime

MoltCoach agents use two SDK patterns depending on the interaction type:

**Interactive coaching sessions** (multi-turn, stateful):
```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

# Create persistent coaching client
client = ClaudeSDKClient(
    options=ClaudeAgentOptions(
        system_prompt=MOLTCOACH_SYSTEM_PROMPT,  # Mode-aware personality
        allowed_tools=[
            # Built-in
            "Read", "Write", "Bash",
            # Custom MCP
            "wearable_fetch",
            "reward_trigger",
            "wallet_ops",
            "erc8004_registry",
            "health_query"
        ],
        setting_sources=["project"],  # Load .claude/skills/
        cwd="/app/moltcoach"
    )
)

# Multi-turn coaching conversation
async for message in client.chat(user_input):
    await send_to_channel(message, user.preferred_channel)
```

**One-shot tasks** (stateless — validation, data extraction, notifications):
```python
from claude_agent_sdk import query, ClaudeAgentOptions

# Single-turn task (e.g., parse an image upload)
async for message in query(
    prompt=f"Extract workout data from this image: {image_url}",
    options=ClaudeAgentOptions(
        allowed_tools=["health_query"],
        cwd="/app/moltcoach"
    )
):
    structured_data = parse_workout_response(message)
```

**Skills Directory**:
```
.claude/skills/
├── fitness-coaching/SKILL.md      # Workout programming
├── nutrition-guidance/SKILL.md    # Meal planning
├── motivation-support/SKILL.md    # Accountability
├── workout-tracking/SKILL.md      # Log and sync
└── reward-management/SKILL.md     # $FIT staking
```

---

### 2. Agent Lifecycle

Managed by `MoltCoachRegistry.sol` on-chain, with personality state in Supabase.

```
                         ┌──────────────────────┐
                         │       SPAWN           │
                         │  (mint NFT, create    │
                         │   wallet, set mode)   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      BONDING          │
                         │  (7 days, agent       │
                         │   learns user,        │
                         │   no missed-workout   │
                         │   penalties)           │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────────┐
                    │             ACTIVE                  │
                    │  (full coaching, rewards enabled,   │
                    │   reputation accumulates)           │
                    └──┬──────┬──────┬──────┬───────────┘
                       │      │      │      │
              ┌────────┘      │      │      └────────┐
              ▼               ▼      ▼               ▼
     ┌──────────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐
     │    EVOLVE     │ │SOFT RESET │ │HARD RESET │ │   ARCHIVE    │
     │ Change mode   │ │Clear hist │ │Archive NFT│ │  Dormant     │
     │ Keep history  │ │Keep wallet│ │Spawn new  │ │  No rewards  │
     │ Keep rep      │ │Keep NFT   │ │Frozen rep │ │  NFT kept    │
     │ Personality   │ │Keep rep   │ │Transfer   │ │  Can react-  │
     │ shifts        │ │Fresh start│ │balance    │ │  ivate       │
     └──────┬───────┘ └─────┬─────┘ └─────┬─────┘ └──────┬───────┘
            │               │             │               │
            └───────────────┴──────┬──────┘               │
                                   ▼                      │
                            Back to ACTIVE ◄──────────────┘
                                               (reactivate)
```

**Modes** (selected at spawn, changeable via Evolve):

| Mode | System Prompt Focus | Behavior Pattern |
|------|-------------------|-----------------|
| **Coach** | Accountability, structure, discipline | Programs workouts, tracks compliance, calls out excuses |
| **Friend** | Encouragement, celebration, empathy | Daily check-ins, mood-aware responses, shares motivation |
| **Mentor** | Strategy, habits, long-term thinking | Focuses on lifestyle patterns, wisdom over intensity |

---

### 3. ERC-8004 Integration

MoltCoach interacts with singleton ERC-8004 registries deployed on Base. It does NOT deploy its own copies.

#### Identity Registry
- Each agent is an ERC-721 NFT
- Token URI points to registration file (IPFS or data URI)
- Registration file contains:
  - Agent name, description, image
  - Service endpoints (A2A, MCP, XMTP, Telegram)
  - Supported trust models
  - Agent wallet address
  - Coach mode (Coach/Friend/Mentor)
- Lifecycle state (bonding/active/archived) tracked in `MoltCoachRegistry.sol`

#### Reputation Registry
- Users submit feedback via `giveFeedback()`
- `valueDecimals: 0` for 0-100 integer scale
- Tags: `tag1` = category ("coaching", "accountability", "nutrition"), `tag2` = subcategory
- `clientAddresses` filtering for Sybil-resistant summaries
- Off-chain aggregation via subgraph for discovery ranking
- Reputation frozen (not deleted) on hard reset — archived agent's score viewable but immutable

#### Validation Registry
- Agents request validation via `validationRequest()`
- Oracles respond via `validationResponse()`
- Response scores: 0-100 (80+ triggers reward eligibility)
- Proof URIs stored on IPFS
- `tag` field: "workout-completion"

---

### 4. Smart Wallet Architecture

```solidity
// Wallet Policy Contract
contract MoltCoachWalletPolicy {
    uint256 public constant DAILY_AUTO_LIMIT = 10e6;  // $10 USDC
    uint256 public constant WITHDRAWAL_DELAY = 24 hours;
    
    // Agent can auto-approve small transactions
    function canAgentAutoApprove(address to, uint256 amount) 
        external view returns (bool);
    
    // Large withdrawals require user + timelock
    function requestWithdrawal(address to, uint256 amount) 
        external returns (bytes32);
    
    // User can always revoke agent
    function revokeAgent() external;
}
```

**Security Layers**:
1. 2-of-2 multisig (agent + user)
2. Daily spending limits ($10 USDC auto-approve)
3. 24h timelock for large amounts
4. Allowlist-only destinations
5. User revocation anytime
6. Pending withdrawal queue (cancelable during timelock)

---

### 5. Health Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  HEALTH DATA ACQUISITION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Detect Available Sources                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  get_health_data_source(user_id)                        │   │
│  │    → "wearable_api" | "image_upload" | "manual"         │   │
│  │    (user may have multiple — return all available)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  Step 2: Fetch Health Data (by track)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TRACK A (wearable_api):                               │   │
│  │    → wearable_fetch MCP tool (OAuth to Strava/Garmin)   │   │
│  │    → Returns structured JSON: HR, duration, distance    │   │
│  │                                                         │   │
│  │  TRACK B (image_upload):                                │   │
│  │    → User sends photo via XMTP/Telegram/Web             │   │
│  │    → health_query MCP tool wraps Claude vision           │   │
│  │    → Extracts: duration, calories, HR, distance          │   │
│  │    → Confidence score returned (50-70% typical)          │   │
│  │    → Image hash stored in Supabase for evidence          │   │
│  │                                                         │   │
│  │  TRACK C (manual):                                      │   │
│  │    → User chats or uses /log-workout command             │   │
│  │    → Agent parses natural language into structured data   │   │
│  │    → Low confidence (20-40%), rate limited (3/week Tier4)│   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│  Step 3: Inform Coaching                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Recovery-aware programming:                            │   │
│  │  • Low HRV / poor sleep → lighter workout               │   │
│  │  • High readiness → push intensity                      │   │
│  │  • Track trends over time (7/30/90 day windows)         │   │
│  │  • Merge data from multiple tracks per session          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Workout Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 WORKOUT VALIDATION PIPELINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Workout Completion Detected                                 │
│     ├── Wearable API shows completed activity                   │
│     ├── Image upload parsed with workout metrics                │
│     ├── User reports completion via chat                        │
│     └── Manual log with optional photo/video                    │
│                          │                                      │
│                          ▼                                      │
│  2. Rate Limit Check (Tier 4 only)                              │
│     ┌─────────────────────────────────────────────────────┐    │
│     │  IF data_source == "manual_no_proof":               │    │
│     │    CHECK manual_count_this_week < 3                  │    │
│     │    IF exceeded → reject, inform user                 │    │
│     └─────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          ▼                                      │
│  3. Validation Request Submitted                                │
│     ┌─────────────────────────────────────────────────────┐    │
│     │  validationRegistry.validationRequest(              │    │
│     │    validatorAddress,    // WorkoutValidator contract  │    │
│     │    agentId,                                         │    │
│     │    proofURI,           // IPFS with workout details  │    │
│     │    workoutHash         // keccak256 of workout data  │    │
│     │  )                                                  │    │
│     └─────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          ▼                                      │
│  4. Oracle Validates (WorkoutValidator.sol)                     │
│     ┌─────────────────────────────────────────────────────┐    │
│     │  TIER 1 (Wearable API): Verify OAuth data integrity  │    │
│     │  TIER 2 (Image Upload): Claude vision + hash match   │    │
│     │  TIER 3 (Manual+Proof): Image analysis + peer review │    │
│     │  TIER 4 (Manual only): Rate-limited, reduced reward  │    │
│     └─────────────────────────────────────────────────────┘    │
│                          │                                      │
│                     ┌────┴────┐                                 │
│                     ▼         ▼                                 │
│              [Success]     [Failure / Oracle Down]               │
│                  │              │                                │
│                  │         ┌────┴─────────────────────────┐     │
│                  │         │ Error Handling:               │     │
│                  │         │ • Oracle timeout (60s):       │     │
│                  │         │   → Queue for retry (3x max)  │     │
│                  │         │ • Oracle down:                │     │
│                  │         │   → Queue, notify user         │     │
│                  │         │   → DO NOT fail open (no free │     │
│                  │         │     rewards on oracle failure) │     │
│                  │         │ • Invalid proof:               │     │
│                  │         │   → Reject, explain to user    │     │
│                  │         └──────────────────────────────┘     │
│                  ▼                                               │
│  5. Validation Response Recorded                                │
│     ┌─────────────────────────────────────────────────────┐    │
│     │  validationRegistry.validationResponse(             │    │
│     │    requestHash,                                     │    │
│     │    score,         // 0-100                          │    │
│     │    evidenceURI,   // Proof of validation            │    │
│     │    tag            // "workout-completion"           │    │
│     │  )                                                  │    │
│     └─────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          ▼                                      │
│  6. Reward Claim (if score >= 80)                               │
│     ┌─────────────────────────────────────────────────────┐    │
│     │  User calls rewardDistributor.claimReward(           │    │
│     │    workoutId                                         │    │
│     │  )                                                  │    │
│     │  → Base reward (100 $FIT)                            │    │
│     │    × tier multiplier (1.0 / 0.85 / 0.7 / 0.5)       │    │
│     │    × streak bonus (1.0 / 1.5 / 2.0 / 2.5)           │    │
│     │  → $FIT minted to user wallet                        │    │
│     │  → Double-claim prevented via claimed mapping        │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 7. x402 Protocol Integration

x402 enables HTTP-native micropayments for premium agent services. When an agent endpoint returns HTTP 402 (Payment Required), the client's wallet automatically fulfills the payment and retries.

**Use Cases in MoltCoach**:
- Premium coaching features (advanced analytics, nutrition plans) gated behind x402
- Agent-to-agent service requests (future: one coach queries a nutrition specialist agent)
- Pay-per-query for non-staked users who want one-time premium access

**Flow**:
```
Client → Agent Endpoint → HTTP 402 + payment details
Client Wallet auto-pays → Retry request with payment proof
Agent Endpoint → 200 OK + premium response
```

> **MVP Note**: x402 is not required for launch. All premium features are initially gated by $FIT staking tiers. x402 integration planned for Stage 2+ as an alternative access method.

---

### 8. Database Schema (Supabase)

```sql
-- Users (canonical identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    agent_id BIGINT,                        -- ERC-8004 token ID
    smart_wallet_address TEXT,              -- Coinbase Smart Wallet
    preferred_channel TEXT DEFAULT 'web',   -- 'xmtp' | 'telegram' | 'web'
    telegram_chat_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent configurations
CREATE TABLE agents (
    id BIGINT PRIMARY KEY,                  -- ERC-8004 token ID
    owner_id UUID REFERENCES users(id),
    personality JSONB NOT NULL,             -- Mode + heartbeat config
    mode TEXT NOT NULL DEFAULT 'coach',     -- 'coach' | 'friend' | 'mentor'
    state TEXT NOT NULL DEFAULT 'bonding',  -- 'bonding' | 'active' | 'archived'
    registration_uri TEXT NOT NULL,         -- IPFS URI
    bonding_ends_at TIMESTAMPTZ,           -- spawn + 7 days
    spawned_at TIMESTAMPTZ DEFAULT now(),
    archived_at TIMESTAMPTZ                -- set on hard reset / archive
);

-- Workouts
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id BIGINT REFERENCES agents(id),
    workout_type TEXT NOT NULL,             -- 'strength' | 'cardio' | 'hiit' | etc
    details JSONB NOT NULL,                 -- Exercises, sets, reps
    duration_minutes INT,
    calories_burned INT,
    heart_rate_avg INT,                    -- nullable, depends on data source
    data_source TEXT NOT NULL,              -- 'wearable_api' | 'image_upload' | 'manual' | 'manual_no_proof'
    data_tier INT NOT NULL,                 -- 1-4 (maps to validation tier)
    image_hash TEXT,                        -- hash of uploaded image (Tier 2/3)
    validation_status TEXT DEFAULT 'pending', -- 'pending' | 'queued' | 'validated' | 'rejected'
    validation_score INT,
    validation_request_hash TEXT,           -- ERC-8004 request hash
    reward_amount NUMERIC,
    streak_bonus NUMERIC DEFAULT 1.0,
    completed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation history
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id BIGINT REFERENCES agents(id),
    channel TEXT NOT NULL,                  -- 'xmtp' | 'telegram' | 'web'
    messages JSONB NOT NULL,                -- Array of {role, content, timestamp}
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reward claims
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    workout_id UUID REFERENCES workouts(id),
    amount NUMERIC NOT NULL,
    tier_multiplier NUMERIC NOT NULL,
    streak_multiplier NUMERIC NOT NULL DEFAULT 1.0,
    tx_hash TEXT,
    status TEXT DEFAULT 'pending',          -- 'pending' | 'distributed' | 'failed'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- INDEXES (critical for query performance)
-- ═══════════════════════════════════════════════════

-- Workout queries: user's history sorted by date
CREATE INDEX idx_workouts_user_completed 
    ON workouts (user_id, completed_at DESC);

-- Streak calculation: find consecutive workout days
CREATE INDEX idx_workouts_user_status_completed 
    ON workouts (user_id, validation_status, completed_at DESC);

-- Tier 4 rate limiting: count manual-no-proof per week
CREATE INDEX idx_workouts_user_source_completed 
    ON workouts (user_id, data_source, completed_at DESC)
    WHERE data_source = 'manual_no_proof';

-- Reward lookup by user
CREATE INDEX idx_rewards_user_created 
    ON rewards (user_id, created_at DESC);

-- Conversation lookup by user + channel
CREATE INDEX idx_conversations_user_channel 
    ON conversations (user_id, channel, updated_at DESC);

-- Agent lookup by owner
CREATE INDEX idx_agents_owner 
    ON agents (owner_id);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users
    FOR ALL USING (wallet_address = current_setting('app.wallet_address'));
    
CREATE POLICY workouts_own_data ON workouts
    FOR ALL USING (user_id = (
        SELECT id FROM users 
        WHERE wallet_address = current_setting('app.wallet_address')
    ));

CREATE POLICY conversations_own_data ON conversations
    FOR ALL USING (user_id = (
        SELECT id FROM users 
        WHERE wallet_address = current_setting('app.wallet_address')
    ));

CREATE POLICY rewards_own_data ON rewards
    FOR ALL USING (user_id = (
        SELECT id FROM users 
        WHERE wallet_address = current_setting('app.wallet_address')
    ));

CREATE POLICY agents_own_data ON agents
    FOR ALL USING (owner_id = (
        SELECT id FROM users 
        WHERE wallet_address = current_setting('app.wallet_address')
    ));
```

#### RLS Configuration (Critical)

Every Supabase request from the API must set `app.wallet_address` before any query:

```typescript
// In Next.js Route Handler or server action
import { createClient } from '@supabase/supabase-js';

async function getAuthenticatedClient(walletAddress: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role for set_config
  );
  
  // CRITICAL: Set wallet context for RLS policies
  await supabase.rpc('set_wallet_context', { 
    wallet: walletAddress 
  });
  
  return supabase;
}

// Supabase function (create via SQL editor):
// CREATE OR REPLACE FUNCTION set_wallet_context(wallet TEXT)
// RETURNS void AS $$
// BEGIN
//   PERFORM set_config('app.wallet_address', wallet, true);
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
```

> **Known Issue (from SMASH Session 9)**: RLS policies have caused "Failed to create" errors in past projects. Always verify INSERT policies exist alongside SELECT/UPDATE. Test with both service role (bypasses RLS) and anon key (enforces RLS) to catch policy gaps.

#### Migration Strategy

All schema changes managed via Supabase migrations:

```bash
# Create a new migration
supabase migration new add_streak_tracking

# Apply locally
supabase db reset

# Push to remote
supabase db push

# View migration history
supabase migration list
```

Migrations stored in `supabase/migrations/` directory. Every schema change requires a migration file — no manual SQL in the dashboard for production.

---

### 9. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  LAYER 1: AGENT PERMISSIONS (Claude SDK)                               │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • Allowlist-only tools (no arbitrary code execution)              │ │
│  │ • Read-only by default, write requires explicit grant             │ │
│  │ • No direct network access except approved endpoints              │ │
│  │ • System prompt immutable after spawn (evolve = new prompt)       │ │
│  │ • Token budget limits per session                                 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  LAYER 2: WALLET SECURITY (Coinbase Smart Wallet)                      │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • 2-of-2 Multisig: Agent + User must co-sign                      │ │
│  │ • Spending limits: Agent can auto-approve < $10/day               │ │
│  │ • Withdrawal delay: 24h timelock for amounts > threshold          │ │
│  │ • Recovery: User can revoke agent signer at any time              │ │
│  │ • Allowlist destinations: Only approved contracts/addresses       │ │
│  │ • Pending withdrawal queue: user can cancel during timelock       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  LAYER 3: TRUST VERIFICATION (ERC-8004)                                │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • Identity Registry: Agent NFT bound to verified wallet           │ │
│  │ • Reputation Registry: Feedback from verified users only          │ │
│  │   - clientAddresses filtering for Sybil resistance                │ │
│  │ • Validation Registry: Cryptographic workout proofs               │ │
│  │   - Stake-secured re-execution for wearable data                  │ │
│  │   - Vision-parsed validation for image uploads                    │ │
│  │   - zkML proofs for sensitive computations (future)               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  LAYER 4: DATA PROTECTION                                              │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • Health data encrypted at rest (user-held keys)                  │ │
│  │ • XMTP: End-to-end encrypted messaging                            │ │
│  │ • Wearable tokens: OAuth with minimal scopes                      │ │
│  │ • No PII stored on-chain (only hashes/commitments)                │ │
│  │ • Data export + deletion supported (see PRD 4.10)                 │ │
│  │ • Image uploads: hash stored, raw image in Supabase Storage       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  LAYER 5: SMART CONTRACT SECURITY                                      │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • OpenZeppelin 5.x only (audited)                                 │ │
│  │ • ReentrancyGuard on all value transfers                          │ │
│  │ • Checks-effects-interactions pattern                             │ │
│  │ • Pausable + Ownable with timelock                                │ │
│  │ • Formal verification for core reward logic                       │ │
│  │ • Bug bounty program (Immunefi)                                   │ │
│  │ • Multi-phase audit: Slither → Internal → External firm           │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  LAYER 6: OPERATIONAL SECURITY                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ • Secrets in HashiCorp Vault / AWS Secrets Manager                │ │
│  │ • API keys rotated every 30 days                                  │ │
│  │ • Admin operations via Safe multisig (3-of-5)                     │ │
│  │ • Incident response runbook                                       │ │
│  │ • Real-time monitoring (Tenderly, Forta)                          │ │
│  │ • Oracle downtime: fail closed (queue, don't reward)              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 10. Validation Trust Model

| Tier | Data Source | Confidence Range | Reward Multiplier | Validation Method | Rate Limit |
|------|-------------|------------------|-------------------|-------------------|------------|
| 1 | Direct Wearable API (OAuth) | 70-90% | 1.0x | Stake-secured verification | None |
| 2 | Image Upload (vision-parsed) | 50-70% | 0.85x | Claude vision + hash match | None |
| 3 | Manual + Photo/Video | 40-60% | 0.7x | Image analysis + peer review | None |
| 4 | Manual (no proof) | 20-40% | 0.5x | Rate limiting + stake requirement | **Max 3/week** |

**Oracle Error Handling Policy**:
- Oracle timeout (>60s): Queue validation request for retry, max 3 attempts with exponential backoff
- Oracle fully down: Queue all pending validations, notify affected users, **fail closed** (no rewards granted without validation)
- Invalid/corrupted proof data: Reject immediately, inform user to resubmit
- Queued validations visible in user dashboard with estimated processing time

---

### 11. Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Sentry | Frontend + API errors |
| PostHog | User analytics, funnel tracking, feature flags |
| Tenderly | Smart contract monitoring, alerts, transaction simulation |
| Forta | On-chain threat detection |
| Grafana | Infrastructure metrics, oracle latency tracking |
| PagerDuty | Incident alerting |

**Key Alerts**:
- Oracle response time > 30s (warning), > 60s (critical)
- Validation queue depth > 100 (investigate oracle health)
- $FIT daily emission approaching 100K cap
- Smart wallet policy bypass attempt
- Failed RLS policy (Supabase audit log)

---

*Document created: February 2026*
*Last updated: February 7, 2026 — v1.1*
