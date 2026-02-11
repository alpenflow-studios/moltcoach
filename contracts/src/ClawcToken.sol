// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClawcToken ($CLAWC)
/// @notice Native ERC-20 token for the ClawCoach protocol
/// @dev Earned via validated workouts, never bought. Features:
///      - 1B max supply (immutable)
///      - 100K/day emission cap (adjustable by owner within bounds)
///      - Owner-only minting (for RewardDistributor)
///      - ERC20Burnable (anyone can burn their own tokens)
///      - ERC20Permit (gasless approvals via EIP-2612)
contract ClawcToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    // ──────────────────────────────────────────────
    // Constants
    // ──────────────────────────────────────────────

    /// @notice Maximum total supply: 1 billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000e18;

    /// @notice Minimum allowed daily emission cap (10K tokens)
    uint256 public constant MIN_DAILY_CAP = 10_000e18;

    /// @notice Maximum allowed daily emission cap (500K tokens)
    uint256 public constant MAX_DAILY_CAP = 500_000e18;

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    /// @notice Current daily emission cap (adjustable by owner)
    uint256 public dailyEmissionCap;

    /// @notice Start of the current tracking day (UTC midnight)
    uint256 public currentDayStart;

    /// @notice Amount minted so far in the current day
    uint256 public mintedToday;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    /// @notice Emitted when the daily emission cap is updated
    /// @param oldCap Previous cap value
    /// @param newCap New cap value
    event DailyEmissionCapUpdated(uint256 oldCap, uint256 newCap);

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    /// @notice Minting would exceed the 1B max supply
    error ExceedsMaxSupply(uint256 requested, uint256 available);

    /// @notice Minting would exceed today's emission cap
    error ExceedsDailyEmissionCap(uint256 requested, uint256 remaining);

    /// @notice Daily cap value is outside the allowed range
    error InvalidDailyCap(uint256 cap);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    /// @param owner Address that will own the contract (can mint and adjust cap)
    constructor(address owner)
        ERC20("ClawCoach", "CLAWC")
        ERC20Permit("ClawCoach")
        Ownable(owner)
    {
        dailyEmissionCap = 100_000e18;
        currentDayStart = _dayStart(block.timestamp);
    }

    // ──────────────────────────────────────────────
    // Minting (Owner Only)
    // ──────────────────────────────────────────────

    /// @notice Mint $CLAWC tokens (for reward distribution)
    /// @param to Recipient address
    /// @param amount Amount to mint (18 decimals)
    /// @dev Enforces both max supply and daily emission cap
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_SUPPLY - totalSupply());
        }

        _resetDayIfNeeded();

        if (mintedToday + amount > dailyEmissionCap) {
            revert ExceedsDailyEmissionCap(amount, dailyEmissionCap - mintedToday);
        }

        mintedToday += amount;
        _mint(to, amount);
    }

    // ──────────────────────────────────────────────
    // Admin Functions
    // ──────────────────────────────────────────────

    /// @notice Update the daily emission cap
    /// @param newCap New cap value (must be between MIN_DAILY_CAP and MAX_DAILY_CAP)
    function updateDailyEmissionCap(uint256 newCap) external onlyOwner {
        if (newCap < MIN_DAILY_CAP || newCap > MAX_DAILY_CAP) {
            revert InvalidDailyCap(newCap);
        }
        uint256 oldCap = dailyEmissionCap;
        dailyEmissionCap = newCap;
        emit DailyEmissionCapUpdated(oldCap, newCap);
    }

    // ──────────────────────────────────────────────
    // View Functions
    // ──────────────────────────────────────────────

    /// @notice How many tokens can still be minted today
    /// @return remaining Tokens remaining in today's emission window
    function remainingDailyMint() external view returns (uint256 remaining) {
        if (_dayStart(block.timestamp) > currentDayStart) {
            return dailyEmissionCap;
        }
        return dailyEmissionCap - mintedToday;
    }

    /// @notice How many tokens can ever be minted
    /// @return remaining Tokens remaining until max supply
    function remainingSupply() external view returns (uint256 remaining) {
        return MAX_SUPPLY - totalSupply();
    }

    // ──────────────────────────────────────────────
    // Internal
    // ──────────────────────────────────────────────

    /// @dev Reset daily counter if a new UTC day has started
    function _resetDayIfNeeded() internal {
        uint256 today = _dayStart(block.timestamp);
        if (today > currentDayStart) {
            currentDayStart = today;
            mintedToday = 0;
        }
    }

    /// @dev Compute start of UTC day for a given timestamp
    function _dayStart(uint256 timestamp) internal pure returns (uint256) {
        return (timestamp / 1 days) * 1 days;
    }
}
