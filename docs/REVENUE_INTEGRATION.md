# REVENUE_INTEGRATION.md — Contract Patches for Revenue Streams

> **Purpose**: Exact code changes for Claude Code to apply to existing contract specs
> **Applies to**: CONTRACTS.md contracts + 2 new contracts
> **Priority**: P0 fees only (Stage 1 MVP)

---

## Patch 1: Protocol Fee Collector (New Contract)

Add to `contracts/src/fees/ProtocolFeeCollector.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ProtocolFeeCollector
/// @notice Central fee collection and distribution for MoltCoach protocol
/// @dev All protocol fees route through this contract before treasury distribution
contract ProtocolFeeCollector is Ownable, ReentrancyGuard {

    // --- Errors ---
    error InvalidFee();
    error InvalidAllocation();
    error ZeroAddress();
    error TransferFailed();

    // --- Events ---
    event FeeCollected(address indexed source, address indexed token, uint256 amount, string feeType);
    event TreasuryDistributed(uint256 development, uint256 buyback, uint256 community, uint256 insurance);
    event AllocationUpdated(uint256 development, uint256 buyback, uint256 community, uint256 insurance);
    event FeeUpdated(string feeType, uint256 oldFee, uint256 newFee);

    // --- State ---
    IERC20 public immutable fitToken;
    IERC20 public immutable usdcToken;

    // Treasury allocation (basis points, must sum to 10000)
    uint256 public developmentBps = 4000; // 40%
    uint256 public buybackBps = 3000;     // 30%
    uint256 public communityBps = 2000;   // 20%
    uint256 public insuranceBps = 1000;   // 10%

    // Treasury wallets
    address public developmentWallet;
    address public buybackWallet;
    address public communityWallet;
    address public insuranceWallet;

    // Fee rates (basis points)
    uint256 public transactionFeeBps = 50;    // 0.5%
    uint256 public spawnFeeUsdc = 10e6;       // 10 USDC (6 decimals)
    uint256 public spawnFeeFit = 50e18;       // 50 $FIT (18 decimals)
    uint256 public validationFeeTier1 = 1e16; // 0.01 $FIT
    uint256 public validationFeeTier2 = 5e16; // 0.05 $FIT
    uint256 public evolutionFee = 5e18;       // 5 $FIT
    uint256 public modeSwitchFee = 2e18;      // 2 $FIT
    uint256 public resetFee = 15e18;          // 15 $FIT

    // Tracking
    mapping(string => uint256) public totalCollected;

    constructor(
        address _fitToken,
        address _usdcToken,
        address _owner,
        address _developmentWallet,
        address _buybackWallet,
        address _communityWallet,
        address _insuranceWallet
    ) Ownable(_owner) {
        if (_fitToken == address(0) || _usdcToken == address(0)) revert ZeroAddress();
        fitToken = IERC20(_fitToken);
        usdcToken = IERC20(_usdcToken);
        developmentWallet = _developmentWallet;
        buybackWallet = _buybackWallet;
        communityWallet = _communityWallet;
        insuranceWallet = _insuranceWallet;
    }

    /// @notice Collect a fee in $FIT
    /// @param from Address paying the fee
    /// @param amount Amount of $FIT
    /// @param feeType Description for tracking (e.g., "spawn", "validation", "evolution")
    function collectFitFee(
        address from,
        uint256 amount,
        string calldata feeType
    ) external nonReentrant {
        if (amount == 0) revert InvalidFee();
        bool success = fitToken.transferFrom(from, address(this), amount);
        if (!success) revert TransferFailed();
        totalCollected[feeType] += amount;
        emit FeeCollected(from, address(fitToken), amount, feeType);
    }

    /// @notice Collect a fee in USDC
    /// @param from Address paying the fee
    /// @param amount Amount of USDC (6 decimals)
    /// @param feeType Description for tracking
    function collectUsdcFee(
        address from,
        uint256 amount,
        string calldata feeType
    ) external nonReentrant {
        if (amount == 0) revert InvalidFee();
        bool success = usdcToken.transferFrom(from, address(this), amount);
        if (!success) revert TransferFailed();
        totalCollected[feeType] += amount;
        emit FeeCollected(from, address(usdcToken), amount, feeType);
    }

    /// @notice Calculate transaction fee
    /// @param amount Transaction amount
    /// @return fee The protocol fee
    function calculateTransactionFee(uint256 amount) external view returns (uint256 fee) {
        return (amount * transactionFeeBps) / 10000;
    }

    /// @notice Get validation fee for a given tier
    /// @param tier Validation tier (1 = wearable, 2 = image, 3 = manual)
    /// @return fee The validation fee in $FIT
    function getValidationFee(uint8 tier) external view returns (uint256 fee) {
        if (tier == 1) return validationFeeTier1;
        if (tier == 2) return validationFeeTier2;
        return 0; // Tier 3 (manual) is free
    }

    /// @notice Distribute accumulated fees to treasury wallets
    /// @param token Which token to distribute (FIT or USDC)
    function distribute(address token) external nonReentrant onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) revert InvalidFee();

        uint256 devAmount = (balance * developmentBps) / 10000;
        uint256 buybackAmount = (balance * buybackBps) / 10000;
        uint256 communityAmount = (balance * communityBps) / 10000;
        uint256 insuranceAmount = balance - devAmount - buybackAmount - communityAmount;

        IERC20(token).transfer(developmentWallet, devAmount);
        IERC20(token).transfer(buybackWallet, buybackAmount);
        IERC20(token).transfer(communityWallet, communityAmount);
        IERC20(token).transfer(insuranceWallet, insuranceAmount);

        emit TreasuryDistributed(devAmount, buybackAmount, communityAmount, insuranceAmount);
    }

    /// @notice Update treasury allocation (owner only, must sum to 10000)
    function updateAllocation(
        uint256 _devBps,
        uint256 _buybackBps,
        uint256 _communityBps,
        uint256 _insuranceBps
    ) external onlyOwner {
        if (_devBps + _buybackBps + _communityBps + _insuranceBps != 10000) {
            revert InvalidAllocation();
        }
        developmentBps = _devBps;
        buybackBps = _buybackBps;
        communityBps = _communityBps;
        insuranceBps = _insuranceBps;
        emit AllocationUpdated(_devBps, _buybackBps, _communityBps, _insuranceBps);
    }

    /// @notice Update individual fee rates (owner only)
    function updateSpawnFeeUsdc(uint256 newFee) external onlyOwner {
        emit FeeUpdated("spawnUsdc", spawnFeeUsdc, newFee);
        spawnFeeUsdc = newFee;
    }

    function updateSpawnFeeFit(uint256 newFee) external onlyOwner {
        emit FeeUpdated("spawnFit", spawnFeeFit, newFee);
        spawnFeeFit = newFee;
    }

    function updateTransactionFeeBps(uint256 newBps) external onlyOwner {
        if (newBps > 500) revert InvalidFee(); // Cap at 5%
        emit FeeUpdated("transactionBps", transactionFeeBps, newBps);
        transactionFeeBps = newBps;
    }

    function updateValidationFees(uint256 tier1, uint256 tier2) external onlyOwner {
        validationFeeTier1 = tier1;
        validationFeeTier2 = tier2;
    }

    function updateEvolutionFee(uint256 newFee) external onlyOwner {
        emit FeeUpdated("evolution", evolutionFee, newFee);
        evolutionFee = newFee;
    }
}
```

