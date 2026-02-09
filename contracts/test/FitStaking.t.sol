// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {FitToken} from "../src/FitToken.sol";
import {ProtocolFeeCollector} from "../src/fees/ProtocolFeeCollector.sol";
import {FitStaking} from "../src/FitStaking.sol";

contract FitStakingTest is Test {
    FitToken public fit;
    ProtocolFeeCollector public feeCollector;
    FitStaking public staking;

    address internal owner;
    address internal alice;
    address internal bob;
    address internal carol;

    // Treasury wallets
    address internal devWallet;
    address internal buybackWallet;
    address internal communityWallet;
    address internal insuranceWallet;

    // Re-declare events for expectEmit
    event Staked(address indexed user, uint256 amount, uint256 totalUserStake);
    event Unstaked(address indexed user, uint256 requested, uint256 penalty, uint256 payout);
    event TierChanged(address indexed user, FitStaking.Tier oldTier, FitStaking.Tier newTier);
    event ThresholdsUpdated(uint256 basic, uint256 pro, uint256 elite);
    event FeeCollected(address indexed source, address indexed token, uint256 amount, string feeType);

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        carol = makeAddr("carol");
        devWallet = makeAddr("devWallet");
        buybackWallet = makeAddr("buybackWallet");
        communityWallet = makeAddr("communityWallet");
        insuranceWallet = makeAddr("insuranceWallet");

        // Deploy FitToken
        fit = new FitToken(owner);

        // Deploy ProtocolFeeCollector (needs a USDC mock — use a dummy address)
        address mockUsdc = makeAddr("mockUsdc");
        feeCollector = new ProtocolFeeCollector(
            address(fit),
            mockUsdc,
            owner,
            devWallet,
            buybackWallet,
            communityWallet,
            insuranceWallet
        );

        // Deploy FitStaking
        staking = new FitStaking(address(fit), address(feeCollector), owner);

        // Mint FIT to users for testing (spread across days to respect daily cap)
        vm.startPrank(owner);
        fit.mint(alice, 50_000e18);
        fit.mint(bob, 50_000e18);
        vm.warp(block.timestamp + 1 days);
        fit.mint(carol, 10_000e18);
        vm.stopPrank();

        // Approve staking contract
        vm.prank(alice);
        fit.approve(address(staking), type(uint256).max);

        vm.prank(bob);
        fit.approve(address(staking), type(uint256).max);

        vm.prank(carol);
        fit.approve(address(staking), type(uint256).max);
    }

    // ═══════════════════════════════════════════════
    // DEPLOYMENT TESTS
    // ═══════════════════════════════════════════════

    function test_deployment_owner() public view {
        assertEq(staking.owner(), owner);
    }

    function test_deployment_fitToken() public view {
        assertEq(address(staking.fitToken()), address(fit));
    }

    function test_deployment_feeCollector() public view {
        assertEq(address(staking.feeCollector()), address(feeCollector));
    }

    function test_deployment_defaultThresholds() public view {
        assertEq(staking.basicThreshold(), 100e18);
        assertEq(staking.proThreshold(), 1_000e18);
        assertEq(staking.eliteThreshold(), 10_000e18);
    }

    function test_deployment_totalStakedZero() public view {
        assertEq(staking.totalStaked(), 0);
    }

    function test_deployment_constants() public view {
        assertEq(staking.MIN_STAKE_DURATION(), 30 days);
        assertEq(staking.EARLY_UNSTAKE_PENALTY_BPS(), 500);
        assertEq(staking.BPS_DENOMINATOR(), 10_000);
    }

    function test_deployment_revertZeroFitToken() public {
        vm.expectRevert(FitStaking.ZeroAddress.selector);
        new FitStaking(address(0), address(feeCollector), owner);
    }

    function test_deployment_revertZeroFeeCollector() public {
        vm.expectRevert(FitStaking.ZeroAddress.selector);
        new FitStaking(address(fit), address(0), owner);
    }

    // ═══════════════════════════════════════════════
    // STAKING TESTS
    // ═══════════════════════════════════════════════

    function test_stake_success() public {
        vm.prank(alice);
        staking.stake(100e18);

        (uint256 amount, uint256 stakedAt) = staking.getStake(alice);
        assertEq(amount, 100e18);
        assertEq(stakedAt, block.timestamp);
        assertEq(staking.totalStaked(), 100e18);
    }

    function test_stake_transfersTokens() public {
        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.stake(500e18);

        assertEq(fit.balanceOf(alice), balanceBefore - 500e18);
        assertEq(fit.balanceOf(address(staking)), 500e18);
    }

    function test_stake_multipleStakes_sameUser() public {
        vm.startPrank(alice);
        staking.stake(100e18);
        uint256 firstStakedAt = block.timestamp;

        // Warp 10 days and stake more
        vm.warp(block.timestamp + 10 days);
        staking.stake(200e18);
        vm.stopPrank();

        (uint256 amount, uint256 stakedAt) = staking.getStake(alice);
        assertEq(amount, 300e18);
        // stakedAt should NOT reset on top-up
        assertEq(stakedAt, firstStakedAt);
        assertEq(staking.totalStaked(), 300e18);
    }

    function test_stake_multipleUsers() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        vm.prank(bob);
        staking.stake(5_000e18);

        assertEq(staking.totalStaked(), 6_000e18);

        (uint256 aliceAmount,) = staking.getStake(alice);
        (uint256 bobAmount,) = staking.getStake(bob);
        assertEq(aliceAmount, 1_000e18);
        assertEq(bobAmount, 5_000e18);
    }

    function test_stake_revertZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(FitStaking.ZeroAmount.selector);
        staking.stake(0);
    }

    function test_stake_emitsStakedEvent() public {
        vm.expectEmit(true, false, false, true);
        emit Staked(alice, 100e18, 100e18);

        vm.prank(alice);
        staking.stake(100e18);
    }

    function test_stake_emitsStakedEvent_topUp() public {
        vm.prank(alice);
        staking.stake(100e18);

        vm.expectEmit(true, false, false, true);
        emit Staked(alice, 200e18, 300e18);

        vm.prank(alice);
        staking.stake(200e18);
    }

    function test_stake_revertInsufficientBalance() public {
        // Carol has 10K FIT, try to stake 20K
        vm.prank(carol);
        vm.expectRevert();
        staking.stake(20_000e18);
    }

    // ═══════════════════════════════════════════════
    // TIER TESTS
    // ═══════════════════════════════════════════════

    function test_tier_freeByDefault() public view {
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Free));
    }

    function test_tier_basic() public {
        vm.prank(alice);
        staking.stake(100e18);

        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Basic));
    }

    function test_tier_pro() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Pro));
    }

    function test_tier_elite() public {
        vm.prank(alice);
        staking.stake(10_000e18);

        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Elite));
    }

    function test_tier_exactBoundary_basic() public {
        // Exactly at basic threshold
        vm.prank(alice);
        staking.stake(100e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Basic));
    }

    function test_tier_belowBoundary_basic() public {
        // Just below basic threshold
        vm.prank(alice);
        staking.stake(99e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Free));
    }

    function test_tier_emitsTierChanged_onStake() public {
        vm.expectEmit(true, false, false, true);
        emit TierChanged(alice, FitStaking.Tier.Free, FitStaking.Tier.Basic);

        vm.prank(alice);
        staking.stake(100e18);
    }

    function test_tier_staysBasicOnTopUp() public {
        vm.prank(alice);
        staking.stake(100e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Basic));

        // Staking more within same tier should remain Basic
        vm.prank(alice);
        staking.stake(50e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Basic));
    }

    function test_tier_progressionFreeToElite() public {
        vm.startPrank(alice);

        // Free → Basic
        staking.stake(100e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Basic));

        // Basic → Pro
        staking.stake(900e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Pro));

        // Pro → Elite
        staking.stake(9_000e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Elite));

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════
    // UNSTAKING — NORMAL (≥ 30 DAYS, NO PENALTY)
    // ═══════════════════════════════════════════════

    function test_unstake_normalNoPenalty() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        // Warp past 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(1_000e18);

        assertEq(fit.balanceOf(alice), balanceBefore + 1_000e18);
        (uint256 amount,) = staking.getStake(alice);
        assertEq(amount, 0);
        assertEq(staking.totalStaked(), 0);
    }

    function test_unstake_normalPartial() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        vm.warp(block.timestamp + 30 days);

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(400e18);

        assertEq(fit.balanceOf(alice), balanceBefore + 400e18);
        (uint256 amount,) = staking.getStake(alice);
        assertEq(amount, 600e18);
    }

    function test_unstake_normalEmitsEvent() public {
        vm.prank(alice);
        staking.stake(500e18);

        vm.warp(block.timestamp + 30 days);

        vm.expectEmit(true, false, false, true);
        emit Unstaked(alice, 500e18, 0, 500e18);

        vm.prank(alice);
        staking.unstake(500e18);
    }

    function test_unstake_normalResetStakedAt() public {
        vm.prank(alice);
        staking.stake(500e18);

        vm.warp(block.timestamp + 30 days);

        vm.prank(alice);
        staking.unstake(500e18);

        (, uint256 stakedAt) = staking.getStake(alice);
        assertEq(stakedAt, 0);
    }

    function test_unstake_revertZeroAmount() public {
        vm.prank(alice);
        staking.stake(100e18);

        vm.prank(alice);
        vm.expectRevert(FitStaking.ZeroAmount.selector);
        staking.unstake(0);
    }

    function test_unstake_revertInsufficientStake() public {
        vm.prank(alice);
        staking.stake(100e18);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(FitStaking.InsufficientStake.selector, 200e18, 100e18));
        staking.unstake(200e18);
    }

    function test_unstake_revertNothingStaked() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(FitStaking.InsufficientStake.selector, 100e18, 0));
        staking.unstake(100e18);
    }

    // ═══════════════════════════════════════════════
    // UNSTAKING — EARLY (< 30 DAYS, 5% PENALTY)
    // ═══════════════════════════════════════════════

    function test_unstakeEarly_penaltyApplied() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        // Unstake same day (early)
        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(1_000e18);

        // 5% penalty = 50 FIT, payout = 950 FIT
        assertEq(fit.balanceOf(alice), balanceBefore + 950e18);
    }

    function test_unstakeEarly_penaltyRoutedToFeeCollector() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        // Check FeeCollector balance before
        uint256 feeCollectorBalance = fit.balanceOf(address(feeCollector));

        vm.prank(alice);
        staking.unstake(1_000e18);

        // Penalty (50 FIT) should be in FeeCollector
        assertEq(fit.balanceOf(address(feeCollector)), feeCollectorBalance + 50e18);
    }

    function test_unstakeEarly_feeCollectedEventEmitted() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        // Expect the FeeCollected event from ProtocolFeeCollector
        vm.expectEmit(true, true, false, true, address(feeCollector));
        emit FeeCollected(address(staking), address(fit), 50e18, "earlyUnstake");

        vm.prank(alice);
        staking.unstake(1_000e18);
    }

    function test_unstakeEarly_emitsUnstakedEvent() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        vm.expectEmit(true, false, false, true);
        emit Unstaked(alice, 1_000e18, 50e18, 950e18);

        vm.prank(alice);
        staking.unstake(1_000e18);
    }

    function test_unstakeEarly_partialUnstake() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(200e18);

        // 5% of 200 = 10 FIT penalty, payout = 190 FIT
        assertEq(fit.balanceOf(alice), balanceBefore + 190e18);
        (uint256 amount,) = staking.getStake(alice);
        assertEq(amount, 800e18);
    }

    function test_unstakeEarly_exactlyAtBoundary_noPenalty() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        // Warp to exactly 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(1_000e18);

        // Exactly at boundary: block.timestamp == stakedAt + 30 days
        // Condition is `<`, so exactly at 30 days = NO penalty
        assertEq(fit.balanceOf(alice), balanceBefore + 1_000e18);
    }

    function test_unstakeEarly_oneDayBefore_hasPenalty() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        // Warp to 29 days (1 day before boundary)
        vm.warp(block.timestamp + 29 days);

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(1_000e18);

        // Still early: 5% penalty
        assertEq(fit.balanceOf(alice), balanceBefore + 950e18);
    }

    function test_unstakeEarly_tierDowngrade() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Pro));

        vm.expectEmit(true, false, false, true);
        emit TierChanged(alice, FitStaking.Tier.Pro, FitStaking.Tier.Free);

        vm.prank(alice);
        staking.unstake(1_000e18);

        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Free));
    }

    // ═══════════════════════════════════════════════
    // VIEW FUNCTION TESTS
    // ═══════════════════════════════════════════════

    function test_getStake_default() public view {
        (uint256 amount, uint256 stakedAt) = staking.getStake(alice);
        assertEq(amount, 0);
        assertEq(stakedAt, 0);
    }

    function test_getStake_afterStaking() public {
        vm.prank(alice);
        staking.stake(500e18);

        (uint256 amount, uint256 stakedAt) = staking.getStake(alice);
        assertEq(amount, 500e18);
        assertEq(stakedAt, block.timestamp);
    }

    function test_isEarlyUnstake_noStake() public view {
        assertFalse(staking.isEarlyUnstake(alice));
    }

    function test_isEarlyUnstake_true() public {
        vm.prank(alice);
        staking.stake(100e18);

        assertTrue(staking.isEarlyUnstake(alice));
    }

    function test_isEarlyUnstake_falseAfter30Days() public {
        vm.prank(alice);
        staking.stake(100e18);

        vm.warp(block.timestamp + 30 days);
        assertFalse(staking.isEarlyUnstake(alice));
    }

    function test_earlyUnstakePenalty_calculation() public view {
        assertEq(staking.earlyUnstakePenalty(1_000e18), 50e18);
        assertEq(staking.earlyUnstakePenalty(100e18), 5e18);
        assertEq(staking.earlyUnstakePenalty(10_000e18), 500e18);
        assertEq(staking.earlyUnstakePenalty(0), 0);
    }

    // ═══════════════════════════════════════════════
    // ADMIN TESTS
    // ═══════════════════════════════════════════════

    function test_updateThresholds_success() public {
        vm.expectEmit(false, false, false, true);
        emit ThresholdsUpdated(200e18, 2_000e18, 20_000e18);

        vm.prank(owner);
        staking.updateThresholds(200e18, 2_000e18, 20_000e18);

        assertEq(staking.basicThreshold(), 200e18);
        assertEq(staking.proThreshold(), 2_000e18);
        assertEq(staking.eliteThreshold(), 20_000e18);
    }

    function test_updateThresholds_affectsTiers() public {
        vm.prank(alice);
        staking.stake(500e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Basic));

        // Raise basic threshold above alice's stake
        vm.prank(owner);
        staking.updateThresholds(1_000e18, 5_000e18, 50_000e18);

        // Alice should now be Free tier
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Free));
    }

    function test_updateThresholds_revertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        staking.updateThresholds(200e18, 2_000e18, 20_000e18);
    }

    function test_updateThresholds_revertIfBasicZero() public {
        vm.prank(owner);
        vm.expectRevert(FitStaking.InvalidThresholds.selector);
        staking.updateThresholds(0, 1_000e18, 10_000e18);
    }

    function test_updateThresholds_revertIfProNotGreaterThanBasic() public {
        vm.prank(owner);
        vm.expectRevert(FitStaking.InvalidThresholds.selector);
        staking.updateThresholds(1_000e18, 1_000e18, 10_000e18);
    }

    function test_updateThresholds_revertIfEliteNotGreaterThanPro() public {
        vm.prank(owner);
        vm.expectRevert(FitStaking.InvalidThresholds.selector);
        staking.updateThresholds(100e18, 10_000e18, 10_000e18);
    }

    // ═══════════════════════════════════════════════
    // EDGE CASE TESTS
    // ═══════════════════════════════════════════════

    function test_edge_stakeUnstakeRestake_resetsTimer() public {
        vm.prank(alice);
        staking.stake(100e18);
        uint256 firstStakedAt = block.timestamp;

        // Warp past 30 days and fully unstake
        vm.warp(block.timestamp + 30 days);
        vm.prank(alice);
        staking.unstake(100e18);

        (, uint256 stakedAtAfterUnstake) = staking.getStake(alice);
        assertEq(stakedAtAfterUnstake, 0);

        // Warp 5 more days and restake
        vm.warp(block.timestamp + 5 days);
        vm.prank(alice);
        staking.stake(100e18);

        (, uint256 newStakedAt) = staking.getStake(alice);
        // Timer should be reset to current timestamp
        assertTrue(newStakedAt > firstStakedAt);
        assertEq(newStakedAt, block.timestamp);
    }

    function test_edge_multipleUsersIndependent() public {
        vm.prank(alice);
        staking.stake(1_000e18);

        vm.warp(block.timestamp + 15 days);
        vm.prank(bob);
        staking.stake(500e18);

        vm.warp(block.timestamp + 16 days); // alice: 31 days, bob: 16 days

        // Alice unstakes — no penalty (31 days)
        uint256 aliceBefore = fit.balanceOf(alice);
        vm.prank(alice);
        staking.unstake(1_000e18);
        assertEq(fit.balanceOf(alice), aliceBefore + 1_000e18);

        // Bob unstakes — penalty (16 days)
        uint256 bobBefore = fit.balanceOf(bob);
        vm.prank(bob);
        staking.unstake(500e18);
        // 5% of 500 = 25 penalty, payout = 475
        assertEq(fit.balanceOf(bob), bobBefore + 475e18);
    }

    function test_edge_unstakeToExactTierBoundary() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Pro));

        vm.warp(block.timestamp + 30 days);

        // Unstake down to exactly Basic threshold
        vm.prank(alice);
        staking.unstake(900e18);

        (uint256 amount,) = staking.getStake(alice);
        assertEq(amount, 100e18);
        assertEq(uint256(staking.getTier(alice)), uint256(FitStaking.Tier.Basic));
    }

    function test_edge_unstakeAllUpdatesTotal() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        vm.prank(bob);
        staking.stake(2_000e18);

        assertEq(staking.totalStaked(), 3_000e18);

        vm.warp(block.timestamp + 30 days);

        vm.prank(alice);
        staking.unstake(1_000e18);
        assertEq(staking.totalStaked(), 2_000e18);

        vm.prank(bob);
        staking.unstake(2_000e18);
        assertEq(staking.totalStaked(), 0);
    }

    function test_edge_earlyUnstakePenaltyMath_smallAmount() public {
        vm.prank(alice);
        staking.stake(1e18); // 1 FIT

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(1e18);

        // 5% of 1e18 = 0.05 FIT = 5e16
        uint256 penalty = (1e18 * 500) / 10_000;
        assertEq(penalty, 5e16);
        assertEq(fit.balanceOf(alice), balanceBefore + 1e18 - penalty);
    }

    // ═══════════════════════════════════════════════
    // FUZZ TESTS
    // ═══════════════════════════════════════════════

    function testFuzz_stake_validAmount(uint256 amount) public {
        amount = bound(amount, 1, 50_000e18);

        vm.prank(alice);
        staking.stake(amount);

        (uint256 stakedAmount,) = staking.getStake(alice);
        assertEq(stakedAmount, amount);
        assertEq(staking.totalStaked(), amount);
    }

    function testFuzz_unstakeEarly_penaltyCalculation(uint256 amount) public {
        amount = bound(amount, 1, 50_000e18);

        vm.prank(alice);
        staking.stake(amount);

        uint256 expectedPenalty = (amount * 500) / 10_000;
        uint256 expectedPayout = amount - expectedPenalty;

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(amount);

        assertEq(fit.balanceOf(alice), balanceBefore + expectedPayout);
        assertEq(fit.balanceOf(address(feeCollector)), expectedPenalty);
    }

    function testFuzz_unstakeNormal_noPenalty(uint256 amount, uint256 daysWarp) public {
        amount = bound(amount, 1, 50_000e18);
        daysWarp = bound(daysWarp, 30, 365);

        vm.prank(alice);
        staking.stake(amount);

        vm.warp(block.timestamp + daysWarp * 1 days);

        uint256 balanceBefore = fit.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(amount);

        // Full amount returned, no penalty
        assertEq(fit.balanceOf(alice), balanceBefore + amount);
    }

    function testFuzz_tierBoundaries(uint256 amount) public {
        amount = bound(amount, 0, 50_000e18);

        if (amount > 0) {
            vm.prank(alice);
            staking.stake(amount);
        }

        FitStaking.Tier tier = staking.getTier(alice);

        if (amount >= 10_000e18) {
            assertEq(uint256(tier), uint256(FitStaking.Tier.Elite));
        } else if (amount >= 1_000e18) {
            assertEq(uint256(tier), uint256(FitStaking.Tier.Pro));
        } else if (amount >= 100e18) {
            assertEq(uint256(tier), uint256(FitStaking.Tier.Basic));
        } else {
            assertEq(uint256(tier), uint256(FitStaking.Tier.Free));
        }
    }

    function testFuzz_partialUnstake(uint256 stakeAmount, uint256 unstakeAmount) public {
        stakeAmount = bound(stakeAmount, 1, 50_000e18);
        unstakeAmount = bound(unstakeAmount, 1, stakeAmount);

        vm.prank(alice);
        staking.stake(stakeAmount);

        vm.warp(block.timestamp + 30 days);

        vm.prank(alice);
        staking.unstake(unstakeAmount);

        (uint256 remaining,) = staking.getStake(alice);
        assertEq(remaining, stakeAmount - unstakeAmount);
    }
}
