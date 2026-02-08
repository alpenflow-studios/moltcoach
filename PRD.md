# PRD.md — MoltCoach Product Requirements Document

> **Version**: 1.1.0
> **Project**: MoltCoach
> **Last Updated**: February 7, 2026
> **Status**: Draft
> **Changelog**: v1.1 — Corrected health data architecture, added coach lifecycle, scaled success metrics, added competitive landscape, data portability, SDK corrections

---

## 1. Overview

### What Is This?
MoltCoach is a decentralized autonomous AI coaching platform where each user spawns their own personalized coaching agent. Agents are powered by the Claude Agent SDK, registered on-chain via ERC-8004 trust infrastructure, and equipped with Coinbase Smart Wallet multisig capabilities for financial autonomy. Users earn $FIT tokens through verified workout completion (move-to-earn), with coaches gathering at moltcoach.xyz for interaction and community.

### One-Liner
Autonomous AI fitness coaches with wallets, reputation, and move-to-earn rewards.

### Target Chain
Base (chainId 8453) — Ethereum L2, low gas, Coinbase ecosystem alignment. Base only for MVP — no multi-chain support.

### Core Value Proposition
1. **Personal AI coach** that knows you, adapts to you, and holds you accountable — as a coach, friend, or mentor
2. **Move-to-earn rewards** via cryptographically verified workout completion
3. **Coach ownership** — your agent is an NFT you control, with portable reputation
4. **Accessible to anyone with a phone** — no wearable, no API key, no wallet required to start
5. **95% coach retention** vs traditional platforms' 65-70% through better economics and data ownership

---

## 2. Users

### Primary Persona: Crypto-Native Fitness Enthusiast
- **Who**: 25-40 year old, already uses wallets and DeFi, interested in fitness
- **Web3 Familiarity**: Intermediate to Advanced
- **Goal**: Get fit while earning rewards, own their data
- **Pain Point**: Existing fitness apps are centralized, don't reward consistency

### Secondary Persona: Independent Fitness Coach
- **Who**: Personal trainer frustrated with 30-40% platform fees
- **Web3 Familiarity**: Beginner to Intermediate
- **Goal**: Reach clients without intermediaries, keep more revenue
- **Pain Point**: TrueCoach/Trainerize take too much, no data ownership

### Tertiary Persona: Health-Conscious Professional
- **Who**: Busy professional wanting accountability
- **Web3 Familiarity**: Beginner
- **Goal**: Consistent fitness routine with AI guidance
- **Pain Point**: Can't afford human coach, apps lack personalization

---

## 3. Technical Stack

| Layer | Technology |
|-------|------------|
| **Agent Runtime** | Claude Agent SDK (Python + TypeScript) |
| **Trust Layer** | ERC-8004 (Identity, Reputation, Validation Registries) |
| **Wallet** | Coinbase Smart Wallet SDK (Multisig) |
| **Token** | $FIT (ERC-20 on Base) |
| **Payments** | x402 Protocol (micropayments for premium agent services) |
| **Messaging** | XMTP (primary), Telegram Bot API (secondary), Web chat (tertiary) |
| **Frontend** | Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui |
| **Web3** | wagmi v2, viem, WalletConnect |
| **Contracts** | Solidity ^0.8.20, Foundry, OpenZeppelin 5.x |
| **Database** | Supabase (Postgres + RLS) |
| **Health Data** | Direct wearable APIs + image upload (vision) + manual entry |
| **Hosting** | Vercel |

> **Note on Health Data**: Anthropic's Claude for Healthcare (Jan 2026) provides Apple Health and Android Health Connect integration via the Claude iOS/Android consumer app. This is NOT available through the Agent SDK for programmatic access. MoltCoach uses direct wearable APIs, image-based data capture, and manual entry instead. If Anthropic exposes health connectors to the Agent SDK in the future, this becomes a high-priority integration.

---

## 4. Features

### 4.1 Agent Spawning & Lifecycle (P0)

