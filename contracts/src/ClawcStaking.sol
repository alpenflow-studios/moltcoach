// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Minimal interface for ProtocolFeeCollector fee routing
interface IFeeCollector {
    function collectClawcFee(address from, uint256 amount, string calldata feeType) external;
}

/// @title ClawcStaking
/// @notice Stake $CLAWC to unlock premium coaching tiers
/// @dev Utility-only staking — no yield/rewards. Staking gates feature access.
///      Early unstake (< 30 days) incurs 5% penalty routed to ProtocolFeeCollector.
///      Tiers: Free(0), Basic(100 CLAWC), Pro(1K CLAWC), Elite(10K CLAWC).
contract ClawcStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    // Constants
    // ──────────────────────────────────────────────

    /// @notice Minimum time before unstaking without penalty
    uint256 public constant MIN_STAKE_DURATION = 30 days;

    /// @notice Early unstake penalty: 5%
    uint256 public constant EARLY_UNSTAKE_PENALTY_BPS = 500;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // ──────────────────────────────────────────────
    // Immutables
    // ──────────────────────────────────────────────

    /// @notice $CLAWC token contract
    IERC20 public immutable clawcToken;

    /// @notice Protocol fee collector for penalty routing
    IFeeCollector public immutable feeCollector;

    // ──────────────────────────────────────────────
    // Types
    // ──────────────────────────────────────────────

    /// @notice Premium coaching tiers
    enum Tier {
        Free,   // 0 CLAWC
        Basic,  // 100 CLAWC
        Pro,    // 1,000 CLAWC
        Elite   // 10,000 CLAWC
    }

    /// @notice Per-user staking state
    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
    }

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    /// @notice Staking info per user
    mapping(address => StakeInfo) public stakes;

    /// @notice Total $CLAWC staked across all users
    uint256 public totalStaked;

    /// @notice Tier threshold: Basic (default 100 CLAWC)
    uint256 public basicThreshold = 100e18;

    /// @notice Tier threshold: Pro (default 1,000 CLAWC)
    uint256 public proThreshold = 1_000e18;

    /// @notice Tier threshold: Elite (default 10,000 CLAWC)
    uint256 public eliteThreshold = 10_000e18;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    /// @notice Emitted when a user stakes $CLAWC
    event Staked(address indexed user, uint256 amount, uint256 totalUserStake);

    /// @notice Emitted when a user unstakes $CLAWC
    event Unstaked(address indexed user, uint256 requested, uint256 penalty, uint256 payout);

    /// @notice Emitted when a user's tier changes due to staking/unstaking
    event TierChanged(address indexed user, Tier oldTier, Tier newTier);

    /// @notice Emitted when the owner updates tier thresholds
    event ThresholdsUpdated(uint256 basic, uint256 pro, uint256 elite);

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    /// @notice Amount must be greater than zero
    error ZeroAmount();

    /// @notice User does not have enough staked tokens
    error InsufficientStake(uint256 requested, uint256 available);

    /// @notice Address must not be zero
    error ZeroAddress();

    /// @notice Tier thresholds must be strictly increasing and non-zero
    error InvalidThresholds();

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    /// @param _clawcToken $CLAWC token contract address
    /// @param _feeCollector ProtocolFeeCollector contract address
    /// @param _owner Contract owner (admin)
    constructor(address _clawcToken, address _feeCollector, address _owner) Ownable(_owner) {
        if (_clawcToken == address(0) || _feeCollector == address(0)) revert ZeroAddress();
        clawcToken = IERC20(_clawcToken);
        feeCollector = IFeeCollector(_feeCollector);
    }

    // ──────────────────────────────────────────────
    // Staking
    // ──────────────────────────────────────────────

    /// @notice Stake $CLAWC tokens to unlock premium features
    /// @param amount Amount of $CLAWC to stake (18 decimals)
    /// @dev Caller must have approved this contract. stakedAt is set on first stake only.
    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        StakeInfo storage info = stakes[msg.sender];
        Tier oldTier = _getTier(info.amount);

        // Set stakedAt only on first stake (not reset on top-up)
        if (info.amount == 0) {
            info.stakedAt = block.timestamp;
        }

        info.amount += amount;
        totalStaked += amount;

        clawcToken.safeTransferFrom(msg.sender, address(this), amount);

        Tier newTier = _getTier(info.amount);
        if (newTier != oldTier) {
            emit TierChanged(msg.sender, oldTier, newTier);
        }

        emit Staked(msg.sender, amount, info.amount);
    }

    /// @notice Unstake $CLAWC tokens
    /// @param amount Amount of $CLAWC to unstake
    /// @dev Early unstake (< 30 days) incurs 5% penalty routed to ProtocolFeeCollector.
    ///      Partial unstaking is supported.
    function unstake(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();

        StakeInfo storage info = stakes[msg.sender];
        if (info.amount < amount) revert InsufficientStake(amount, info.amount);

        Tier oldTier = _getTier(info.amount);
        uint256 payout = amount;
        uint256 penalty = 0;

        // Early unstake penalty
        if (block.timestamp < info.stakedAt + MIN_STAKE_DURATION) {
            penalty = (amount * EARLY_UNSTAKE_PENALTY_BPS) / BPS_DENOMINATOR;
            payout = amount - penalty;
        }

        info.amount -= amount;
        totalStaked -= amount;

        // Reset stakedAt if fully unstaked
        if (info.amount == 0) {
            info.stakedAt = 0;
        }

        // Route penalty to FeeCollector
        if (penalty > 0) {
            clawcToken.forceApprove(address(feeCollector), penalty);
            feeCollector.collectClawcFee(address(this), penalty, "earlyUnstake");
        }

        // Pay out remainder to user
        clawcToken.safeTransfer(msg.sender, payout);

        Tier newTier = _getTier(info.amount);
        if (newTier != oldTier) {
            emit TierChanged(msg.sender, oldTier, newTier);
        }

        emit Unstaked(msg.sender, amount, penalty, payout);
    }

    // ──────────────────────────────────────────────
    // View Functions
    // ──────────────────────────────────────────────

    /// @notice Get staking info for a user
    /// @param user User address
    /// @return amount Staked balance
    /// @return stakedAt Timestamp of initial stake
    function getStake(address user) external view returns (uint256 amount, uint256 stakedAt) {
        StakeInfo storage info = stakes[user];
        return (info.amount, info.stakedAt);
    }

    /// @notice Get the current tier for a user
    /// @param user User address
    /// @return Current tier based on staked balance
    function getTier(address user) external view returns (Tier) {
        return _getTier(stakes[user].amount);
    }

    /// @notice Check if a user would incur early unstake penalty
    /// @param user User address
    /// @return True if user is within the 30-day early unstake window
    function isEarlyUnstake(address user) external view returns (bool) {
        StakeInfo storage info = stakes[user];
        if (info.amount == 0) return false;
        return block.timestamp < info.stakedAt + MIN_STAKE_DURATION;
    }

    /// @notice Calculate early unstake penalty for a given amount
    /// @param amount Amount to calculate penalty for
    /// @return penalty 5% of the amount
    function earlyUnstakePenalty(uint256 amount) external pure returns (uint256) {
        return (amount * EARLY_UNSTAKE_PENALTY_BPS) / BPS_DENOMINATOR;
    }

    // ──────────────────────────────────────────────
    // Admin Functions (Owner Only)
    // ──────────────────────────────────────────────

    /// @notice Update tier thresholds
    /// @param _basic New Basic tier threshold
    /// @param _pro New Pro tier threshold
    /// @param _elite New Elite tier threshold
    /// @dev Thresholds must be strictly increasing: 0 < basic < pro < elite
    function updateThresholds(uint256 _basic, uint256 _pro, uint256 _elite) external onlyOwner {
        if (_basic == 0 || _pro <= _basic || _elite <= _pro) revert InvalidThresholds();
        basicThreshold = _basic;
        proThreshold = _pro;
        eliteThreshold = _elite;
        emit ThresholdsUpdated(_basic, _pro, _elite);
    }

    // ──────────────────────────────────────────────
    // Internal
    // ──────────────────────────────────────────────

    /// @dev Compute tier from staked amount
    function _getTier(uint256 amount) internal view returns (Tier) {
        if (amount >= eliteThreshold) return Tier.Elite;
        if (amount >= proThreshold) return Tier.Pro;
        if (amount >= basicThreshold) return Tier.Basic;
        return Tier.Free;
    }
}
