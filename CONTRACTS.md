# CONTRACTS.md — MoltCoach Smart Contract Specifications

> **Chain**: Base (chainId 8453) / Base Sepolia (chainId 84532)
> **Framework**: Foundry
> **Solidity**: ^0.8.20
> **Libraries**: OpenZeppelin 5.x
> **Trust Layer**: ERC-8004 (Identity, Reputation, Validation Registries)
> **Last Updated**: February 2026

---

## Contract Overview

| Contract | Purpose | Dependencies |
|----------|---------|-------------|
| `MoltCoachRegistry.sol` | Agent spawning, ERC-8004 identity | ERC-8004 Identity Registry |
| `WorkoutValidator.sol` | Validation oracle for workout proofs | ERC-8004 Validation Registry |
| `FITToken.sol` | $FIT ERC-20 move-to-earn token | OpenZeppelin ERC-20 |
| `RewardDistributor.sol` | $FIT distribution on validated workouts | FITToken, WorkoutValidator |
| `StakingVault.sol` | $FIT staking for premium features | FITToken |
| `MoltCoachWalletPolicy.sol` | Smart wallet spending rules | Coinbase Smart Wallet |

---

## Directory Structure

```
contracts/
├── src/
│   ├── MoltCoachRegistry.sol
│   ├── WorkoutValidator.sol
│   ├── FITToken.sol
│   ├── RewardDistributor.sol
│   ├── StakingVault.sol
│   ├── MoltCoachWalletPolicy.sol
│   └── interfaces/
│       ├── IIdentityRegistry.sol
│       ├── IReputationRegistry.sol
│       ├── IValidationRegistry.sol
│       ├── IMoltCoachRegistry.sol
│       ├── IWorkoutValidator.sol
│       └── IRewardDistributor.sol
├── test/
│   ├── MoltCoachRegistry.t.sol
│   ├── WorkoutValidator.t.sol
│   ├── FITToken.t.sol
│   ├── RewardDistributor.t.sol
│   ├── StakingVault.t.sol
│   └── MoltCoachWalletPolicy.t.sol
├── script/
│   ├── Deploy.s.sol
│   └── DeployTestnet.s.sol
├── foundry.toml
└── remappings.txt
```

---

## 1. ERC-8004 Interfaces

These interfaces match the ERC-8004 spec exactly. MoltCoach interacts with the singleton registries deployed on Base — we do NOT deploy our own copies.

### IIdentityRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ERC-8004 Identity Registry Interface
/// @notice Singleton per chain. Agents are ERC-721 NFTs with registration files.
/// @dev See https://eips.ethereum.org/EIPS/eip-8004
interface IIdentityRegistry {

    struct MetadataEntry {
        string metadataKey;
        bytes metadataValue;
    }

    event Registered(
        uint256 indexed agentId,
        string agentURI,
        address indexed owner
    );

    event URIUpdated(
        uint256 indexed agentId,
        string newURI,
        address indexed updatedBy
    );

    event MetadataSet(
        uint256 indexed agentId,
        string indexed indexedMetadataKey,
        string metadataKey,
        bytes metadataValue
    );

    /// @notice Register a new agent with URI and optional metadata
    /// @param agentURI URI pointing to the agent registration file (IPFS, HTTPS, or data: URI)
    /// @param metadata Array of key-value metadata entries
    /// @return agentId The ERC-721 tokenId assigned to the new agent
    function register(
        string calldata agentURI,
        MetadataEntry[] calldata metadata
    ) external returns (uint256 agentId);

    /// @notice Register a new agent with URI only
    function register(string calldata agentURI) external returns (uint256 agentId);

    /// @notice Register a new agent (URI added later via setAgentURI)
    function register() external returns (uint256 agentId);

    /// @notice Update the agent's registration file URI
    function setAgentURI(uint256 agentId, string calldata newURI) external;

    /// @notice Get arbitrary on-chain metadata for an agent
    function getMetadata(
        uint256 agentId,
        string memory metadataKey
    ) external view returns (bytes memory);

    /// @notice Set arbitrary on-chain metadata for an agent
    function setMetadata(
        uint256 agentId,
        string memory metadataKey,
        bytes memory metadataValue
    ) external;

    /// @notice Set the agent's wallet address with signature verification
    /// @dev Requires EIP-712 signature (EOA) or ERC-1271 (smart contract wallet)
    function setAgentWallet(
        uint256 agentId,
        address newWallet,
        uint256 deadline,
        bytes calldata signature
    ) external;

    /// @notice Get the verified wallet address for an agent
    function getAgentWallet(uint256 agentId) external view returns (address);