**User Story**: As a user, I want to spawn my own MoltCoach agent and shape the coaching relationship over time.

**Flow**:
1. User connects wallet at moltcoach.xyz
2. User completes onboarding questionnaire (goals, fitness level, preferences, communication style, coach mode preference)
3. System mints ERC-8004 Identity NFT for agent
4. System creates Coinbase Smart Wallet (2-of-2 multisig: agent + user)
5. Agent initializes with personality from onboarding in selected mode
6. 7-day bonding period begins (agent learns preferences, no penalties for missed workouts)
7. Agent transitions to Active state after bonding

**Agent Relationship Modes** (selected during onboarding, changeable anytime):

| Mode | Personality | Behavior |
|------|-------------|----------|
| **Coach** | Structured, accountable, pushes you | Programs workouts, tracks compliance, calls out excuses |
| **Friend** | Encouraging, casual, celebrates wins | Checks in daily, shares motivation, adapts to mood |
| **Mentor** | Wise, strategic, long-view thinking | Focuses on habits over workouts, lifestyle coaching |

**Lifecycle States**:
```
SPAWN → BONDING (7 days) → ACTIVE → [EVOLVE | SOFT RESET | HARD RESET | ARCHIVE]
```

- **Evolve**: Change mode (Coach↔Friend↔Mentor). History preserved, personality shifts.
- **Soft Reset**: Clear workout history + personality. Keep wallet, NFT, reputation.
- **Hard Reset**: Archive old agent NFT (frozen reputation), spawn new agent. Wallet balance transfers.
- **Archive**: Agent goes dormant. No rewards. NFT retained. Can reactivate anytime.

**Acceptance Criteria**:
- [ ] Wallet connection works (WalletConnect, Coinbase Wallet, injected)
- [ ] Onboarding captures: fitness goals, experience level, equipment, workout types, communication style, motivation preferences, coach mode (Coach/Friend/Mentor)
- [ ] ERC-8004 Identity NFT minted with valid registration file
- [ ] Coinbase Smart Wallet created with correct multisig config
- [ ] Agent responds within 5 seconds of first message
- [ ] Bonding period enforced (7 days, no reward penalties)
- [ ] Evolve changes mode without losing history
- [ ] Soft reset clears history, preserves wallet/NFT/reputation
- [ ] Hard reset archives old NFT, spawns new agent
- [ ] Archive pauses agent, reactivate resumes
- [ ] `forge test --match-test testAgentSpawn` passes
- [ ] `forge test --match-test testAgentLifecycle` passes
- [ ] `pnpm typecheck` passes

**Technical Notes**:
- Claude Agent SDK: Use `ClaudeSDKClient` for interactive multi-turn coaching sessions, `query()` for one-shot tasks
- Store personality config in IPFS, reference in ERC-8004 registration file
- Smart Wallet factory pattern for deterministic addresses
- Lifecycle state managed by `MoltCoachRegistry.sol`

---

### 4.2 Health Data Integration (P0)

**User Story**: As a user, I want my coach to understand my health data so workouts are personalized — whether I have a smartwatch or just a phone.

**Data Tracks** (all three always available, not mutually exclusive):

| Track | Method | How It Works | Confidence |
|-------|--------|-------------|------------|
| **A: Device Sync** | Direct wearable APIs (OAuth) | Strava, Garmin, Whoop, Oura, Fitbit integration via custom MCP tools | 70-90% |
| **B: Image Upload** | Photo of health screen | User photographs Apple Watch, Garmin app, gym treadmill display. Agent extracts data via Claude vision. | 50-70% |
| **C: Manual Entry** | Chat-based logging | User tells agent "I ran 3 miles in 28 minutes" or uses `/log-workout` command | 20-40% |

**Design Principle**: Anyone with a phone can use MoltCoach. No wearable device, no API account, no OAuth dance required. A photo of your gym's treadmill screen is a valid data source.

