// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FitToken} from "../src/FitToken.sol";

/// @title MintTestTokens — Mint $FIT to test wallets on Base Sepolia
/// @notice Usage: forge script script/MintTestTokens.s.sol --rpc-url base_sepolia --broadcast
contract MintTestTokens is Script {
    // Deployed FitToken address on Base Sepolia
    address constant FIT_TOKEN = 0xf33c2C2879cfEDb467F70F74418F4Ce30e31B138;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        FitToken fit = FitToken(FIT_TOKEN);

        console.log("FitToken:", FIT_TOKEN);
        console.log("Deployer:", deployer);
        console.log("Current supply:", fit.totalSupply());
        console.log("Remaining daily mint:", fit.remainingDailyMint());

        vm.startBroadcast(deployerKey);

        // Mint 10,000 FIT to deployer for testing
        uint256 mintAmount = 10_000e18;
        fit.mint(deployer, mintAmount);
        console.log("Minted", mintAmount / 1e18, "FIT to deployer");

        // Add more addresses here as needed:
        // address testUser = 0x...;
        // fit.mint(testUser, 1_000e18);

        vm.stopBroadcast();

        console.log("New total supply:", fit.totalSupply());
        console.log("Deployer balance:", fit.balanceOf(deployer));
    }
}