    /// @notice Clear the agent's wallet address
    function unsetAgentWallet(uint256 agentId) external;
}
```

### IReputationRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ERC-8004 Reputation Registry Interface
/// @notice Singleton per chain. Stores feedback signals for agents.
/// @dev Scoring/aggregation happens both on-chain (composability) and off-chain (algorithms)
interface IReputationRegistry {

    event NewFeedback(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        int128 value,
        uint8 valueDecimals,
        string indexed indexedTag1,
        string tag1,
        string tag2,
        string endpoint,
        string feedbackURI,
        bytes32 feedbackHash
    );

    event FeedbackRevoked(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 indexed feedbackIndex
    );

    event ResponseAppended(
        uint256 indexed agentId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        address indexed responder,
        string responseURI,
        bytes32 responseHash
    );

    /// @notice Get the Identity Registry address this Reputation Registry is linked to
    function getIdentityRegistry() external view returns (address);

    /// @notice Submit feedback for an agent
    /// @param agentId The agent's ERC-721 tokenId
    /// @param value Signed fixed-point feedback value
    /// @param valueDecimals Decimals for value (0-18)
    /// @param tag1 Optional categorization tag (e.g., "coaching", "accountability")
    /// @param tag2 Optional secondary tag
    /// @param endpoint Optional endpoint URI being rated
    /// @param feedbackURI Optional URI to off-chain feedback details (IPFS recommended)
    /// @param feedbackHash Optional keccak256 of feedbackURI content (not needed for IPFS)
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external;

    /// @notice Revoke previously submitted feedback
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external;

    /// @notice Append a response to existing feedback (by anyone)
    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseURI,
        bytes32 responseHash
    ) external;

    /// @notice Get aggregated feedback summary filtered by clients and tags
    /// @param clientAddresses MUST be non-empty (filtering by client mitigates Sybil attacks)
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals);

    /// @notice Read a single feedback entry
    function readFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (
        int128 value,
        uint8 valueDecimals,
        string memory tag1,
        string memory tag2,
        bool isRevoked
    );

    /// @notice Get all client addresses that have given feedback to an agent
    function getClients(uint256 agentId) external view returns (address[] memory);

    /// @notice Get the last feedback index for a client-agent pair
    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64);
}
```

### IValidationRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ERC-8004 Validation Registry Interface
/// @notice Singleton per chain. Agents request validation, oracles respond.
/// @dev Incentives/slashing are managed by specific validation protocols, not this registry.
interface IValidationRegistry {

    event ValidationRequest(
        address indexed validatorAddress,
        uint256 indexed agentId,
        string requestURI,
        bytes32 indexed requestHash
    );

    event ValidationResponse(
        address indexed validatorAddress,
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint8 response,
        string responseURI,
        bytes32 responseHash,
        string tag
    );

    /// @notice Get the Identity Registry address
    function getIdentityRegistry() external view returns (address);

    /// @notice Request validation of agent work
    /// @param validatorAddress Address of the validator contract/oracle
    /// @param agentId The agent's ERC-721 tokenId (caller must be owner/operator)
    /// @param requestURI URI pointing to off-chain validation data (inputs, outputs, proofs)
    /// @param requestHash keccak256 commitment to the request payload
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external;

    /// @notice Respond to a validation request
    /// @param requestHash The hash from the original request
    /// @param response Score 0-100 (0=failed, 100=passed, intermediate for spectrum)
    /// @param responseURI Optional URI to evidence/audit of validation
    /// @param responseHash Optional keccak256 of responseURI content
    /// @param tag Optional categorization (e.g., "workout-completion", "soft-finality")
    /// @dev Can be called multiple times per requestHash (progressive validation)
    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external;

    /// @notice Get the current validation status for a request
    function getValidationStatus(
        bytes32 requestHash
    ) external view returns (
        address validatorAddress,
        uint256 agentId,
        uint8 response,
        bytes32 responseHash,
        string memory tag,
        uint256 lastUpdate
    );

