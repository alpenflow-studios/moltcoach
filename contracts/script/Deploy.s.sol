// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MoltcoachIdentity} from "../src/MoltcoachIdentity.sol";

/// @notice Deploy MoltcoachIdentity to Base Sepolia or Base Mainnet
/// @dev Usage: forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
contract DeployScript is Script {
    function run() external returns (MoltcoachIdentity) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        MoltcoachIdentity identity = new MoltcoachIdentity();

        console.log("MoltcoachIdentity deployed at:", address(identity));
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        vm.stopBroadcast();

        return identity;
    }
}