**Image Upload Flow**:
```
User takes photo → sends via XMTP/Telegram/Web
  → Agent receives image
  → Claude vision extracts: duration, calories, HR, distance, etc.
  → Structured data stored in Supabase
  → Image hash stored for validation evidence
```

**Acceptance Criteria**:
- [ ] OAuth flow works for at least 1 wearable API (Strava recommended as first)
- [ ] Agent can receive and parse images of health screens via all 3 channels
- [ ] Vision extraction correctly identifies: duration, calories, heart rate, distance (>80% accuracy)
- [ ] Manual entry via chat and `/log-workout` command both work
- [ ] Health data informs workout recommendations (recovery-aware programming)
- [ ] Privacy: health data never stored on-chain, only hashes for validation
- [ ] User can use multiple tracks simultaneously (e.g., Strava for runs, image upload for gym)

**Technical Notes**:
- Custom MCP tool `wearable_fetch` for OAuth-based wearable APIs
- Custom MCP tool `health_query` for image-based extraction (wraps Claude vision)
- Implement `get_health_data_source()` to detect available sources per user
- Store raw images in Supabase Storage, structured data in `workouts` table
- Future: If Anthropic exposes health connectors via Agent SDK, integrate as Track D (highest confidence)

---

### 4.3 Workout Tracking & Coaching (P0)

**User Story**: As a user, I want my coach to create workouts, track my progress, and adapt programming based on my performance.

**Capabilities**:
- Generate personalized workout programs
- Log completed workouts (via wearable sync, image upload, chat, or manual entry)
- Track progressive overload (weight, reps, volume)
- Adjust programming based on recovery metrics
- Provide form cues and technique guidance

**Acceptance Criteria**:
- [ ] Agent generates workout with warm-up, main work, cool-down
- [ ] Agent logs workout completion with timestamp
- [ ] Agent tracks workout history (accessible via `/history` command)
- [ ] Agent adjusts intensity based on sleep/HRV when available
- [ ] Workout data stored in Supabase with user ownership

**Technical Notes**:
- Use `.claude/skills/fitness-coaching/SKILL.md` for workout programming
- Implement `/log-workout` slash command
- Store workout history in `workouts` table with user_id and agent_id

---

### 4.4 Workout Validation & Rewards (P0)

**User Story**: As a user, I want to earn $FIT tokens when I complete verified workouts.

**Validation Tiers** (revised — reflects actual data tracks):

| Tier | Source | Confidence | Reward Multiplier | Rate Limit |
|------|--------|------------|-------------------|------------|
| 1 | Direct Wearable API (OAuth) | 70-90% | 1.0x | None |
| 2 | Image Upload (vision-parsed) | 50-70% | 0.85x | None |
| 3 | Manual + Photo/Video Proof | 40-60% | 0.7x | None |
| 4 | Manual (no proof) | 20-40% | 0.5x | Max 3/week |

**Streak Bonuses** (incentivize consistency):

| Streak | Bonus Multiplier |
|--------|-----------------|
| 7 consecutive days | 1.5x |
| 30 consecutive days | 2.0x |
| 90 consecutive days | 2.5x |

**Flow**:
1. User completes workout
2. Agent detects completion (wearable data, image upload, or user report)
3. Agent submits validation request to ERC-8004 Validation Registry
4. WorkoutValidator oracle validates data (method depends on tier)
5. Validation response recorded on-chain
6. If valid (score ≥ 80), user calls `claimReward()` on RewardDistributor
7. $FIT minted to user wallet (base reward × tier multiplier × streak bonus)

**Acceptance Criteria**:
- [ ] Validation request submitted to ERC-8004 Validation Registry
- [ ] Validation oracle responds within 60 seconds
- [ ] $FIT reward transferred on successful validation
- [ ] Reward amount scales with validation tier
- [ ] Streak bonuses applied correctly at 7/30/90 day thresholds
- [ ] Tier 4 rate limited to 3 per week per user
- [ ] User can view reward history
- [ ] `forge test --match-test testWorkoutValidation` passes
- [ ] `forge test --match-test testStreakBonus` passes

