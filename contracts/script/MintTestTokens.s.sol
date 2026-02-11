// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ClawcToken} from "../src/ClawcToken.sol";

/// @title MintTestTokens — Mint $CLAWC to test wallets on Base Sepolia
/// @notice Usage: forge script script/MintTestTokens.s.sol --rpc-url base_sepolia --broadcast
contract MintTestTokens is Script {
    // Deployed ClawcToken address on Base Sepolia (will update after redeploy)
    address constant CLAWC_TOKEN = 0xf33c2C2879cfEDb467F70F74418F4Ce30e31B138;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        ClawcToken clawc = ClawcToken(CLAWC_TOKEN);

        console.log("ClawcToken:", CLAWC_TOKEN);
        console.log("Deployer:", deployer);
        console.log("Current supply:", clawc.totalSupply());
        console.log("Remaining daily mint:", clawc.remainingDailyMint());

        vm.startBroadcast(deployerKey);

        // Mint 10,000 CLAWC to deployer for testing
        uint256 mintAmount = 10_000e18;
        clawc.mint(deployer, mintAmount);
        console.log("Minted", mintAmount / 1e18, "CLAWC to deployer");

        // Add more addresses here as needed:
        // address testUser = 0x...;
        // clawc.mint(testUser, 1_000e18);

        vm.stopBroadcast();

        console.log("New total supply:", clawc.totalSupply());
        console.log("Deployer balance:", clawc.balanceOf(deployer));
    }
}
