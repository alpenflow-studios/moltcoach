// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ProtocolFeeCollector
/// @notice Central fee collection and distribution for the MoltCoach protocol
/// @dev All protocol fees route through this contract before treasury distribution.
///      Supports $FIT and USDC. Uses SafeERC20 for safe token transfers.
///      Treasury allocation: 40% dev / 30% buyback / 20% community / 10% insurance (adjustable).
contract ProtocolFeeCollector is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    // Constants
    // ──────────────────────────────────────────────

    /// @notice Maximum transaction fee: 5% (500 bps)
    uint256 public constant MAX_TRANSACTION_FEE_BPS = 500;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // ──────────────────────────────────────────────
    // Immutables
    // ──────────────────────────────────────────────

    /// @notice $FIT token address
    IERC20 public immutable fitToken;

    /// @notice USDC token address
    IERC20 public immutable usdcToken;

    // ──────────────────────────────────────────────
    // Treasury Allocation (basis points, must sum to 10000)
    // ──────────────────────────────────────────────

    uint256 public developmentBps = 4000; // 40%
    uint256 public buybackBps = 3000;     // 30%
    uint256 public communityBps = 2000;   // 20%
    uint256 public insuranceBps = 1000;   // 10%

    // ──────────────────────────────────────────────
    // Treasury Wallets
    // ──────────────────────────────────────────────

    address public developmentWallet;
    address public buybackWallet;
    address public communityWallet;
    address public insuranceWallet;

    // ──────────────────────────────────────────────
    // Fee Rates
    // ──────────────────────────────────────────────

    /// @notice Transaction fee in basis points (default 0.5%)
    uint256 public transactionFeeBps = 50;

    /// @notice Agent spawn fee in USDC (6 decimals)
    uint256 public spawnFeeUsdc = 10e6;

    /// @notice Agent spawn fee in $FIT (18 decimals)
    uint256 public spawnFeeFit = 50e18;

    /// @notice Workout validation fee — Tier 1 (wearable API)
    uint256 public validationFeeTier1 = 1e16; // 0.01 $FIT

    /// @notice Workout validation fee — Tier 2 (image upload)
    uint256 public validationFeeTier2 = 5e16; // 0.05 $FIT

    /// @notice Agent evolution fee
    uint256 public evolutionFee = 5e18;

    /// @notice Coaching mode switch fee
    uint256 public modeSwitchFee = 2e18;

    /// @notice Agent hard-reset fee
    uint256 public resetFee = 15e18;

    // ──────────────────────────────────────────────
    // Tracking
    // ──────────────────────────────────────────────

    /// @notice Total collected per fee type (e.g., "spawn", "validation", "evolution")
    mapping(string => uint256) public totalCollected;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    /// @notice Emitted when a fee is collected
    event FeeCollected(address indexed source, address indexed token, uint256 amount, string feeType);

    /// @notice Emitted when accumulated fees are distributed to treasury wallets
    event TreasuryDistributed(address indexed token, uint256 development, uint256 buyback, uint256 community, uint256 insurance);

    /// @notice Emitted when treasury allocation percentages change
    event AllocationUpdated(uint256 development, uint256 buyback, uint256 community, uint256 insurance);

    /// @notice Emitted when a fee rate is updated
    event FeeUpdated(string feeType, uint256 oldFee, uint256 newFee);

    /// @notice Emitted when a treasury wallet address is updated
    event TreasuryWalletUpdated(string walletType, address oldWallet, address newWallet);

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    /// @notice Fee amount is zero or invalid
    error InvalidFee();

    /// @notice Allocation bps do not sum to 10000
    error InvalidAllocation();

    /// @notice Zero address provided where non-zero is required
    error ZeroAddress();

    /// @notice No balance to distribute
    error NothingToDistribute();

    /// @notice Transaction fee exceeds 5% cap
    error ExceedsMaxTransactionFee(uint256 requested, uint256 max);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    /// @param _fitToken $FIT token contract address
    /// @param _usdcToken USDC token contract address
    /// @param _owner Contract owner (admin)
    /// @param _developmentWallet Treasury: development fund
    /// @param _buybackWallet Treasury: buyback & burn fund
    /// @param _communityWallet Treasury: community rewards fund
    /// @param _insuranceWallet Treasury: insurance fund
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
        if (
            _developmentWallet == address(0) || _buybackWallet == address(0)
                || _communityWallet == address(0) || _insuranceWallet == address(0)
        ) revert ZeroAddress();

        fitToken = IERC20(_fitToken);
        usdcToken = IERC20(_usdcToken);
        developmentWallet = _developmentWallet;
        buybackWallet = _buybackWallet;
        communityWallet = _communityWallet;
        insuranceWallet = _insuranceWallet;
    }

    // ──────────────────────────────────────────────
    // Fee Collection
    // ──────────────────────────────────────────────

    /// @notice Collect a fee in $FIT
    /// @param from Address paying the fee (must have approved this contract)
    /// @param amount Amount of $FIT to collect
    /// @param feeType Description for tracking (e.g., "spawn", "validation", "evolution")
    function collectFitFee(address from, uint256 amount, string calldata feeType) external nonReentrant {
        if (amount == 0) revert InvalidFee();
        fitToken.safeTransferFrom(from, address(this), amount);
        totalCollected[feeType] += amount;
        emit FeeCollected(from, address(fitToken), amount, feeType);
    }

    /// @notice Collect a fee in USDC
    /// @param from Address paying the fee (must have approved this contract)
    /// @param amount Amount of USDC to collect (6 decimals)
    /// @param feeType Description for tracking
    function collectUsdcFee(address from, uint256 amount, string calldata feeType) external nonReentrant {
        if (amount == 0) revert InvalidFee();
        usdcToken.safeTransferFrom(from, address(this), amount);
        totalCollected[feeType] += amount;
        emit FeeCollected(from, address(usdcToken), amount, feeType);
    }

    // ──────────────────────────────────────────────
    // Fee Calculation (Views)
    // ──────────────────────────────────────────────

    /// @notice Calculate transaction fee for a given amount
    /// @param amount Transaction amount
    /// @return fee The protocol fee
    function calculateTransactionFee(uint256 amount) external view returns (uint256 fee) {
        return (amount * transactionFeeBps) / BPS_DENOMINATOR;
    }

    /// @notice Get validation fee for a given tier
    /// @param tier Validation tier (1 = wearable, 2 = image, 3+ = manual/free)
    /// @return fee The validation fee in $FIT
    function getValidationFee(uint8 tier) external view returns (uint256 fee) {
        if (tier == 1) return validationFeeTier1;
        if (tier == 2) return validationFeeTier2;
        return 0; // Tier 3+ (manual) is free
    }

    // ──────────────────────────────────────────────
    // Treasury Distribution (Owner Only)
    // ──────────────────────────────────────────────

    /// @notice Distribute accumulated fees to treasury wallets
    /// @param token Token to distribute (FIT or USDC address)
    function distribute(address token) external nonReentrant onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) revert NothingToDistribute();

        uint256 devAmount = (balance * developmentBps) / BPS_DENOMINATOR;
        uint256 buybackAmount = (balance * buybackBps) / BPS_DENOMINATOR;
        uint256 communityAmount = (balance * communityBps) / BPS_DENOMINATOR;
        uint256 insuranceAmount = balance - devAmount - buybackAmount - communityAmount;

        IERC20(token).safeTransfer(developmentWallet, devAmount);
        IERC20(token).safeTransfer(buybackWallet, buybackAmount);
        IERC20(token).safeTransfer(communityWallet, communityAmount);
        IERC20(token).safeTransfer(insuranceWallet, insuranceAmount);

        emit TreasuryDistributed(token, devAmount, buybackAmount, communityAmount, insuranceAmount);
    }

    // ──────────────────────────────────────────────
    // Allocation Management (Owner Only)
    // ──────────────────────────────────────────────

    /// @notice Update treasury allocation percentages
    /// @dev All four values must sum to exactly 10000 bps
    function updateAllocation(
        uint256 _devBps,
        uint256 _buybackBps,
        uint256 _communityBps,
        uint256 _insuranceBps
    ) external onlyOwner {
        if (_devBps + _buybackBps + _communityBps + _insuranceBps != BPS_DENOMINATOR) {
            revert InvalidAllocation();
        }
        developmentBps = _devBps;
        buybackBps = _buybackBps;
        communityBps = _communityBps;
        insuranceBps = _insuranceBps;
        emit AllocationUpdated(_devBps, _buybackBps, _communityBps, _insuranceBps);
    }

    // ──────────────────────────────────────────────
    // Fee Rate Updates (Owner Only)
    // ──────────────────────────────────────────────

    /// @notice Update transaction fee (capped at 5%)
    /// @param newBps New fee in basis points
    function updateTransactionFeeBps(uint256 newBps) external onlyOwner {
        if (newBps > MAX_TRANSACTION_FEE_BPS) {
            revert ExceedsMaxTransactionFee(newBps, MAX_TRANSACTION_FEE_BPS);
        }
        emit FeeUpdated("transactionBps", transactionFeeBps, newBps);
        transactionFeeBps = newBps;
    }

    /// @notice Update spawn fee in USDC
    function updateSpawnFeeUsdc(uint256 newFee) external onlyOwner {
        emit FeeUpdated("spawnUsdc", spawnFeeUsdc, newFee);
        spawnFeeUsdc = newFee;
    }

    /// @notice Update spawn fee in $FIT
    function updateSpawnFeeFit(uint256 newFee) external onlyOwner {
        emit FeeUpdated("spawnFit", spawnFeeFit, newFee);
        spawnFeeFit = newFee;
    }

    /// @notice Update validation fees for tier 1 and tier 2
    /// @param tier1 New Tier 1 fee (wearable API)
    /// @param tier2 New Tier 2 fee (image upload)
    function updateValidationFees(uint256 tier1, uint256 tier2) external onlyOwner {
        emit FeeUpdated("validationTier1", validationFeeTier1, tier1);
        emit FeeUpdated("validationTier2", validationFeeTier2, tier2);
        validationFeeTier1 = tier1;
        validationFeeTier2 = tier2;
    }

    /// @notice Update agent evolution fee
    function updateEvolutionFee(uint256 newFee) external onlyOwner {
        emit FeeUpdated("evolution", evolutionFee, newFee);
        evolutionFee = newFee;
    }

    /// @notice Update coaching mode switch fee
    function updateModeSwitchFee(uint256 newFee) external onlyOwner {
        emit FeeUpdated("modeSwitch", modeSwitchFee, newFee);
        modeSwitchFee = newFee;
    }

    /// @notice Update agent hard-reset fee
    function updateResetFee(uint256 newFee) external onlyOwner {
        emit FeeUpdated("reset", resetFee, newFee);
        resetFee = newFee;
    }

    // ──────────────────────────────────────────────
    // Treasury Wallet Updates (Owner Only)
    // ──────────────────────────────────────────────

    /// @notice Update development treasury wallet
    function updateDevelopmentWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert ZeroAddress();
        emit TreasuryWalletUpdated("development", developmentWallet, newWallet);
        developmentWallet = newWallet;
    }

    /// @notice Update buyback treasury wallet
    function updateBuybackWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert ZeroAddress();
        emit TreasuryWalletUpdated("buyback", buybackWallet, newWallet);
        buybackWallet = newWallet;
    }

    /// @notice Update community treasury wallet
    function updateCommunityWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert ZeroAddress();
        emit TreasuryWalletUpdated("community", communityWallet, newWallet);
        communityWallet = newWallet;
    }

    /// @notice Update insurance treasury wallet
    function updateInsuranceWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert ZeroAddress();
        emit TreasuryWalletUpdated("insurance", insuranceWallet, newWallet);
        insuranceWallet = newWallet;
    }
}