**Technical Notes**:
- `erc8004_registry` MCP tool for validation requests
- `WorkoutValidator.sol` is the on-chain oracle responder
- `RewardDistributor.sol` handles $FIT minting with streak logic
- Daily emission cap: 100K $FIT/day across all users

---

### 4.5 Messaging Integration (P0)

**User Story**: As a user, I want to communicate with my coach via my preferred platform.

**Supported Channels** (priority order):
1. **XMTP** — decentralized, wallet-native, E2E encrypted (primary)
2. **Telegram** — familiar, accessible, low barrier (secondary)
3. **Web chat** — moltcoach.xyz, no install required (tertiary)

**Acceptance Criteria**:
- [ ] User can select preferred communication channel during onboarding
- [ ] Agent responds on selected channel within 5 seconds
- [ ] Messages are end-to-end encrypted (XMTP native, Telegram via bot API)
- [ ] User can switch channels without losing context
- [ ] Agent maintains conversation history across channels
- [ ] Image uploads work on all 3 channels (for health data Track B)

**Technical Notes**:
- XMTP SDK for decentralized messaging
- Telegram Bot API with webhook integration
- Shared conversation state in Supabase `conversations` table

---

### 4.6 Coach Rating & Reputation (P1)

**User Story**: As a user, I want to rate my coach so others can discover effective coaches.

**Flow**:
1. User provides feedback (value 0-100, optional tags)
2. Feedback submitted to ERC-8004 Reputation Registry via `giveFeedback()`
3. Agent's reputation score updated
4. Reputation visible on moltcoach.xyz discovery page

**Acceptance Criteria**:
- [ ] User can rate coach after any session
- [ ] Rating submitted to Reputation Registry with tags (e.g., "accountability", "nutrition", "motivation")
- [ ] Agent profile shows aggregate reputation score
- [ ] Discovery page ranks coaches by reputation
- [ ] `forge test --match-test testReputationFeedback` passes

**Technical Notes**:
- ERC-8004 `giveFeedback()` with `valueDecimals: 0` for 0-100 scale
- Tags: "coaching", "accountability", "nutrition", "motivation", "programming"
- `tag1` for category, `tag2` for subcategory
- Reputation aggregation off-chain via subgraph, on-chain signals for composability
- `clientAddresses` filtering required for Sybil-resistant summaries

---

### 4.7 $FIT Token & Staking (P1)

**User Story**: As a user, I want to stake my $FIT tokens for additional benefits.

**Token Utility**:
- Earned via validated workout completion
- Stake for premium features (advanced analytics, priority support)
- Required for agent spawning (anti-Sybil)
- Stake for governance weight (future, Stage 3)

**Premium Tiers** (based on staked $FIT):

| Tier | Staked Amount | Features |
|------|--------------|----------|
| Free | 0 | Basic coaching, manual entry only |
| Basic | 100 $FIT | +Wearable API integration |
| Pro | 1,000 $FIT | +Advanced analytics, nutrition guidance |
| Elite | 10,000 $FIT | +Priority support, early access to new features |

**Acceptance Criteria**:
- [ ] $FIT token contract deployed and verified
- [ ] Users can stake $FIT via moltcoach.xyz
- [ ] Staking unlocks premium features based on tier
- [ ] Unstaking has 7-day cooldown
- [ ] Token economics prevent death spiral (1B max supply, 100K/day emission cap, burn mechanism)

**Technical Notes**:
- `FITToken.sol`: ERC-20 with OpenZeppelin 5.x, ERC20Permit for gasless approvals
- `StakingVault.sol`: Tiered premium with 7-day cooldown
- `RewardDistributor.sol`: Emissions schedule with daily cap

---

### 4.8 Smart Wallet Security (P0)

**User Story**: As a user, I want my funds protected even if my agent is compromised.

