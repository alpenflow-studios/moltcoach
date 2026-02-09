// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FitToken} from "../src/FitToken.sol";
import {ProtocolFeeCollector} from "../src/fees/ProtocolFeeCollector.sol";
import {FitStaking} from "../src/FitStaking.sol";
import {MoltcoachIdentity} from "../src/MoltcoachIdentity.sol";

/// @notice Deploy all moltcoach contracts to Base Sepolia or Base Mainnet
/// @dev Deploy order: FitToken → ProtocolFeeCollector → FitStaking → MoltcoachIdentity
///
/// Required env vars:
///   PRIVATE_KEY          — Deployer private key
///
/// Optional env vars (default to deployer address):
///   DEVELOPMENT_WALLET   — Treasury: development fund (40%)
///   BUYBACK_WALLET       — Treasury: buyback & burn fund (30%)
///   COMMUNITY_WALLET     — Treasury: community rewards fund (20%)
///   INSURANCE_WALLET     — Treasury: insurance fund (10%)
///
/// Usage:
///   forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
contract DeployScript is Script {
    /// @dev Base Sepolia USDC (Circle official testnet token)
    address constant BASE_SEPOLIA_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    /// @dev Base Mainnet USDC (Circle official)
    address constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function run()
        external
        returns (FitToken fitToken, ProtocolFeeCollector feeCollector, FitStaking staking, MoltcoachIdentity identity)
    {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Select USDC address based on chain
        address usdc = _getUsdcAddress();

        // Treasury wallets — default to deployer for testnet convenience
        address devWallet = vm.envOr("DEVELOPMENT_WALLET", deployer);
        address buybackWallet = vm.envOr("BUYBACK_WALLET", deployer);
        address communityWallet = vm.envOr("COMMUNITY_WALLET", deployer);
        address insuranceWallet = vm.envOr("INSURANCE_WALLET", deployer);

        console.log("=== moltcoach Deploy ===");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("USDC:", usdc);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. FitToken — $FIT ERC-20
        fitToken = new FitToken(deployer);
        console.log("1. FitToken deployed at:", address(fitToken));

        // 2. ProtocolFeeCollector — fee routing + treasury distribution
        feeCollector = new ProtocolFeeCollector(
            address(fitToken), usdc, deployer, devWallet, buybackWallet, communityWallet, insuranceWallet
        );
        console.log("2. ProtocolFeeCollector deployed at:", address(feeCollector));

        // 3. FitStaking — $FIT utility staking with tiers
        staking = new FitStaking(address(fitToken), address(feeCollector), deployer);
        console.log("3. FitStaking deployed at:", address(staking));

        // 4. MoltcoachIdentity — ERC-8004 agent identity
        identity = new MoltcoachIdentity();
        console.log("4. MoltcoachIdentity deployed at:", address(identity));

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deploy Complete ===");
    }

    function _getUsdcAddress() internal view returns (address) {
        if (block.chainid == 84532) {
            return BASE_SEPOLIA_USDC;
        } else if (block.chainid == 8453) {
            return BASE_MAINNET_USDC;
        } else {
            revert("Unsupported chain - set USDC address manually");
        }
    }
}