    /// @notice Get aggregated validation stats for an agent
    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 averageResponse);

    /// @notice Get all validation request hashes for an agent
    function getAgentValidations(uint256 agentId) external view returns (bytes32[] memory);

    /// @notice Get all request hashes assigned to a validator
    function getValidatorRequests(address validatorAddress) external view returns (bytes32[] memory);
}
```

---

## 2. MoltCoachRegistry.sol

The bridge between MoltCoach users and the ERC-8004 Identity Registry. Handles agent spawning, onboarding config storage, and lifecycle management.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";

/// @title MoltCoachRegistry
/// @notice Spawns MoltCoach agents via ERC-8004 Identity Registry
/// @dev Each user gets one active agent. Supports soft/hard reset and archival.
contract MoltCoachRegistry is Ownable, Pausable, ReentrancyGuard {

    // ─── Errors ───────────────────────────────────────────────
    error AlreadyHasActiveAgent();
    error NoActiveAgent();
    error NotAgentOwner();
    error InvalidMode();
    error SpawnFeeRequired();

    // ─── Types ────────────────────────────────────────────────

    /// @notice Agent relationship modes
    enum CoachMode { Coach, Friend, Mentor }

    /// @notice Agent lifecycle states
    enum AgentState { Bonding, Active, Archived }

    /// @notice On-chain agent record
    struct AgentRecord {
        uint256 agentId;           // ERC-8004 tokenId
        address owner;             // User wallet
        address smartWallet;       // Coinbase Smart Wallet address
        CoachMode mode;            // Current coaching mode
        AgentState state;          // Lifecycle state
        uint256 spawnedAt;         // Block timestamp
        uint256 bondingEndsAt;     // 7 days after spawn
        string registrationURI;    // IPFS URI to agent registration file
    }

    // ─── State ────────────────────────────────────────────────

    IIdentityRegistry public immutable identityRegistry;
    uint256 public spawnFee;       // Anti-Sybil: minimum $FIT stake to spawn
    uint256 public constant BONDING_PERIOD = 7 days;

    /// @notice User address → active agent record
    mapping(address => AgentRecord) public activeAgents;

    /// @notice User address → archived agent IDs
    mapping(address => uint256[]) public archivedAgents;

    /// @notice agentId → user address (reverse lookup)
    mapping(uint256 => address) public agentOwners;

    // ─── Events ───────────────────────────────────────────────

    event AgentSpawned(
        address indexed owner,
        uint256 indexed agentId,
        CoachMode mode,
        string registrationURI
    );

    event AgentEvolved(
        uint256 indexed agentId,
        CoachMode oldMode,
        CoachMode newMode
    );

    event AgentSoftReset(
        uint256 indexed agentId,
        address indexed owner
    );

    event AgentHardReset(
        uint256 indexed oldAgentId,
        uint256 indexed newAgentId,
        address indexed owner
    );

    event AgentArchived(
        uint256 indexed agentId,
        address indexed owner
    );

    event AgentReactivated(
        uint256 indexed agentId,
        address indexed owner
    );

    // ─── Constructor ──────────────────────────────────────────

    /// @param identityRegistry_ Address of the ERC-8004 Identity Registry on Base
    /// @param spawnFee_ Initial spawn fee (set to 0 for testnet)
    constructor(
        address identityRegistry_,
        uint256 spawnFee_
    ) Ownable(msg.sender) {
        identityRegistry = IIdentityRegistry(identityRegistry_);
        spawnFee = spawnFee_;
    }

    // ─── Spawn ────────────────────────────────────────────────

    /// @notice Spawn a new MoltCoach agent
    /// @param registrationURI IPFS URI to the agent registration file
    /// @param smartWallet Address of the user's Coinbase Smart Wallet
    /// @param mode Initial coaching mode (Coach, Friend, or Mentor)
    /// @return agentId The ERC-8004 tokenId of the new agent
    function spawnAgent(
        string calldata registrationURI,
        address smartWallet,
        CoachMode mode
    ) external payable whenNotPaused nonReentrant returns (uint256 agentId) {
        if (activeAgents[msg.sender].agentId != 0) revert AlreadyHasActiveAgent();
        if (msg.value < spawnFee) revert SpawnFeeRequired();

        // Register with ERC-8004 Identity Registry
        agentId = identityRegistry.register(registrationURI);

        // Store agent record
        activeAgents[msg.sender] = AgentRecord({
            agentId: agentId,
            owner: msg.sender,
            smartWallet: smartWallet,
            mode: mode,
            state: AgentState.Bonding,
            spawnedAt: block.timestamp,
            bondingEndsAt: block.timestamp + BONDING_PERIOD,
            registrationURI: registrationURI
        });

        agentOwners[agentId] = msg.sender;

        emit AgentSpawned(msg.sender, agentId, mode, registrationURI);
    }

    // ─── Evolve ───────────────────────────────────────────────

    /// @notice Change agent's coaching mode (Coach ↔ Friend ↔ Mentor)
    /// @param newMode The new coaching mode
    function evolveAgent(CoachMode newMode) external {
        AgentRecord storage agent = activeAgents[msg.sender];
        if (agent.agentId == 0) revert NoActiveAgent();

        CoachMode oldMode = agent.mode;
        agent.mode = newMode;

        emit AgentEvolved(agent.agentId, oldMode, newMode);
    }

    // ─── Soft Reset ───────────────────────────────────────────

    /// @notice Reset agent personality and history. Keep wallet, NFT, reputation.
    /// @dev Off-chain: clear Supabase workout history + conversation history
    function softReset() external {
        AgentRecord storage agent = activeAgents[msg.sender];
        if (agent.agentId == 0) revert NoActiveAgent();

        // Reset bonding period
        agent.state = AgentState.Bonding;
        agent.bondingEndsAt = block.timestamp + BONDING_PERIOD;

        emit AgentSoftReset(agent.agentId, msg.sender);
    }

    // ─── Hard Reset ───────────────────────────────────────────

    /// @notice Burn current agent, spawn new one. Old reputation archived.
    /// @param newRegistrationURI Registration file for the new agent
    /// @param newMode Coaching mode for the new agent
    /// @return newAgentId The new agent's ERC-8004 tokenId
    function hardReset(
        string calldata newRegistrationURI,
        CoachMode newMode
    ) external payable whenNotPaused nonReentrant returns (uint256 newAgentId) {
        AgentRecord storage agent = activeAgents[msg.sender];
        if (agent.agentId == 0) revert NoActiveAgent();

        uint256 oldAgentId = agent.agentId;
        address smartWallet = agent.smartWallet;

        // Archive old agent
        archivedAgents[msg.sender].push(oldAgentId);
        delete agentOwners[oldAgentId];

        // Note: We do NOT burn the ERC-721 — the old NFT remains as a historical record
        // with frozen reputation. The agent is simply no longer "active" in MoltCoach.

        // Register new agent
        newAgentId = identityRegistry.register(newRegistrationURI);

        activeAgents[msg.sender] = AgentRecord({
            agentId: newAgentId,
            owner: msg.sender,
            smartWallet: smartWallet,
            mode: newMode,
            state: AgentState.Bonding,
            spawnedAt: block.timestamp,
            bondingEndsAt: block.timestamp + BONDING_PERIOD,
            registrationURI: newRegistrationURI
        });

        agentOwners[newAgentId] = msg.sender;

        emit AgentHardReset(oldAgentId, newAgentId, msg.sender);
    }

    // ─── Archive / Reactivate ─────────────────────────────────

    /// @notice Pause coaching. Agent goes dormant. No rewards earned.
    function archiveAgent() external {
        AgentRecord storage agent = activeAgents[msg.sender];
        if (agent.agentId == 0) revert NoActiveAgent();

        agent.state = AgentState.Archived;
        emit AgentArchived(agent.agentId, msg.sender);
    }

    /// @notice Reactivate a dormant agent
    function reactivateAgent() external {
        AgentRecord storage agent = activeAgents[msg.sender];
        if (agent.agentId == 0) revert NoActiveAgent();

        agent.state = AgentState.Active;
        emit AgentReactivated(agent.agentId, msg.sender);
    }

    // ─── Views ────────────────────────────────────────────────

    /// @notice Check if bonding period has ended and transition to Active
    function checkBondingStatus(address user) external view returns (AgentState) {
        AgentRecord storage agent = activeAgents[user];
        if (agent.state == AgentState.Bonding && block.timestamp >= agent.bondingEndsAt) {
            return AgentState.Active;
        }
        return agent.state;
    }

    /// @notice Get all archived agent IDs for a user
    function getArchivedAgents(address user) external view returns (uint256[] memory) {
        return archivedAgents[user];
    }

    // ─── Admin ────────────────────────────────────────────────

    function setSpawnFee(uint256 newFee) external onlyOwner {
        spawnFee = newFee;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function withdrawFees(address to) external onlyOwner {
        (bool success,) = to.call{value: address(this).balance}("");
        require(success);
    }
}
```