---

## Patch 2: MoltCoachRegistry — Add Spawn Fee

Add fee collection to the existing `spawnAgent` function:

```solidity
// Add to MoltCoachRegistry.sol

IProtocolFeeCollector public feeCollector;

/// @notice Spawn a new coach agent (with fee)
/// @param personality The agent personality config hash
/// @param mode Initial coaching mode (0=Coach, 1=Friend, 2=Mentor)
function spawnAgent(
    bytes32 personality,
    uint8 mode
) external returns (uint256 agentId) {
    // Collect spawn fee
    uint256 fee = feeCollector.spawnFeeFit();
    feeCollector.collectFitFee(msg.sender, fee, "spawn");

    // Existing spawn logic...
    agentId = _mint(msg.sender);
    agents[agentId] = AgentConfig({
        personality: personality,
        mode: mode,
        level: 1,
        state: AgentState.Bonding,
        spawnedAt: block.timestamp
    });

    emit AgentSpawned(agentId, msg.sender, personality, mode);
}

/// @notice Evolve agent to next level (with fee)
function evolveAgent(uint256 agentId) external onlyAgentOwner(agentId) {
    uint256 fee = feeCollector.evolutionFee();
    feeCollector.collectFitFee(msg.sender, fee, "evolution");

    agents[agentId].level++;
    emit AgentEvolved(agentId, agents[agentId].level);
}

/// @notice Switch coaching mode (with fee)
function switchMode(uint256 agentId, uint8 newMode) external onlyAgentOwner(agentId) {
    uint256 fee = feeCollector.modeSwitchFee();
    feeCollector.collectFitFee(msg.sender, fee, "modeSwitch");

    agents[agentId].mode = newMode;
    emit ModeSwitched(agentId, newMode);
}
```