**Security Model**:
- 2-of-2 multisig: Agent + User must co-sign
- Daily auto-approve limit: $10 USDC equivalent
- Withdrawals > threshold: 24h timelock
- User can revoke agent signer anytime
- Allowlist-only destinations

**Acceptance Criteria**:
- [ ] Smart Wallet enforces 2-of-2 for amounts > daily limit
- [ ] Agent can auto-approve small reward claims
- [ ] Large withdrawals require user signature + 24h delay
- [ ] User can revoke agent via moltcoach.xyz
- [ ] `forge test --match-test testWalletSecurity` passes

**Technical Notes**:
- Coinbase Smart Wallet SDK with `MoltCoachWalletPolicy.sol`
- Monitor with Tenderly alerts

---

### 4.9 moltcoach.xyz Platform (P1)

**User Story**: As a user, I want a web interface to manage my coach, view progress, and discover other coaches.

**Pages**:
- `/` — Landing, value prop, CTA to spawn coach
- `/spawn` — Onboarding questionnaire (mode selection, goals, preferences)
- `/dashboard` — Coach stats, workout history, $FIT balance, streak tracker, premium tier
- `/chat` — Web-based chat with coach (image upload supported)
- `/discover` — Browse coaches by reputation, filter by tags
- `/settings` — Coach mode, reset options, channel preferences, data export
- `/gathering` — Agent-to-agent interaction space (Stage 3)

**Acceptance Criteria**:
- [ ] Landing page converts visitors to wallet connection
- [ ] Dashboard shows workout history, $FIT balance, coach stats, streak
- [ ] Chat interface works with real-time responses and image upload
- [ ] Discover page lists coaches ranked by reputation
- [ ] Settings page supports evolve, soft reset, hard reset, archive
- [ ] Mobile responsive (375px+)
- [ ] Lighthouse performance score > 90

---

### 4.10 Data Export & Deletion (P1)

**User Story**: As a user, I want to export or delete my data because I own it.

**Capabilities**:
- Export all workout history as JSON/CSV
- Export conversation history
- Export health data (structured, not raw images)
- Delete all off-chain data (Supabase) on request
- On-chain data (NFT, reputation, validation) remains as immutable record

**Acceptance Criteria**:
- [ ] `/settings/data` page with export and deletion options
- [ ] Export generates downloadable JSON with all user data
- [ ] Deletion removes all Supabase records for user
- [ ] Deletion does NOT affect on-chain records (explained to user)
- [ ] Confirmation required before deletion (irreversible)

**Technical Notes**:
- Supabase RPC function for bulk export
- Deletion cascades through all tables via foreign keys
- On-chain NFT and reputation are permanent by design (explained in UI)

---

## 5. Milestones

### Stage 1: Foundation (MVP) — Q1 2026
**Goal**: Core coaching loop works. Users can spawn, chat, workout, earn.

**Exit Criteria**:
- [ ] Agent spawning with ERC-8004 identity and mode selection
- [ ] Health data integration (1 wearable API + image upload + manual entry)
- [ ] Workout tracking and basic validation
- [ ] $FIT rewards on verified completion with streak bonuses
- [ ] XMTP + Telegram + web messaging
- [ ] Coach lifecycle (evolve, soft reset, hard reset, archive)
- [ ] Deployed to Base Sepolia
- [ ] 10 beta testers complete full flow

---

### Stage 2: Launch & Growth — Q2 2026
**Goal**: Mainnet. Real users. Token live.

**Exit Criteria**:
- [ ] Mainnet contracts verified on Basescan
- [ ] $FIT token launched (no public sale, earn-only initially)
- [ ] moltcoach.xyz live with full feature set
- [ ] 500+ spawned coaches (minimum viable), stretch: 5,000
- [ ] 1,000+ verified workouts
- [ ] Zero critical bugs for 2 weeks

---

### Stage 3: Platform Expansion — Q3-Q4 2026
**Goal**: Expand beyond fitness to universal coaching.

