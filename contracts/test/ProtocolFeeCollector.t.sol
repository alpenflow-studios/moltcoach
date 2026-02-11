// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ProtocolFeeCollector} from "../src/fees/ProtocolFeeCollector.sol";
import {ClawcToken} from "../src/ClawcToken.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Minimal ERC-20 mock for USDC (6 decimals)
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ProtocolFeeCollectorTest is Test {
    ClawcToken public clawc;
    MockUSDC public usdc;
    ProtocolFeeCollector public collector;

    address internal owner;
    address internal alice;
    address internal bob;
    address internal devWallet;
    address internal buybackWallet;
    address internal communityWallet;
    address internal insuranceWallet;

    // Re-declare events for expectEmit
    event FeeCollected(address indexed source, address indexed token, uint256 amount, string feeType);
    event TreasuryDistributed(address indexed token, uint256 development, uint256 buyback, uint256 community, uint256 insurance);
    event AllocationUpdated(uint256 development, uint256 buyback, uint256 community, uint256 insurance);
    event FeeUpdated(string feeType, uint256 oldFee, uint256 newFee);
    event TreasuryWalletUpdated(string walletType, address oldWallet, address newWallet);

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        devWallet = makeAddr("devWallet");
        buybackWallet = makeAddr("buybackWallet");
        communityWallet = makeAddr("communityWallet");
        insuranceWallet = makeAddr("insuranceWallet");

        clawc = new ClawcToken(owner);
        usdc = new MockUSDC();

        collector = new ProtocolFeeCollector(
            address(clawc),
            address(usdc),
            owner,
            devWallet,
            buybackWallet,
            communityWallet,
            insuranceWallet
        );

        // Mint tokens to alice for testing
        vm.prank(owner);
        clawc.mint(alice, 10_000e18);

        usdc.mint(alice, 100_000e6); // 100K USDC
    }

    // ═══════════════════════════════════════════════
    // DEPLOYMENT TESTS
    // ═══════════════════════════════════════════════

    function test_deployment_owner() public view {
        assertEq(collector.owner(), owner);
    }

    function test_deployment_tokens() public view {
        assertEq(address(collector.clawcToken()), address(clawc));
        assertEq(address(collector.usdcToken()), address(usdc));
    }

    function test_deployment_treasuryWallets() public view {
        assertEq(collector.developmentWallet(), devWallet);
        assertEq(collector.buybackWallet(), buybackWallet);
        assertEq(collector.communityWallet(), communityWallet);
        assertEq(collector.insuranceWallet(), insuranceWallet);
    }

    function test_deployment_defaultAllocation() public view {
        assertEq(collector.developmentBps(), 4000);
        assertEq(collector.buybackBps(), 3000);
        assertEq(collector.communityBps(), 2000);
        assertEq(collector.insuranceBps(), 1000);
    }

    function test_deployment_defaultFees() public view {
        assertEq(collector.transactionFeeBps(), 50);
        assertEq(collector.spawnFeeUsdc(), 10e6);
        assertEq(collector.spawnFeeClawc(), 50e18);
        assertEq(collector.validationFeeTier1(), 1e16);
        assertEq(collector.validationFeeTier2(), 5e16);
        assertEq(collector.evolutionFee(), 5e18);
        assertEq(collector.modeSwitchFee(), 2e18);
        assertEq(collector.resetFee(), 15e18);
    }

    function test_deployment_revertIfZeroClawcToken() public {
        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        new ProtocolFeeCollector(
            address(0), address(usdc), owner, devWallet, buybackWallet, communityWallet, insuranceWallet
        );
    }

    function test_deployment_revertIfZeroUsdcToken() public {
        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        new ProtocolFeeCollector(
            address(clawc), address(0), owner, devWallet, buybackWallet, communityWallet, insuranceWallet
        );
    }

    function test_deployment_revertIfZeroTreasuryWallet() public {
        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        new ProtocolFeeCollector(
            address(clawc), address(usdc), owner, address(0), buybackWallet, communityWallet, insuranceWallet
        );

        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        new ProtocolFeeCollector(
            address(clawc), address(usdc), owner, devWallet, address(0), communityWallet, insuranceWallet
        );

        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        new ProtocolFeeCollector(
            address(clawc), address(usdc), owner, devWallet, buybackWallet, address(0), insuranceWallet
        );

        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        new ProtocolFeeCollector(
            address(clawc), address(usdc), owner, devWallet, buybackWallet, communityWallet, address(0)
        );
    }

    // ═══════════════════════════════════════════════
    // CLAWC FEE COLLECTION TESTS
    // ═══════════════════════════════════════════════

    function test_collectClawcFee_success() public {
        vm.prank(alice);
        clawc.approve(address(collector), 100e18);

        vm.expectEmit(true, true, false, true);
        emit FeeCollected(alice, address(clawc), 50e18, "spawn");

        collector.collectClawcFee(alice, 50e18, "spawn");

        assertEq(clawc.balanceOf(address(collector)), 50e18);
        assertEq(clawc.balanceOf(alice), 10_000e18 - 50e18);
        assertEq(collector.totalCollected("spawn"), 50e18);
    }

    function test_collectClawcFee_multipleFeeTypes() public {
        vm.prank(alice);
        clawc.approve(address(collector), 100e18);

        collector.collectClawcFee(alice, 50e18, "spawn");
        collector.collectClawcFee(alice, 5e18, "evolution");
        collector.collectClawcFee(alice, 2e18, "modeSwitch");

        assertEq(collector.totalCollected("spawn"), 50e18);
        assertEq(collector.totalCollected("evolution"), 5e18);
        assertEq(collector.totalCollected("modeSwitch"), 2e18);
    }

    function test_collectClawcFee_accumulates() public {
        vm.prank(alice);
        clawc.approve(address(collector), 200e18);

        collector.collectClawcFee(alice, 50e18, "spawn");
        collector.collectClawcFee(alice, 50e18, "spawn");

        assertEq(collector.totalCollected("spawn"), 100e18);
        assertEq(clawc.balanceOf(address(collector)), 100e18);
    }

    function test_collectClawcFee_revertIfZeroAmount() public {
        vm.expectRevert(ProtocolFeeCollector.InvalidFee.selector);
        collector.collectClawcFee(alice, 0, "spawn");
    }

    function test_collectClawcFee_revertIfNoApproval() public {
        vm.expectRevert();
        collector.collectClawcFee(alice, 50e18, "spawn");
    }

    // ═══════════════════════════════════════════════
    // USDC FEE COLLECTION TESTS
    // ═══════════════════════════════════════════════

    function test_collectUsdcFee_success() public {
        vm.prank(alice);
        usdc.approve(address(collector), 100e6);

        vm.expectEmit(true, true, false, true);
        emit FeeCollected(alice, address(usdc), 10e6, "spawn");

        collector.collectUsdcFee(alice, 10e6, "spawn");

        assertEq(usdc.balanceOf(address(collector)), 10e6);
        assertEq(collector.totalCollected("spawn"), 10e6);
    }

    function test_collectUsdcFee_revertIfZeroAmount() public {
        vm.expectRevert(ProtocolFeeCollector.InvalidFee.selector);
        collector.collectUsdcFee(alice, 0, "spawn");
    }

    function test_collectUsdcFee_revertIfNoApproval() public {
        vm.expectRevert();
        collector.collectUsdcFee(alice, 10e6, "spawn");
    }

    // ═══════════════════════════════════════════════
    // FEE CALCULATION TESTS
    // ═══════════════════════════════════════════════

    function test_calculateTransactionFee_default() public view {
        // 0.5% of 1000 = 5
        assertEq(collector.calculateTransactionFee(1000e18), 5e18);
    }

    function test_calculateTransactionFee_zero() public view {
        assertEq(collector.calculateTransactionFee(0), 0);
    }

    function test_calculateTransactionFee_smallAmount() public view {
        // 0.5% of 100 = 0.5 → rounds down to 0
        assertEq(collector.calculateTransactionFee(100), 0);
    }

    function test_getValidationFee_tier1() public view {
        assertEq(collector.getValidationFee(1), 1e16);
    }

    function test_getValidationFee_tier2() public view {
        assertEq(collector.getValidationFee(2), 5e16);
    }

    function test_getValidationFee_tier3Free() public view {
        assertEq(collector.getValidationFee(3), 0);
    }

    function test_getValidationFee_unknownTierFree() public view {
        assertEq(collector.getValidationFee(255), 0);
    }

    // ═══════════════════════════════════════════════
    // TREASURY DISTRIBUTION TESTS
    // ═══════════════════════════════════════════════

    function test_distribute_clawcToken() public {
        // Collect some fees first
        vm.prank(alice);
        clawc.approve(address(collector), 1000e18);
        collector.collectClawcFee(alice, 1000e18, "spawn");

        vm.prank(owner);
        collector.distribute(address(clawc));

        // 40/30/20/10 split of 1000
        assertEq(clawc.balanceOf(devWallet), 400e18);
        assertEq(clawc.balanceOf(buybackWallet), 300e18);
        assertEq(clawc.balanceOf(communityWallet), 200e18);
        assertEq(clawc.balanceOf(insuranceWallet), 100e18);
        assertEq(clawc.balanceOf(address(collector)), 0);
    }

    function test_distribute_usdcToken() public {
        vm.prank(alice);
        usdc.approve(address(collector), 10_000e6);
        collector.collectUsdcFee(alice, 10_000e6, "spawn");

        vm.prank(owner);
        collector.distribute(address(usdc));

        assertEq(usdc.balanceOf(devWallet), 4000e6);
        assertEq(usdc.balanceOf(buybackWallet), 3000e6);
        assertEq(usdc.balanceOf(communityWallet), 2000e6);
        assertEq(usdc.balanceOf(insuranceWallet), 1000e6);
        assertEq(usdc.balanceOf(address(collector)), 0);
    }

    function test_distribute_emitsEvent() public {
        vm.prank(alice);
        clawc.approve(address(collector), 1000e18);
        collector.collectClawcFee(alice, 1000e18, "spawn");

        vm.expectEmit(true, false, false, true);
        emit TreasuryDistributed(address(clawc), 400e18, 300e18, 200e18, 100e18);

        vm.prank(owner);
        collector.distribute(address(clawc));
    }

    function test_distribute_insuranceGetsRemainder() public {
        // With an amount that doesn't divide evenly
        // 333 CLAWC: dev=133.2, buyback=99.9, community=66.6, insurance=remainder
        vm.prank(alice);
        clawc.approve(address(collector), 333e18);
        collector.collectClawcFee(alice, 333e18, "test");

        vm.prank(owner);
        collector.distribute(address(clawc));

        uint256 devAmount = (333e18 * 4000) / 10000; // 133.2e18
        uint256 buybackAmount = (333e18 * 3000) / 10000; // 99.9e18
        uint256 communityAmount = (333e18 * 2000) / 10000; // 66.6e18
        uint256 insuranceAmount = 333e18 - devAmount - buybackAmount - communityAmount;

        assertEq(clawc.balanceOf(devWallet), devAmount);
        assertEq(clawc.balanceOf(buybackWallet), buybackAmount);
        assertEq(clawc.balanceOf(communityWallet), communityAmount);
        assertEq(clawc.balanceOf(insuranceWallet), insuranceAmount);
        assertEq(clawc.balanceOf(address(collector)), 0);
    }

    function test_distribute_revertIfNotOwner() public {
        vm.prank(alice);
        clawc.approve(address(collector), 100e18);
        collector.collectClawcFee(alice, 100e18, "spawn");

        vm.prank(alice);
        vm.expectRevert();
        collector.distribute(address(clawc));
    }

    function test_distribute_revertIfNoBalance() public {
        vm.prank(owner);
        vm.expectRevert(ProtocolFeeCollector.NothingToDistribute.selector);
        collector.distribute(address(clawc));
    }

    // ═══════════════════════════════════════════════
    // ALLOCATION UPDATE TESTS
    // ═══════════════════════════════════════════════

    function test_updateAllocation_success() public {
        vm.expectEmit(false, false, false, true);
        emit AllocationUpdated(5000, 2000, 2000, 1000);

        vm.prank(owner);
        collector.updateAllocation(5000, 2000, 2000, 1000);

        assertEq(collector.developmentBps(), 5000);
        assertEq(collector.buybackBps(), 2000);
        assertEq(collector.communityBps(), 2000);
        assertEq(collector.insuranceBps(), 1000);
    }

    function test_updateAllocation_extremeValues() public {
        // All to development
        vm.prank(owner);
        collector.updateAllocation(10000, 0, 0, 0);
        assertEq(collector.developmentBps(), 10000);

        // All to insurance
        vm.prank(owner);
        collector.updateAllocation(0, 0, 0, 10000);
        assertEq(collector.insuranceBps(), 10000);
    }

    function test_updateAllocation_revertIfSumNot10000() public {
        vm.prank(owner);
        vm.expectRevert(ProtocolFeeCollector.InvalidAllocation.selector);
        collector.updateAllocation(4000, 3000, 2000, 500); // sum = 9500

        vm.prank(owner);
        vm.expectRevert(ProtocolFeeCollector.InvalidAllocation.selector);
        collector.updateAllocation(4000, 3000, 2000, 2000); // sum = 11000
    }

    function test_updateAllocation_revertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        collector.updateAllocation(4000, 3000, 2000, 1000);
    }

    function test_updateAllocation_affectsDistribution() public {
        // Change to 50/25/15/10
        vm.prank(owner);
        collector.updateAllocation(5000, 2500, 1500, 1000);

        vm.prank(alice);
        clawc.approve(address(collector), 1000e18);
        collector.collectClawcFee(alice, 1000e18, "test");

        vm.prank(owner);
        collector.distribute(address(clawc));

        assertEq(clawc.balanceOf(devWallet), 500e18);
        assertEq(clawc.balanceOf(buybackWallet), 250e18);
        assertEq(clawc.balanceOf(communityWallet), 150e18);
        assertEq(clawc.balanceOf(insuranceWallet), 100e18);
    }

    // ═══════════════════════════════════════════════
    // FEE RATE UPDATE TESTS
    // ═══════════════════════════════════════════════

    function test_updateTransactionFeeBps_success() public {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("transactionBps", 50, 100);

        vm.prank(owner);
        collector.updateTransactionFeeBps(100);
        assertEq(collector.transactionFeeBps(), 100);
    }

    function test_updateTransactionFeeBps_setToZero() public {
        vm.prank(owner);
        collector.updateTransactionFeeBps(0);
        assertEq(collector.transactionFeeBps(), 0);
        assertEq(collector.calculateTransactionFee(1000e18), 0);
    }

    function test_updateTransactionFeeBps_atMaxCap() public {
        vm.prank(owner);
        collector.updateTransactionFeeBps(500);
        assertEq(collector.transactionFeeBps(), 500);
    }

    function test_updateTransactionFeeBps_revertIfExceedsCap() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(ProtocolFeeCollector.ExceedsMaxTransactionFee.selector, 501, 500)
        );
        collector.updateTransactionFeeBps(501);
    }

    function test_updateTransactionFeeBps_revertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        collector.updateTransactionFeeBps(100);
    }

    function test_updateSpawnFeeUsdc() public {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("spawnUsdc", 10e6, 20e6);

        vm.prank(owner);
        collector.updateSpawnFeeUsdc(20e6);
        assertEq(collector.spawnFeeUsdc(), 20e6);
    }

    function test_updateSpawnFeeClawc() public {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("spawnClawc", 50e18, 100e18);

        vm.prank(owner);
        collector.updateSpawnFeeClawc(100e18);
        assertEq(collector.spawnFeeClawc(), 100e18);
    }

    function test_updateValidationFees() public {
        vm.prank(owner);
        collector.updateValidationFees(2e16, 10e16);

        assertEq(collector.validationFeeTier1(), 2e16);
        assertEq(collector.validationFeeTier2(), 10e16);
    }

    function test_updateValidationFees_emitsEvents() public {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("validationTier1", 1e16, 2e16);
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("validationTier2", 5e16, 10e16);

        vm.prank(owner);
        collector.updateValidationFees(2e16, 10e16);
    }

    function test_updateEvolutionFee() public {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("evolution", 5e18, 10e18);

        vm.prank(owner);
        collector.updateEvolutionFee(10e18);
        assertEq(collector.evolutionFee(), 10e18);
    }

    function test_updateModeSwitchFee() public {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("modeSwitch", 2e18, 5e18);

        vm.prank(owner);
        collector.updateModeSwitchFee(5e18);
        assertEq(collector.modeSwitchFee(), 5e18);
    }

    function test_updateResetFee() public {
        vm.expectEmit(false, false, false, true);
        emit FeeUpdated("reset", 15e18, 25e18);

        vm.prank(owner);
        collector.updateResetFee(25e18);
        assertEq(collector.resetFee(), 25e18);
    }

    function test_updateFees_revertIfNotOwner() public {
        vm.startPrank(alice);

        vm.expectRevert();
        collector.updateSpawnFeeUsdc(20e6);

        vm.expectRevert();
        collector.updateSpawnFeeClawc(100e18);

        vm.expectRevert();
        collector.updateValidationFees(2e16, 10e16);

        vm.expectRevert();
        collector.updateEvolutionFee(10e18);

        vm.expectRevert();
        collector.updateModeSwitchFee(5e18);

        vm.expectRevert();
        collector.updateResetFee(25e18);

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════
    // TREASURY WALLET UPDATE TESTS
    // ═══════════════════════════════════════════════

    function test_updateDevelopmentWallet() public {
        address newWallet = makeAddr("newDev");

        vm.expectEmit(false, false, false, true);
        emit TreasuryWalletUpdated("development", devWallet, newWallet);

        vm.prank(owner);
        collector.updateDevelopmentWallet(newWallet);
        assertEq(collector.developmentWallet(), newWallet);
    }

    function test_updateBuybackWallet() public {
        address newWallet = makeAddr("newBuyback");
        vm.prank(owner);
        collector.updateBuybackWallet(newWallet);
        assertEq(collector.buybackWallet(), newWallet);
    }

    function test_updateCommunityWallet() public {
        address newWallet = makeAddr("newCommunity");
        vm.prank(owner);
        collector.updateCommunityWallet(newWallet);
        assertEq(collector.communityWallet(), newWallet);
    }

    function test_updateInsuranceWallet() public {
        address newWallet = makeAddr("newInsurance");
        vm.prank(owner);
        collector.updateInsuranceWallet(newWallet);
        assertEq(collector.insuranceWallet(), newWallet);
    }

    function test_updateWallets_revertIfZeroAddress() public {
        vm.startPrank(owner);

        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        collector.updateDevelopmentWallet(address(0));

        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        collector.updateBuybackWallet(address(0));

        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        collector.updateCommunityWallet(address(0));

        vm.expectRevert(ProtocolFeeCollector.ZeroAddress.selector);
        collector.updateInsuranceWallet(address(0));

        vm.stopPrank();
    }

    function test_updateWallets_revertIfNotOwner() public {
        address newWallet = makeAddr("newWallet");
        vm.startPrank(alice);

        vm.expectRevert();
        collector.updateDevelopmentWallet(newWallet);

        vm.expectRevert();
        collector.updateBuybackWallet(newWallet);

        vm.expectRevert();
        collector.updateCommunityWallet(newWallet);

        vm.expectRevert();
        collector.updateInsuranceWallet(newWallet);

        vm.stopPrank();
    }

    function test_updateWallet_distributesToNewAddress() public {
        address newDev = makeAddr("newDev");

        vm.prank(owner);
        collector.updateDevelopmentWallet(newDev);

        // Collect and distribute
        vm.prank(alice);
        clawc.approve(address(collector), 1000e18);
        collector.collectClawcFee(alice, 1000e18, "test");

        vm.prank(owner);
        collector.distribute(address(clawc));

        // Funds go to new wallet, not old
        assertEq(clawc.balanceOf(newDev), 400e18);
        assertEq(clawc.balanceOf(devWallet), 0);
    }

    // ═══════════════════════════════════════════════
    // END-TO-END TESTS
    // ═══════════════════════════════════════════════

    function test_e2e_collectAndDistribute() public {
        // Alice pays spawn fee in CLAWC + USDC
        vm.startPrank(alice);
        clawc.approve(address(collector), 50e18);
        usdc.approve(address(collector), 10e6);
        vm.stopPrank();

        collector.collectClawcFee(alice, 50e18, "spawn");
        collector.collectUsdcFee(alice, 10e6, "spawn");

        // Distribute CLAWC
        vm.prank(owner);
        collector.distribute(address(clawc));

        assertEq(clawc.balanceOf(devWallet), 20e18);      // 40%
        assertEq(clawc.balanceOf(buybackWallet), 15e18);   // 30%
        assertEq(clawc.balanceOf(communityWallet), 10e18);  // 20%
        assertEq(clawc.balanceOf(insuranceWallet), 5e18);   // 10%

        // Distribute USDC
        vm.prank(owner);
        collector.distribute(address(usdc));

        assertEq(usdc.balanceOf(devWallet), 4e6);         // 40%
        assertEq(usdc.balanceOf(buybackWallet), 3e6);     // 30%
        assertEq(usdc.balanceOf(communityWallet), 2e6);   // 20%
        assertEq(usdc.balanceOf(insuranceWallet), 1e6);   // 10%
    }

    function test_e2e_multipleCollectionsThenDistribute() public {
        vm.prank(alice);
        clawc.approve(address(collector), 1000e18);

        // Multiple fee types accumulated
        collector.collectClawcFee(alice, 50e18, "spawn");
        collector.collectClawcFee(alice, 5e18, "evolution");
        collector.collectClawcFee(alice, 2e18, "modeSwitch");
        collector.collectClawcFee(alice, 15e18, "reset");
        // Total: 72 CLAWC

        vm.prank(owner);
        collector.distribute(address(clawc));

        uint256 total = 72e18;
        assertEq(clawc.balanceOf(devWallet), (total * 4000) / 10000);
        assertEq(clawc.balanceOf(buybackWallet), (total * 3000) / 10000);
        assertEq(clawc.balanceOf(communityWallet), (total * 2000) / 10000);
        // Insurance gets remainder
        uint256 insuranceExpected = total
            - (total * 4000) / 10000
            - (total * 3000) / 10000
            - (total * 2000) / 10000;
        assertEq(clawc.balanceOf(insuranceWallet), insuranceExpected);
    }

    // ═══════════════════════════════════════════════
    // FUZZ TESTS
    // ═══════════════════════════════════════════════

    function testFuzz_collectClawcFee(uint256 amount) public {
        amount = bound(amount, 1, 10_000e18);

        vm.prank(alice);
        clawc.approve(address(collector), amount);

        collector.collectClawcFee(alice, amount, "fuzz");

        assertEq(clawc.balanceOf(address(collector)), amount);
        assertEq(collector.totalCollected("fuzz"), amount);
    }

    function testFuzz_calculateTransactionFee(uint256 amount) public view {
        amount = bound(amount, 0, type(uint128).max);
        uint256 expected = (amount * 50) / 10000;
        assertEq(collector.calculateTransactionFee(amount), expected);
    }

    function testFuzz_updateAllocation_validSum(
        uint256 dev,
        uint256 buyback,
        uint256 community
    ) public {
        dev = bound(dev, 0, 10000);
        buyback = bound(buyback, 0, 10000 - dev);
        community = bound(community, 0, 10000 - dev - buyback);
        uint256 insurance = 10000 - dev - buyback - community;

        vm.prank(owner);
        collector.updateAllocation(dev, buyback, community, insurance);

        assertEq(collector.developmentBps(), dev);
        assertEq(collector.buybackBps(), buyback);
        assertEq(collector.communityBps(), community);
        assertEq(collector.insuranceBps(), insurance);
    }

    function testFuzz_distribute_sumsToTotal(uint256 amount) public {
        amount = bound(amount, 1, 10_000e18);

        vm.prank(alice);
        clawc.approve(address(collector), amount);
        collector.collectClawcFee(alice, amount, "fuzz");

        vm.prank(owner);
        collector.distribute(address(clawc));

        uint256 total = clawc.balanceOf(devWallet) + clawc.balanceOf(buybackWallet)
            + clawc.balanceOf(communityWallet) + clawc.balanceOf(insuranceWallet);
        assertEq(total, amount);
        assertEq(clawc.balanceOf(address(collector)), 0);
    }

    function testFuzz_updateTransactionFeeBps(uint256 bps) public {
        bps = bound(bps, 0, 500);

        vm.prank(owner);
        collector.updateTransactionFeeBps(bps);

        assertEq(collector.transactionFeeBps(), bps);
    }
}