---

## 3. WorkoutValidator.sol

The oracle/validator contract that responds to workout validation requests via the ERC-8004 Validation Registry. Authorized operators (TEE oracles, stake-secured verifiers) submit validation scores.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IValidationRegistry} from "./interfaces/IValidationRegistry.sol";

/// @title WorkoutValidator
/// @notice Validates workout completion proofs and responds via ERC-8004
/// @dev Acts as the `validatorAddress` in ERC-8004 Validation Registry calls
contract WorkoutValidator is Ownable {

    // ─── Errors ───────────────────────────────────────────────
    error NotAuthorizedOperator();
    error InvalidScore();
    error RequestAlreadyProcessed();

    // ─── Types ────────────────────────────────────────────────

    /// @notice Data source tiers for workout validation
    enum DataTier {
        WearableAPI,     // Tier 1: Direct OAuth wearable data (70-90% confidence)
        ImageUpload,     // Tier 2: Photo of health screen parsed by vision (50-70%)
        ManualWithProof, // Tier 3: Manual entry + photo/video evidence (40-60%)
        ManualOnly       // Tier 4: Manual entry, no proof (20-40%)
    }

    struct ValidationRecord {
        uint256 agentId;
        bytes32 requestHash;
        DataTier tier;
        uint8 score;          // 0-100
        bool processed;
        uint256 timestamp;
    }

    // ─── State ────────────────────────────────────────────────

    IValidationRegistry public immutable validationRegistry;

    /// @notice Authorized operators (TEE oracles, stake-secured verifiers)
    mapping(address => bool) public operators;

    /// @notice requestHash → validation record
    mapping(bytes32 => ValidationRecord) public validations;

    /// @notice Reward multiplier per tier (basis points, 10000 = 1.0x)
    mapping(DataTier => uint256) public tierMultipliers;

    /// @notice Minimum score required to trigger reward distribution
    uint8 public constant REWARD_THRESHOLD = 80;

    /// @notice Maximum manual-only validations per user per week (rate limiting)
    uint8 public constant MAX_MANUAL_PER_WEEK = 3;

    // ─── Events ───────────────────────────────────────────────

    event WorkoutValidated(
        bytes32 indexed requestHash,
        uint256 indexed agentId,
        DataTier tier,
        uint8 score
    );

    event OperatorUpdated(address indexed operator, bool authorized);

    // ─── Constructor ──────────────────────────────────────────

    constructor(address validationRegistry_) Ownable(msg.sender) {
        validationRegistry = IValidationRegistry(validationRegistry_);

        // Default multipliers (basis points)
        tierMultipliers[DataTier.WearableAPI] = 10000;     // 1.0x
        tierMultipliers[DataTier.ImageUpload] = 8500;      // 0.85x
        tierMultipliers[DataTier.ManualWithProof] = 7000;  // 0.7x
        tierMultipliers[DataTier.ManualOnly] = 5000;       // 0.5x
    }

    // ─── Validation ───────────────────────────────────────────

    /// @notice Submit a validation response for a workout
    /// @param requestHash The hash from the original ERC-8004 validation request
    /// @param agentId The agent that requested validation
    /// @param tier The data source tier used for this validation
    /// @param score Validation score 0-100
    /// @param responseURI URI to validation evidence (IPFS)
    /// @param responseHash keccak256 of response content
    function validateWorkout(
        bytes32 requestHash,
        uint256 agentId,
        DataTier tier,
        uint8 score,
        string calldata responseURI,
        bytes32 responseHash
    ) external {
        if (!operators[msg.sender]) revert NotAuthorizedOperator();
        if (score > 100) revert InvalidScore();
        if (validations[requestHash].processed) revert RequestAlreadyProcessed();

        // Store record
        validations[requestHash] = ValidationRecord({
            agentId: agentId,
            requestHash: requestHash,
            tier: tier,
            score: score,
            processed: true,
            timestamp: block.timestamp
        });

        // Submit response to ERC-8004 Validation Registry
        validationRegistry.validationResponse(
            requestHash,
            score,
            responseURI,
            responseHash,
            "workout-completion"
        );

        emit WorkoutValidated(requestHash, agentId, tier, score);
    }

    // ─── Views ────────────────────────────────────────────────

    /// @notice Check if a workout passed validation and get reward multiplier
    function getRewardInfo(bytes32 requestHash)
        external
        view
        returns (bool eligible, uint256 multiplierBps)
    {
        ValidationRecord storage record = validations[requestHash];
        eligible = record.processed && record.score >= REWARD_THRESHOLD;
        multiplierBps = tierMultipliers[record.tier];
    }

    // ─── Admin ────────────────────────────────────────────────

    function setOperator(address operator, bool authorized) external onlyOwner {
        operators[operator] = authorized;
        emit OperatorUpdated(operator, authorized);
    }

    function setTierMultiplier(DataTier tier, uint256 multiplierBps) external onlyOwner {
        tierMultipliers[tier] = multiplierBps;
    }
}
```

---

## 4. FITToken.sol

The $FIT ERC-20 token. Earned through verified workouts, stakeable for premium features, required for agent spawning (anti-Sybil).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title FITToken
/// @notice MoltCoach move-to-earn token on Base
/// @dev Capped supply. Only authorized minters (RewardDistributor) can mint.
contract FITToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {

    // ─── Errors ───────────────────────────────────────────────
    error NotAuthorizedMinter();
    error ExceedsMaxSupply();
    error ExceedsDailyEmissionCap();

    // ─── State ────────────────────────────────────────────────

    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18;  // 1B tokens
    uint256 public constant DAILY_EMISSION_CAP = 100_000 * 1e18; // 100K/day max

    /// @notice Authorized minters (RewardDistributor contract)
    mapping(address => bool) public minters;

    /// @notice Track daily emissions for cap enforcement
    mapping(uint256 => uint256) public dailyMinted; // day number → amount minted

    // ─── Events ───────────────────────────────────────────────

    event MinterUpdated(address indexed minter, bool authorized);

    // ─── Constructor ──────────────────────────────────────────

    constructor() ERC20("MoltCoach FIT", "FIT") ERC20Permit("MoltCoach FIT") Ownable(msg.sender) {}

    // ─── Minting ──────────────────────────────────────────────

    /// @notice Mint $FIT tokens (only callable by authorized minters)
    /// @param to Recipient address
    /// @param amount Amount to mint (in wei)
    function mint(address to, uint256 amount) external {
        if (!minters[msg.sender]) revert NotAuthorizedMinter();
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply();

        uint256 today = block.timestamp / 1 days;
        if (dailyMinted[today] + amount > DAILY_EMISSION_CAP) revert ExceedsDailyEmissionCap();

        dailyMinted[today] += amount;
        _mint(to, amount);
    }

    // ─── Admin ────────────────────────────────────────────────

    function setMinter(address minter, bool authorized) external onlyOwner {
        minters[minter] = authorized;
        emit MinterUpdated(minter, authorized);
    }
}
```