---

## Patch 3: WorkoutValidator — Add Validation Fee

Add fee collection to the existing `validateWorkout` function:

```solidity
// Add to WorkoutValidator.sol

IProtocolFeeCollector public feeCollector;

/// @notice Validate a workout submission (with tier-based fee)
/// @param agentId The coach agent ID
/// @param proof Encoded proof data
/// @param tier Validation tier (1=Wearable, 2=Image, 3=Manual)
function validateWorkout(
    uint256 agentId,
    bytes calldata proof,
    uint8 tier
) external returns (bool valid) {
    // Collect validation fee (Tier 3 / manual is free)
    uint256 fee = feeCollector.getValidationFee(tier);
    if (fee > 0) {
        feeCollector.collectFitFee(msg.sender, fee, "validation");
    }

    // Existing validation logic...
}
```

---

## Patch 4: StakingVault — Add Early Unstake Penalty

```solidity
// Add to StakingVault.sol

uint256 public constant MIN_STAKE_DURATION = 30 days;
uint256 public earlyUnstakePenaltyBps = 500; // 5%
IProtocolFeeCollector public feeCollector;

/// @notice Unstake $FIT (penalty if before minimum duration)
function unstake(uint256 amount) external nonReentrant {
    StakeInfo storage info = stakes[msg.sender];
    require(info.amount >= amount, "Insufficient stake");

    uint256 payout = amount;

    // Early unstake penalty
    if (block.timestamp < info.stakedAt + MIN_STAKE_DURATION) {
        uint256 penalty = (amount * earlyUnstakePenaltyBps) / 10000;
        payout = amount - penalty;
        // Penalty goes to treasury, NOT burned
        feeCollector.collectFitFee(address(this), penalty, "earlyUnstake");
    }

    info.amount -= amount;
    fitToken.transfer(msg.sender, payout);

    emit Unstaked(msg.sender, amount, payout);
}
```

---

## Patch 5: RewardDistributor — Add Claim Fee

```solidity
// Add to RewardDistributor.sol

IProtocolFeeCollector public feeCollector;
uint256 public claimFeeBps = 25; // 0.25%

/// @notice Claim earned $FIT rewards (with micro-fee)
function claimReward(uint256 agentId) external nonReentrant {
    uint256 reward = pendingRewards[agentId];
    require(reward > 0, "No rewards");

    uint256 fee = (reward * claimFeeBps) / 10000;
    uint256 payout = reward - fee;

    pendingRewards[agentId] = 0;

    if (fee > 0) {
        fitToken.transfer(address(feeCollector), fee);
    }
    fitToken.transfer(msg.sender, payout);

    emit RewardClaimed(agentId, msg.sender, payout, fee);
}
```

---

## New Contract: Subscription Manager (Stage 2)

> **Not for MVP** — document now, implement in Stage 2.

```solidity
// contracts/src/subscription/SubscriptionManager.sol
// Subscription NFT with expiry for Pro/Coach tiers
// ERC-721 where tokenId = subscription, metadata = tier + expiry
// Auto-renewal via x402 protocol or manual USDC payment
```

---

## Deployment Order (Updated)

```
1. FITToken                    ← TASK-001 (no changes)
2. ProtocolFeeCollector  [NEW] ← Add as TASK-001B
3. MoltCoachRegistry           ← TASK-002 (+ fee integration)
4. WorkoutValidator            ← TASK-003 (+ fee integration)
5. RewardDistributor           ← TASK-004 (+ fee integration)
6. StakingVault                ← TASK-005 (+ fee integration)
```

---

## Test Cases for Claude Code

```bash
# Fee collection
forge test --match-test testSpawnFeeCollected
forge test --match-test testValidationFeeTier1
forge test --match-test testValidationFeeTier2Free  # Tier 3 = no fee
forge test --match-test testEarlyUnstakePenalty
forge test --match-test testClaimFeeDeducted
forge test --match-test testTreasuryDistribution
forge test --match-test testFeeAllocationSumsTo10000

# Edge cases
forge test --match-test testZeroFeeReverts
forge test --match-test testMaxTransactionFeeCap
forge test --match-test testOnlyOwnerCanUpdateFees
forge test --match-test testDistributeEmptyBalance
```

---

*Generated: February 8, 2026*
*For Claude Code integration with MoltCoach contracts*