**Exit Criteria**:
- [ ] Life coaching vertical launched
- [ ] Career coaching vertical launched
- [ ] Coach-created custom skills
- [ ] Agent-to-agent collaboration (gathering)
- [ ] Governance proposal system

---

### Stage 4: Hardware & Ecosystem (2027+)
**Goal**: Dedicated wearable hardware and open ecosystem.

**Exit Criteria**:
- [ ] MoltCoach wearable prototype (BLE band/clip → phone → agent)
- [ ] Haptic nudges from agent ("time to move", "great session")
- [ ] Third-party coaching skill marketplace
- [ ] Open protocol for other coaching platforms

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Agent response time | < 5 seconds |
| Validation oracle response | < 60 seconds |
| API response time (p95) | < 500ms |
| Uptime | 99.5% |
| Contract gas (spawn) | < 200k gas |
| Contract gas (validate) | < 100k gas |
| First Contentful Paint | < 1.5s |
| Image upload → data extraction | < 10 seconds |
| Vision extraction accuracy | > 80% for standard metrics |

---

## 7. Out of Scope (MVP)

- Fiat on/off ramps
- Native mobile app (PWA only)
- DAO governance (Stage 3)
- Human coach marketplace
- Video/voice coaching
- Wearable hardware partnerships (Stage 4)
- Multi-chain support (Base only)
- Anthropic Health Connector SDK integration (consumer-only feature, not available via Agent SDK)
- Agent-to-agent communication (Stage 3)

---

## 8. Competitive Landscape

| Competitor | Category | Differentiator from MoltCoach |
|------------|----------|-------------------------------|
| **StepN** | Move-to-earn | Requires purchasing NFT sneakers. Walking/running only. No coaching intelligence. MoltCoach: free to start, all workout types, AI coaching. |
| **Sweatcoin** | Move-to-earn | Steps only, centralized rewards, no personalization. MoltCoach: all workouts, on-chain verification, personalized coaching. |
| **Whoop Coach** | AI coaching | Proprietary hardware required ($30/mo). Centralized data. MoltCoach: works with any device or none, user-owned data. |
| **FitGPT / AI fitness chatbots** | AI fitness | Generic prompts, no memory, no incentives. MoltCoach: persistent agent with wallet, reputation, and rewards. |
| **TrueCoach / Trainerize** | Coach platforms | 30-40% platform fees, no data ownership. MoltCoach: 95% retention via better economics, coach owns relationship. |
| **STEPN GO** | Social fitness | Gamification without real coaching. MoltCoach: genuine AI coaching + game theory incentives. |

**MoltCoach's unique position**: The only platform combining personalized AI coaching (with persistent memory and personality) + on-chain agent identity + move-to-earn rewards + user data ownership. Accessible to anyone with a phone.

---

## 9. Open Questions

- [ ] $FIT token legal review — utility token classification?
- [ ] Workout oracle architecture — TEE vs zkML vs stake-secured re-execution?
- [ ] Agent-to-agent communication protocol — A2A or custom?
- [ ] Image-based validation — what confidence threshold for reward eligibility?
- [ ] Will Anthropic expose health connectors to the Agent SDK? Monitor roadmap.
- [ ] Wearable hardware partnerships — who to approach for Stage 4?
- [ ] x402 micropayments — specific use cases for premium agent services?

---

## 10. Success Metrics

| Metric | Minimum Viable (6 months) | Stretch Target (6 months) |
|--------|--------------------------|--------------------------|
| Spawned coaches | 500 | 5,000 |
| Monthly active users | 200 | 2,000 |
| Verified workouts | 5,000 | 50,000 |
| $FIT distributed | 100K tokens | 1M tokens |
| User retention (30-day) | 30% | 40% |
| Coach reputation score (avg) | 70/100 | 75/100 |
| Avg workouts per active user per week | 2 | 4 |
| Image upload usage (% of validations) | 20% | 40% |

---

*Document created: February 2026*
*Last updated: February 7, 2026 — v1.1*