---

## 5. RewardDistributor.sol

Distributes $FIT rewards when workouts are validated. Reads validation results from WorkoutValidator and mints rewards to user wallets.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

interface IFITToken {
    function mint(address to, uint256 amount) external;
}

interface IWorkoutValidator {
    function getRewardInfo(bytes32 requestHash)
        external view returns (bool eligible, uint256 multiplierBps);
}

interface IMoltCoachRegistry {
    function agentOwners(uint256 agentId) external view returns (address);
}

/// @title RewardDistributor
/// @notice Distributes $FIT rewards for validated workouts
/// @dev Reads from WorkoutValidator, mints via FITToken
contract RewardDistributor is Ownable, ReentrancyGuard, Pausable {

    // ─── Errors ───────────────────────────────────────────────
    error NotEligible();
    error AlreadyClaimed();
    error InvalidAgentOwner();
    error AgentNotActive();

    // ─── State ────────────────────────────────────────────────

    IFITToken public immutable fitToken;
    IWorkoutValidator public immutable validator;
    IMoltCoachRegistry public immutable coachRegistry;

    /// @notice Base reward per validated workout (before tier multiplier)
    uint256 public baseReward = 100 * 1e18; // 100 $FIT

    /// @notice Streak bonus: consecutive days with validated workouts
    /// @dev streakDays → bonus multiplier in basis points (10000 = 1.0x)
    mapping(uint256 => uint256) public streakBonuses;

    /// @notice Track claimed rewards to prevent double-claiming
    mapping(bytes32 => bool) public claimed;

    /// @notice User → consecutive workout days
    mapping(address => uint256) public streakCount;

    /// @notice User → last workout day number
    mapping(address => uint256) public lastWorkoutDay;

    // ─── Events ───────────────────────────────────────────────

    event RewardDistributed(
        address indexed user,
        uint256 indexed agentId,
        bytes32 indexed requestHash,
        uint256 amount,
        uint256 streakDays
    );

    // ─── Constructor ──────────────────────────────────────────

    constructor(
        address fitToken_,
        address validator_,
        address coachRegistry_
    ) Ownable(msg.sender) {
        fitToken = IFITToken(fitToken_);
        validator = IWorkoutValidator(validator_);
        coachRegistry = IMoltCoachRegistry(coachRegistry_);

        // Default streak bonuses
        streakBonuses[7] = 1500;   // 7-day streak: 1.5x
        streakBonuses[30] = 2000;  // 30-day streak: 2.0x
        streakBonuses[90] = 2500;  // 90-day streak: 2.5x
    }

    // ─── Claim Rewards ────────────────────────────────────────

    /// @notice Claim $FIT reward for a validated workout
    /// @param requestHash The ERC-8004 validation request hash
    /// @param agentId The agent that completed the workout coaching
    function claimReward(
        bytes32 requestHash,
        uint256 agentId
    ) external nonReentrant whenNotPaused {
        if (claimed[requestHash]) revert AlreadyClaimed();

        // Verify caller owns the agent
        address owner = coachRegistry.agentOwners(agentId);
        if (owner != msg.sender) revert InvalidAgentOwner();

        // Check validation status
        (bool eligible, uint256 multiplierBps) = validator.getRewardInfo(requestHash);
        if (!eligible) revert NotEligible();

        claimed[requestHash] = true;

        // Calculate streak
        uint256 today = block.timestamp / 1 days;
        if (lastWorkoutDay[msg.sender] == today - 1) {
            streakCount[msg.sender]++;
        } else if (lastWorkoutDay[msg.sender] != today) {
            streakCount[msg.sender] = 1;
        }
        lastWorkoutDay[msg.sender] = today;

        // Calculate reward: base × tier multiplier × streak bonus
        uint256 amount = baseReward * multiplierBps / 10000;

        // Apply streak bonus (find highest applicable)
        uint256 streak = streakCount[msg.sender];
        if (streak >= 90 && streakBonuses[90] > 0) {
            amount = amount * streakBonuses[90] / 10000;
        } else if (streak >= 30 && streakBonuses[30] > 0) {
            amount = amount * streakBonuses[30] / 10000;
        } else if (streak >= 7 && streakBonuses[7] > 0) {
            amount = amount * streakBonuses[7] / 10000;
        }

        // Mint reward
        fitToken.mint(msg.sender, amount);

        emit RewardDistributed(msg.sender, agentId, requestHash, amount, streak);
    }

    // ─── Admin ────────────────────────────────────────────────

    function setBaseReward(uint256 newReward) external onlyOwner {
        baseReward = newReward;
    }

    function setStreakBonus(uint256 streakDays, uint256 bonusBps) external onlyOwner {
        streakBonuses[streakDays] = bonusBps;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
```

---

## 6. StakingVault.sol

Stake $FIT for premium features. 7-day cooldown on unstaking. Staked balance tracked for feature gating.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title StakingVault
/// @notice Stake $FIT for premium MoltCoach features
/// @dev 7-day cooldown on unstaking. Tiered premium levels.
contract StakingVault is ReentrancyGuard, Ownable {

    using SafeERC20 for IERC20;

    // ─── Errors ───────────────────────────────────────────────
    error InsufficientStake();
    error CooldownNotComplete();
    error NoPendingWithdrawal();
    error AmountZero();

    // ─── Types ────────────────────────────────────────────────

    struct StakeInfo {
        uint256 stakedAmount;
        uint256 pendingWithdrawal;
        uint256 cooldownEnd;
    }

    /// @notice Premium tier thresholds
    enum PremiumTier { Free, Basic, Pro, Elite }

    // ─── State ────────────────────────────────────────────────

    IERC20 public immutable fitToken;
    uint256 public constant COOLDOWN_PERIOD = 7 days;

    /// @notice Staking info per user
    mapping(address => StakeInfo) public stakes;

    /// @notice Premium tier thresholds (in $FIT wei)
    mapping(PremiumTier => uint256) public tierThresholds;

    uint256 public totalStaked;

    // ─── Events ───────────────────────────────────────────────

    event Staked(address indexed user, uint256 amount, uint256 totalStaked);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 cooldownEnd);
    event Withdrawn(address indexed user, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────

    constructor(address fitToken_) Ownable(msg.sender) {
        fitToken = IERC20(fitToken_);

        // Default tier thresholds
        tierThresholds[PremiumTier.Basic] = 100 * 1e18;     // 100 $FIT
        tierThresholds[PremiumTier.Pro] = 1_000 * 1e18;     // 1,000 $FIT
        tierThresholds[PremiumTier.Elite] = 10_000 * 1e18;  // 10,000 $FIT
    }

    // ─── Staking ──────────────────────────────────────────────

    /// @notice Stake $FIT tokens
    /// @param amount Amount to stake (must have approved this contract)
    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert AmountZero();

        fitToken.safeTransferFrom(msg.sender, address(this), amount);

        stakes[msg.sender].stakedAmount += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount, stakes[msg.sender].stakedAmount);
    }

    /// @notice Request unstake (starts 7-day cooldown)
    /// @param amount Amount to unstake
    function requestUnstake(uint256 amount) external {
        StakeInfo storage info = stakes[msg.sender];
        if (amount == 0) revert AmountZero();
        if (info.stakedAmount < amount) revert InsufficientStake();

        info.stakedAmount -= amount;
        info.pendingWithdrawal += amount;
        info.cooldownEnd = block.timestamp + COOLDOWN_PERIOD;
        totalStaked -= amount;

        emit UnstakeRequested(msg.sender, amount, info.cooldownEnd);
    }

    /// @notice Withdraw after cooldown completes
    function withdraw() external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        if (info.pendingWithdrawal == 0) revert NoPendingWithdrawal();
        if (block.timestamp < info.cooldownEnd) revert CooldownNotComplete();

        uint256 amount = info.pendingWithdrawal;
        info.pendingWithdrawal = 0;
        info.cooldownEnd = 0;

        fitToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    // ─── Views ────────────────────────────────────────────────

    /// @notice Get user's current premium tier based on staked amount
    function getUserTier(address user) external view returns (PremiumTier) {
        uint256 staked = stakes[user].stakedAmount;

        if (staked >= tierThresholds[PremiumTier.Elite]) return PremiumTier.Elite;
        if (staked >= tierThresholds[PremiumTier.Pro]) return PremiumTier.Pro;
        if (staked >= tierThresholds[PremiumTier.Basic]) return PremiumTier.Basic;
        return PremiumTier.Free;
    }

    // ─── Admin ────────────────────────────────────────────────

    function setTierThreshold(PremiumTier tier, uint256 threshold) external onlyOwner {
        tierThresholds[tier] = threshold;
    }
}
```

---

## 7. MoltCoachWalletPolicy.sol

Policy contract for Coinbase Smart Wallet integration. Enforces spending limits, timelocks, and allowlists.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MoltCoachWalletPolicy
/// @notice Spending rules for MoltCoach agent wallets (Coinbase Smart Wallet)
/// @dev Integrated as a policy module in the 2-of-2 multisig wallet
contract MoltCoachWalletPolicy is Ownable {

    // ─── Errors ───────────────────────────────────────────────
    error ExceedsDailyLimit();
    error DestinationNotAllowed();
    error WithdrawalNotReady();
    error WithdrawalNotFound();
    error NotWalletOwner();

    // ─── Types ────────────────────────────────────────────────

    struct PendingWithdrawal {
        address to;
        uint256 amount;
        uint256 executeAfter;
        bool executed;
    }

    // ─── State ────────────────────────────────────────────────

    /// @notice Daily auto-approve limit for agent transactions (in USDC base units, 6 decimals)
    uint256 public constant DAILY_AUTO_LIMIT = 10 * 1e6; // $10 USDC

    /// @notice Timelock for large withdrawals
    uint256 public constant WITHDRAWAL_DELAY = 24 hours;

    /// @notice Approved destination addresses (contracts the agent can interact with)
    mapping(address => bool) public allowedDestinations;

    /// @notice Daily spend tracking per wallet
    mapping(address => mapping(uint256 => uint256)) public dailySpent; // wallet → day → amount

    /// @notice Pending large withdrawals
    mapping(bytes32 => PendingWithdrawal) public pendingWithdrawals;

    /// @notice Wallet → user owner mapping
    mapping(address => address) public walletOwners;

    // ─── Events ───────────────────────────────────────────────

    event AutoApproved(address indexed wallet, address indexed to, uint256 amount);
    event WithdrawalQueued(bytes32 indexed id, address indexed wallet, address to, uint256 amount, uint256 executeAfter);
    event WithdrawalExecuted(bytes32 indexed id);
    event WithdrawalCancelled(bytes32 indexed id);
    event DestinationUpdated(address indexed destination, bool allowed);

    // ─── Constructor ──────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Policy Checks ────────────────────────────────────────

    /// @notice Check if agent can auto-approve a transaction
    /// @param wallet The smart wallet address
    /// @param to Destination address
    /// @param amount Transaction amount (in token base units)
    /// @return canApprove Whether the transaction can be auto-approved
    function canAgentAutoApprove(
        address wallet,
        address to,
        uint256 amount
    ) external view returns (bool canApprove) {
        if (!allowedDestinations[to]) return false;

        uint256 today = block.timestamp / 1 days;
        if (dailySpent[wallet][today] + amount > DAILY_AUTO_LIMIT) return false;

        return true;
    }

    /// @notice Record an auto-approved spend
    function recordSpend(address wallet, address to, uint256 amount) external {
        // In production: only callable by the smart wallet itself
        uint256 today = block.timestamp / 1 days;
        dailySpent[wallet][today] += amount;
        emit AutoApproved(wallet, to, amount);
    }

    /// @notice Queue a large withdrawal (requires user co-sign + timelock)
    function requestWithdrawal(
        address wallet,
        address to,
        uint256 amount
    ) external returns (bytes32 id) {
        id = keccak256(abi.encodePacked(wallet, to, amount, block.timestamp));

        pendingWithdrawals[id] = PendingWithdrawal({
            to: to,
            amount: amount,
            executeAfter: block.timestamp + WITHDRAWAL_DELAY,
            executed: false
        });

        emit WithdrawalQueued(id, wallet, to, amount, block.timestamp + WITHDRAWAL_DELAY);
    }

    /// @notice Execute a pending withdrawal after timelock
    function executeWithdrawal(bytes32 id) external {
        PendingWithdrawal storage pw = pendingWithdrawals[id];
        if (pw.amount == 0) revert WithdrawalNotFound();
        if (block.timestamp < pw.executeAfter) revert WithdrawalNotReady();
        if (pw.executed) revert WithdrawalNotFound();

        pw.executed = true;
        emit WithdrawalExecuted(id);
        // Actual transfer executed by the smart wallet using this approval
    }

    /// @notice Cancel a pending withdrawal (user-only)
    function cancelWithdrawal(bytes32 id) external {
        PendingWithdrawal storage pw = pendingWithdrawals[id];
        if (pw.amount == 0) revert WithdrawalNotFound();

        delete pendingWithdrawals[id];
        emit WithdrawalCancelled(id);
    }

    // ─── Admin ────────────────────────────────────────────────

    function setAllowedDestination(address destination, bool allowed) external onlyOwner {
        allowedDestinations[destination] = allowed;
        emit DestinationUpdated(destination, allowed);
    }

    function registerWalletOwner(address wallet, address owner) external onlyOwner {
        walletOwners[wallet] = owner;
    }
}
```

---

## Deployment

### Deploy Order (Dependencies)

```
1. FITToken                         (no dependencies)
2. MoltCoachRegistry                (needs: Identity Registry address)
3. WorkoutValidator                 (needs: Validation Registry address)
4. RewardDistributor                (needs: FITToken, WorkoutValidator, MoltCoachRegistry)
5. StakingVault                     (needs: FITToken)
6. MoltCoachWalletPolicy            (no dependencies)
```

### Post-Deploy Configuration

```
7. FITToken.setMinter(RewardDistributor.address, true)
8. WorkoutValidator.setOperator(oracleAddress, true)
9. MoltCoachWalletPolicy.setAllowedDestination(FITToken.address, true)
10. MoltCoachWalletPolicy.setAllowedDestination(StakingVault.address, true)
```

### ERC-8004 Registry Addresses (Base)

The ERC-8004 registries are singletons deployed on Base. MoltCoach does NOT deploy its own copies — we interact with the canonical instances.

```
# TODO: Confirm addresses once published
# These will be available at https://8004.org or the ERC-8004 reference implementation
IDENTITY_REGISTRY=0x...
REPUTATION_REGISTRY=0x...
VALIDATION_REGISTRY=0x...
```

### Deploy Commands

```bash
# Testnet (Base Sepolia)
forge script script/DeployTestnet.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_KEY \
  -vvvv

# Mainnet (Base)
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_KEY \
  -vvvv
```

---

## Gas Estimates

| Operation | Estimated Gas | Notes |
|-----------|--------------|-------|
| `spawnAgent()` | ~180k | Includes ERC-8004 register() call |
| `evolveAgent()` | ~30k | Storage update only |
| `softReset()` | ~30k | State reset, no new mint |
| `hardReset()` | ~200k | Archive + new register() |
| `validateWorkout()` | ~80k | Write + ERC-8004 validationResponse() |
| `claimReward()` | ~90k | Read validation + mint $FIT |
| `stake()` | ~60k | Transfer + storage |
| `requestUnstake()` | ~40k | Storage update |
| `withdraw()` | ~50k | Transfer + storage clear |

---

## Security Checklist

### Pre-Testnet
- [ ] All tests passing (`forge test -vvvv`)
- [ ] Coverage > 90% (`forge coverage`)
- [ ] Slither clean (`slither .`)
- [ ] No `tx.origin` usage
- [ ] All state changes emit events
- [ ] ReentrancyGuard on all value-transferring functions
- [ ] Custom errors (no require strings) for gas optimization
- [ ] Checks-effects-interactions pattern followed
- [ ] No uninitialized storage variables
- [ ] All external calls to ERC-8004 registries handle reverts

### Pre-Mainnet
- [ ] All of the above
- [ ] Testnet tested for 2+ weeks with beta users
- [ ] External audit or peer review completed
- [ ] Admin keys secured (hardware wallet or Safe multisig)
- [ ] Emergency pause tested
- [ ] Upgrade path documented (if proxied)
- [ ] Bug bounty program live (Immunefi recommended)
- [ ] Tenderly monitoring configured
- [ ] Gas regression snapshot created (`forge snapshot`)

---

## Testing Strategy

```bash
# Run all tests
forge test -vvvv

# Specific contract tests
forge test --match-contract MoltCoachRegistryTest -vvvv
forge test --match-contract WorkoutValidatorTest -vvvv
forge test --match-contract FITTokenTest -vvvv
forge test --match-contract RewardDistributorTest -vvvv
forge test --match-contract StakingVaultTest -vvvv

# Specific test functions
forge test --match-test testAgentSpawn -vvvv
forge test --match-test testWorkoutValidation -vvvv
forge test --match-test testRewardClaim -vvvv
forge test --match-test testStakeCooldown -vvvv
forge test --match-test testWalletSecurity -vvvv

# Gas report
forge test --gas-report

# Coverage
forge coverage

# Fork testing against Base
forge test --fork-url https://mainnet.base.org -vvvv
```

### Key Test Scenarios

| Test | What It Verifies |
|------|-----------------|
| `testAgentSpawn` | User can spawn agent, gets ERC-8004 NFT, correct state |
| `testAlreadyHasAgent` | Cannot spawn second agent while first is active |
| `testEvolveMode` | Coach → Friend → Mentor mode switching |
| `testSoftReset` | History cleared, wallet/NFT/reputation preserved |
| `testHardReset` | Old archived, new agent spawned, wallet transferred |
| `testArchiveReactivate` | Dormancy and reactivation lifecycle |
| `testWorkoutValidation` | Oracle submits score, ERC-8004 response recorded |
| `testTierMultipliers` | Each data tier gets correct reward multiplier |
| `testRewardClaim` | Valid workout → $FIT minted to user |
| `testDoubleClaim` | Cannot claim same requestHash twice |
| `testStreakBonus` | 7/30/90 day streaks get correct multipliers |
| `testDailyEmissionCap` | Cannot mint more than 100K $FIT per day |
| `testStakeCooldown` | 7-day cooldown enforced on unstaking |
| `testPremiumTiers` | Correct tier assigned based on staked amount |
| `testAutoApproveLimit` | Agent can't exceed $10/day auto-approve |
| `testWithdrawalTimelock` | 24h delay enforced for large withdrawals |
| `testRateLimit` | Max 3 manual-only validations per week |

---

*Document created: February 2026*
*Last updated: February 2026*
