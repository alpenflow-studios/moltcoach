// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ClawcToken} from "../src/ClawcToken.sol";

contract ClawcTokenTest is Test {
    ClawcToken public clawc;

    address internal owner;
    address internal alice;
    address internal bob;

    // Re-declare events for expectEmit
    event DailyEmissionCapUpdated(uint256 oldCap, uint256 newCap);
    event Transfer(address indexed from, address indexed to, uint256 value);

    function setUp() public {
        owner = makeAddr("owner");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        clawc = new ClawcToken(owner);
    }

    // ═══════════════════════════════════════════════
    // DEPLOYMENT TESTS
    // ═══════════════════════════════════════════════

    function test_deployment_name() public view {
        assertEq(clawc.name(), "ClawCoach");
    }

    function test_deployment_symbol() public view {
        assertEq(clawc.symbol(), "CLAWC");
    }

    function test_deployment_decimals() public view {
        assertEq(clawc.decimals(), 18);
    }

    function test_deployment_zeroInitialSupply() public view {
        assertEq(clawc.totalSupply(), 0);
    }

    function test_deployment_owner() public view {
        assertEq(clawc.owner(), owner);
    }

    function test_deployment_dailyEmissionCap() public view {
        assertEq(clawc.dailyEmissionCap(), 100_000e18);
    }

    function test_deployment_maxSupply() public view {
        assertEq(clawc.MAX_SUPPLY(), 1_000_000_000e18);
    }

    function test_deployment_currentDayStart() public view {
        uint256 expected = (block.timestamp / 1 days) * 1 days;
        assertEq(clawc.currentDayStart(), expected);
    }

    function test_deployment_mintedToday() public view {
        assertEq(clawc.mintedToday(), 0);
    }

    // ═══════════════════════════════════════════════
    // MINTING TESTS
    // ═══════════════════════════════════════════════

    function test_mint_success() public {
        vm.prank(owner);
        clawc.mint(alice, 1000e18);

        assertEq(clawc.balanceOf(alice), 1000e18);
        assertEq(clawc.totalSupply(), 1000e18);
    }

    function test_mint_updatesMintedToday() public {
        vm.prank(owner);
        clawc.mint(alice, 5000e18);

        assertEq(clawc.mintedToday(), 5000e18);
    }

    function test_mint_multipleCalls() public {
        vm.startPrank(owner);
        clawc.mint(alice, 30_000e18);
        clawc.mint(bob, 20_000e18);
        clawc.mint(alice, 50_000e18);
        vm.stopPrank();

        assertEq(clawc.balanceOf(alice), 80_000e18);
        assertEq(clawc.balanceOf(bob), 20_000e18);
        assertEq(clawc.totalSupply(), 100_000e18);
        assertEq(clawc.mintedToday(), 100_000e18);
    }

    function test_mint_exactlyAtDailyCap() public {
        vm.prank(owner);
        clawc.mint(alice, 100_000e18);

        assertEq(clawc.mintedToday(), 100_000e18);
        assertEq(clawc.totalSupply(), 100_000e18);
    }

    function test_mint_revertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        clawc.mint(alice, 1000e18);
    }

    function test_mint_revertIfExceedsDailyCap() public {
        vm.startPrank(owner);
        clawc.mint(alice, 90_000e18);

        vm.expectRevert(
            abi.encodeWithSelector(ClawcToken.ExceedsDailyEmissionCap.selector, 20_000e18, 10_000e18)
        );
        clawc.mint(alice, 20_000e18);
        vm.stopPrank();
    }

    function test_mint_revertIfExceedsMaxSupply() public {
        // Warp forward enough days to mint close to max supply
        // We'll use a cheat: set totalSupply near MAX by minting over many days
        uint256 capPerDay = 100_000e18;
        uint256 maxSupply = clawc.MAX_SUPPLY();

        // Mint for enough days to get near max
        uint256 daysNeeded = maxSupply / capPerDay; // 10000 days

        for (uint256 i = 0; i < daysNeeded; i++) {
            vm.warp(block.timestamp + 1 days);
            vm.prank(owner);
            clawc.mint(alice, capPerDay);
        }

        assertEq(clawc.totalSupply(), maxSupply);

        // Next day, try to mint more
        vm.warp(block.timestamp + 1 days);
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ClawcToken.ExceedsMaxSupply.selector, 1e18, 0));
        clawc.mint(alice, 1e18);
    }

    function test_mint_revertIfExceedsMaxSupplyPartial() public {
        // Mint up to just under max supply
        uint256 capPerDay = 100_000e18;
        uint256 maxSupply = clawc.MAX_SUPPLY();
        uint256 daysNeeded = maxSupply / capPerDay - 1;

        for (uint256 i = 0; i < daysNeeded; i++) {
            vm.warp(block.timestamp + 1 days);
            vm.prank(owner);
            clawc.mint(alice, capPerDay);
        }

        // Mint the remaining on the next day
        vm.warp(block.timestamp + 1 days);
        vm.prank(owner);
        clawc.mint(alice, capPerDay); // Now at MAX_SUPPLY

        // Try one more the next day — should revert
        vm.warp(block.timestamp + 1 days);
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ClawcToken.ExceedsMaxSupply.selector, 1, 0));
        clawc.mint(alice, 1);
    }

    function test_mint_emitsTransferEvent() public {
        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), alice, 500e18);

        vm.prank(owner);
        clawc.mint(alice, 500e18);
    }

    // ═══════════════════════════════════════════════
    // DAILY CAP ROLLOVER TESTS
    // ═══════════════════════════════════════════════

    function test_dailyCap_resetsOnNewDay() public {
        // Mint full cap
        vm.prank(owner);
        clawc.mint(alice, 100_000e18);
        assertEq(clawc.mintedToday(), 100_000e18);

        // Advance 1 day
        vm.warp(block.timestamp + 1 days);

        // Can mint again
        vm.prank(owner);
        clawc.mint(alice, 50_000e18);
        assertEq(clawc.mintedToday(), 50_000e18);
    }

    function test_dailyCap_resetAfterMultipleDays() public {
        vm.prank(owner);
        clawc.mint(alice, 80_000e18);

        // Skip 5 days
        vm.warp(block.timestamp + 5 days);

        vm.prank(owner);
        clawc.mint(alice, 100_000e18);
        assertEq(clawc.mintedToday(), 100_000e18);
    }

    function test_dailyCap_doesNotResetSameDay() public {
        vm.startPrank(owner);
        clawc.mint(alice, 60_000e18);

        // Same day — should accumulate
        clawc.mint(alice, 30_000e18);
        assertEq(clawc.mintedToday(), 90_000e18);

        // Still same day — should fail
        vm.expectRevert(
            abi.encodeWithSelector(ClawcToken.ExceedsDailyEmissionCap.selector, 20_000e18, 10_000e18)
        );
        clawc.mint(alice, 20_000e18);
        vm.stopPrank();
    }

    function test_dailyCap_currentDayStartUpdates() public {
        uint256 day1 = clawc.currentDayStart();

        vm.warp(block.timestamp + 1 days);
        vm.prank(owner);
        clawc.mint(alice, 1e18);

        uint256 day2 = clawc.currentDayStart();
        assertEq(day2, day1 + 1 days);
    }

    // ═══════════════════════════════════════════════
    // BURN TESTS
    // ═══════════════════════════════════════════════

    function test_burn_success() public {
        vm.prank(owner);
        clawc.mint(alice, 1000e18);

        vm.prank(alice);
        clawc.burn(400e18);

        assertEq(clawc.balanceOf(alice), 600e18);
        assertEq(clawc.totalSupply(), 600e18);
    }

    function test_burn_revertIfInsufficientBalance() public {
        vm.prank(owner);
        clawc.mint(alice, 100e18);

        vm.prank(alice);
        vm.expectRevert();
        clawc.burn(200e18);
    }

    function test_burnFrom_withApproval() public {
        vm.prank(owner);
        clawc.mint(alice, 1000e18);

        vm.prank(alice);
        clawc.approve(bob, 500e18);

        vm.prank(bob);
        clawc.burnFrom(alice, 300e18);

        assertEq(clawc.balanceOf(alice), 700e18);
        assertEq(clawc.allowance(alice, bob), 200e18);
    }

    function test_burnFrom_revertWithoutApproval() public {
        vm.prank(owner);
        clawc.mint(alice, 1000e18);

        vm.prank(bob);
        vm.expectRevert();
        clawc.burnFrom(alice, 100e18);
    }

    // ═══════════════════════════════════════════════
    // PERMIT TESTS (EIP-2612)
    // ═══════════════════════════════════════════════

    function test_permit_success() public {
        uint256 alicePk = 0xa11ce;
        address aliceSigner = vm.addr(alicePk);

        vm.prank(owner);
        clawc.mint(aliceSigner, 1000e18);

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = clawc.nonces(aliceSigner);

        bytes32 domainSeparator = clawc.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                aliceSigner,
                bob,
                500e18,
                nonce,
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);

        clawc.permit(aliceSigner, bob, 500e18, deadline, v, r, s);

        assertEq(clawc.allowance(aliceSigner, bob), 500e18);
    }

    function test_permit_revertIfExpired() public {
        uint256 alicePk = 0xa11ce;
        address aliceSigner = vm.addr(alicePk);

        uint256 deadline = block.timestamp - 1;
        uint256 nonce = clawc.nonces(aliceSigner);

        bytes32 domainSeparator = clawc.DOMAIN_SEPARATOR();
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                aliceSigner,
                bob,
                500e18,
                nonce,
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePk, digest);

        vm.expectRevert();
        clawc.permit(aliceSigner, bob, 500e18, deadline, v, r, s);
    }

    // ═══════════════════════════════════════════════
    // DAILY EMISSION CAP UPDATE TESTS
    // ═══════════════════════════════════════════════

    function test_updateDailyEmissionCap_success() public {
        vm.expectEmit(false, false, false, true);
        emit DailyEmissionCapUpdated(100_000e18, 200_000e18);

        vm.prank(owner);
        clawc.updateDailyEmissionCap(200_000e18);

        assertEq(clawc.dailyEmissionCap(), 200_000e18);
    }

    function test_updateDailyEmissionCap_atMinBound() public {
        vm.prank(owner);
        clawc.updateDailyEmissionCap(10_000e18);
        assertEq(clawc.dailyEmissionCap(), 10_000e18);
    }

    function test_updateDailyEmissionCap_atMaxBound() public {
        vm.prank(owner);
        clawc.updateDailyEmissionCap(500_000e18);
        assertEq(clawc.dailyEmissionCap(), 500_000e18);
    }

    function test_updateDailyEmissionCap_revertIfBelowMin() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ClawcToken.InvalidDailyCap.selector, 5_000e18));
        clawc.updateDailyEmissionCap(5_000e18);
    }

    function test_updateDailyEmissionCap_revertIfAboveMax() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ClawcToken.InvalidDailyCap.selector, 600_000e18));
        clawc.updateDailyEmissionCap(600_000e18);
    }

    function test_updateDailyEmissionCap_revertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        clawc.updateDailyEmissionCap(200_000e18);
    }

    function test_updateDailyEmissionCap_affectsCurrentDay() public {
        // Mint 90K
        vm.prank(owner);
        clawc.mint(alice, 90_000e18);

        // Reduce cap to 50K — can't mint any more today (already past 50K)
        vm.prank(owner);
        clawc.updateDailyEmissionCap(50_000e18);

        vm.prank(owner);
        vm.expectRevert();
        clawc.mint(alice, 1e18);
    }

    function test_updateDailyEmissionCap_increaseAllowsMore() public {
        // Mint full cap
        vm.prank(owner);
        clawc.mint(alice, 100_000e18);

        // Increase cap
        vm.prank(owner);
        clawc.updateDailyEmissionCap(200_000e18);

        // Can now mint more same day
        vm.prank(owner);
        clawc.mint(alice, 100_000e18);

        assertEq(clawc.mintedToday(), 200_000e18);
    }

    // ═══════════════════════════════════════════════
    // VIEW FUNCTION TESTS
    // ═══════════════════════════════════════════════

    function test_remainingDailyMint_fullCapAvailable() public view {
        assertEq(clawc.remainingDailyMint(), 100_000e18);
    }

    function test_remainingDailyMint_partiallyUsed() public {
        vm.prank(owner);
        clawc.mint(alice, 40_000e18);

        assertEq(clawc.remainingDailyMint(), 60_000e18);
    }

    function test_remainingDailyMint_fullyUsed() public {
        vm.prank(owner);
        clawc.mint(alice, 100_000e18);

        assertEq(clawc.remainingDailyMint(), 0);
    }

    function test_remainingDailyMint_newDayResets() public {
        vm.prank(owner);
        clawc.mint(alice, 100_000e18);

        vm.warp(block.timestamp + 1 days);
        assertEq(clawc.remainingDailyMint(), 100_000e18);
    }

    function test_remainingSupply_initial() public view {
        assertEq(clawc.remainingSupply(), 1_000_000_000e18);
    }

    function test_remainingSupply_afterMint() public {
        vm.prank(owner);
        clawc.mint(alice, 50_000e18);

        assertEq(clawc.remainingSupply(), 1_000_000_000e18 - 50_000e18);
    }

    function test_remainingSupply_afterBurn() public {
        vm.prank(owner);
        clawc.mint(alice, 50_000e18);

        vm.prank(alice);
        clawc.burn(20_000e18);

        // Burns reduce totalSupply, so remainingSupply increases
        assertEq(clawc.remainingSupply(), 1_000_000_000e18 - 30_000e18);
    }

    // ═══════════════════════════════════════════════
    // STANDARD ERC-20 TESTS
    // ═══════════════════════════════════════════════

    function test_transfer_success() public {
        vm.prank(owner);
        clawc.mint(alice, 1000e18);

        vm.prank(alice);
        clawc.transfer(bob, 400e18);

        assertEq(clawc.balanceOf(alice), 600e18);
        assertEq(clawc.balanceOf(bob), 400e18);
    }

    function test_approve_and_transferFrom() public {
        vm.prank(owner);
        clawc.mint(alice, 1000e18);

        vm.prank(alice);
        clawc.approve(bob, 500e18);

        vm.prank(bob);
        clawc.transferFrom(alice, bob, 300e18);

        assertEq(clawc.balanceOf(alice), 700e18);
        assertEq(clawc.balanceOf(bob), 300e18);
        assertEq(clawc.allowance(alice, bob), 200e18);
    }

    // ═══════════════════════════════════════════════
    // FUZZ TESTS
    // ═══════════════════════════════════════════════

    function testFuzz_mint_withinDailyCap(uint256 amount) public {
        amount = bound(amount, 1, 100_000e18);

        vm.prank(owner);
        clawc.mint(alice, amount);

        assertEq(clawc.balanceOf(alice), amount);
        assertEq(clawc.mintedToday(), amount);
    }

    function testFuzz_mint_revertAboveDailyCap(uint256 amount) public {
        amount = bound(amount, 100_001e18, 200_000e18);

        vm.prank(owner);
        vm.expectRevert();
        clawc.mint(alice, amount);
    }

    function testFuzz_updateDailyEmissionCap_validRange(uint256 newCap) public {
        newCap = bound(newCap, 10_000e18, 500_000e18);

        vm.prank(owner);
        clawc.updateDailyEmissionCap(newCap);

        assertEq(clawc.dailyEmissionCap(), newCap);
    }

    function testFuzz_burn_neverExceedsBalance(uint256 mintAmount, uint256 burnAmount) public {
        mintAmount = bound(mintAmount, 1, 100_000e18);
        burnAmount = bound(burnAmount, 0, mintAmount);

        vm.prank(owner);
        clawc.mint(alice, mintAmount);

        vm.prank(alice);
        clawc.burn(burnAmount);

        assertEq(clawc.balanceOf(alice), mintAmount - burnAmount);
    }

    function testFuzz_dailyReset_afterWarp(uint256 daysToSkip) public {
        daysToSkip = bound(daysToSkip, 1, 365);

        vm.prank(owner);
        clawc.mint(alice, 100_000e18);
        assertEq(clawc.mintedToday(), 100_000e18);

        vm.warp(block.timestamp + daysToSkip * 1 days);

        // remainingDailyMint should show full cap since we're on a new day
        assertEq(clawc.remainingDailyMint(), 100_000e18);

        // Minting should reset the counter
        vm.prank(owner);
        clawc.mint(alice, 1e18);
        assertEq(clawc.mintedToday(), 1e18);
    }
}
