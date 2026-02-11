// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ClawcoachIdentity} from "../src/ClawcoachIdentity.sol";

contract ClawcoachIdentityTest is Test {
    ClawcoachIdentity public identity;

    // Test accounts (with known private keys for EIP-712 signing)
    uint256 internal constant ALICE_PK = 0xa11ce;
    uint256 internal constant BOB_PK = 0xb0b;
    uint256 internal constant CHARLIE_PK = 0xca1e;
    address internal alice;
    address internal bob;
    address internal charlie;

    // Re-declare events for expectEmit
    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);
    event MetadataSet(
        uint256 indexed agentId,
        string indexed indexedMetadataKey,
        string metadataKey,
        bytes metadataValue
    );

    // EIP-712 constants (must match contract)
    bytes32 private constant SET_AGENT_WALLET_TYPEHASH =
        keccak256("SetAgentWallet(uint256 agentId,address newWallet,uint256 deadline)");

    function setUp() public {
        identity = new ClawcoachIdentity();
        alice = vm.addr(ALICE_PK);
        bob = vm.addr(BOB_PK);
        charlie = vm.addr(CHARLIE_PK);
    }

    // ═══════════════════════════════════════════════
    // REGISTRATION TESTS
    // ═══════════════════════════════════════════════

    function test_register_withURIAndMetadata() public {
        ClawcoachIdentity.MetadataEntry[] memory meta = new ClawcoachIdentity.MetadataEntry[](2);
        meta[0] = ClawcoachIdentity.MetadataEntry("personality", abi.encode("motivational"));
        meta[1] = ClawcoachIdentity.MetadataEntry("heartbeat", abi.encode("daily"));

        vm.expectEmit(true, true, false, true);
        emit Registered(1, "ipfs://QmTest", alice);

        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://QmTest", meta);

        assertEq(agentId, 1);
        assertEq(identity.ownerOf(agentId), alice);
        assertEq(identity.tokenURI(agentId), "ipfs://QmTest");
        assertEq(identity.getAgent(alice), 1);
        assertTrue(identity.hasAgent(alice));
        assertEq(abi.decode(identity.getMetadata(agentId, "personality"), (string)), "motivational");
        assertEq(abi.decode(identity.getMetadata(agentId, "heartbeat"), (string)), "daily");
    }

    function test_register_withURIOnly() public {
        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://QmAlice");

        assertEq(agentId, 1);
        assertEq(identity.tokenURI(agentId), "ipfs://QmAlice");
        assertEq(identity.getAgent(alice), 1);
    }

    function test_register_noParams() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        assertEq(agentId, 1);
        assertEq(identity.tokenURI(agentId), "");
        assertEq(identity.getAgent(alice), 1);
    }

    function test_register_incrementsIds() public {
        vm.prank(alice);
        uint256 id1 = identity.register("ipfs://1");

        vm.prank(bob);
        uint256 id2 = identity.register("ipfs://2");

        vm.prank(charlie);
        uint256 id3 = identity.register("ipfs://3");

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
    }

    function test_register_revertIfWalletAlreadyHasAgent() public {
        vm.prank(alice);
        identity.register("ipfs://first");

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.WalletAlreadyHasAgent.selector, alice, 1));
        identity.register("ipfs://second");
    }

    function test_register_emptyMetadataArray() public {
        ClawcoachIdentity.MetadataEntry[] memory empty = new ClawcoachIdentity.MetadataEntry[](0);

        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://QmTest", empty);

        assertEq(agentId, 1);
        assertEq(identity.getMetadata(agentId, "personality").length, 0);
    }

    // ═══════════════════════════════════════════════
    // URI MANAGEMENT TESTS
    // ═══════════════════════════════════════════════

    function test_setAgentURI_byOwner() public {
        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://old");

        vm.expectEmit(true, true, false, true);
        emit URIUpdated(agentId, "ipfs://new", alice);

        vm.prank(alice);
        identity.setAgentURI(agentId, "ipfs://new");

        assertEq(identity.tokenURI(agentId), "ipfs://new");
    }

    function test_setAgentURI_revertIfNotOwner() public {
        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://test");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.NotAuthorized.selector, bob, agentId));
        identity.setAgentURI(agentId, "ipfs://hacked");
    }

    function test_setAgentURI_byApprovedOperator() public {
        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://old");

        vm.prank(alice);
        identity.setApprovalForAll(bob, true);

        vm.prank(bob);
        identity.setAgentURI(agentId, "ipfs://updated-by-bob");

        assertEq(identity.tokenURI(agentId), "ipfs://updated-by-bob");
    }

    function test_setAgentURI_byApprovedToken() public {
        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://old");

        vm.prank(alice);
        identity.approve(bob, agentId);

        vm.prank(bob);
        identity.setAgentURI(agentId, "ipfs://approved");

        assertEq(identity.tokenURI(agentId), "ipfs://approved");
    }

    // ═══════════════════════════════════════════════
    // METADATA TESTS
    // ═══════════════════════════════════════════════

    function test_setMetadata_success() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.expectEmit(true, false, false, true);
        emit MetadataSet(agentId, "skillLevel", "skillLevel", abi.encode("advanced"));

        vm.prank(alice);
        identity.setMetadata(agentId, "skillLevel", abi.encode("advanced"));

        assertEq(abi.decode(identity.getMetadata(agentId, "skillLevel"), (string)), "advanced");
    }

    function test_setMetadata_revertIfNotOwner() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.NotAuthorized.selector, bob, agentId));
        identity.setMetadata(agentId, "key", "value");
    }

    function test_setMetadata_revertIfReservedKey() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.ReservedMetadataKey.selector, "agentWallet"));
        identity.setMetadata(agentId, "agentWallet", abi.encode(bob));
    }

    function test_setMetadata_overwriteExisting() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.prank(alice);
        identity.setMetadata(agentId, "color", abi.encode("red"));

        vm.prank(alice);
        identity.setMetadata(agentId, "color", abi.encode("blue"));

        assertEq(abi.decode(identity.getMetadata(agentId, "color"), (string)), "blue");
    }

    function test_getMetadata_revertIfAgentNotFound() public {
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.AgentNotFound.selector, 999));
        identity.getMetadata(999, "key");
    }

    function test_getMetadata_returnsEmptyForUnsetKey() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        bytes memory value = identity.getMetadata(agentId, "nonexistent");
        assertEq(value.length, 0);
    }

    // ═══════════════════════════════════════════════
    // WALLET MANAGEMENT TESTS (EIP-712)
    // ═══════════════════════════════════════════════

    function _signSetAgentWallet(uint256 signerPk, uint256 agentId, address newWallet, uint256 deadline)
        internal
        view
        returns (bytes memory)
    {
        bytes32 structHash = keccak256(abi.encode(SET_AGENT_WALLET_TYPEHASH, agentId, newWallet, deadline));
        bytes32 digest = _computeDigest(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }

    function _computeDigest(bytes32 structHash) internal view returns (bytes32) {
        // Reconstruct the EIP-712 domain separator to match the contract
        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("ClawcoachIdentity"),
                keccak256("1"),
                block.chainid,
                address(identity)
            )
        );
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }

    function test_setAgentWallet_validSignature() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signSetAgentWallet(BOB_PK, agentId, bob, deadline);

        vm.prank(alice);
        identity.setAgentWallet(agentId, bob, deadline, sig);

        assertEq(identity.getAgentWallet(agentId), bob);
    }

    function test_setAgentWallet_revertIfExpired() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        uint256 deadline = block.timestamp - 1; // already expired
        bytes memory sig = _signSetAgentWallet(BOB_PK, agentId, bob, deadline);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.SignatureExpired.selector, deadline));
        identity.setAgentWallet(agentId, bob, deadline, sig);
    }

    function test_setAgentWallet_revertIfWrongSigner() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        uint256 deadline = block.timestamp + 1 hours;
        // Charlie signs instead of bob
        bytes memory sig = _signSetAgentWallet(CHARLIE_PK, agentId, bob, deadline);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.InvalidSignature.selector, bob, charlie));
        identity.setAgentWallet(agentId, bob, deadline, sig);
    }

    function test_setAgentWallet_revertIfNotOwner() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signSetAgentWallet(BOB_PK, agentId, bob, deadline);

        vm.prank(bob); // bob is not the agent owner
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.NotAuthorized.selector, bob, agentId));
        identity.setAgentWallet(agentId, bob, deadline, sig);
    }

    function test_getAgentWallet_returnsZeroIfNotSet() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        assertEq(identity.getAgentWallet(agentId), address(0));
    }

    function test_unsetAgentWallet_success() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        // Set wallet first
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signSetAgentWallet(BOB_PK, agentId, bob, deadline);
        vm.prank(alice);
        identity.setAgentWallet(agentId, bob, deadline, sig);
        assertEq(identity.getAgentWallet(agentId), bob);

        // Unset
        vm.prank(alice);
        identity.unsetAgentWallet(agentId);
        assertEq(identity.getAgentWallet(agentId), address(0));
    }

    function test_unsetAgentWallet_revertIfNotOwner() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(ClawcoachIdentity.NotAuthorized.selector, bob, agentId));
        identity.unsetAgentWallet(agentId);
    }

    // ═══════════════════════════════════════════════
    // AUTHORIZATION TESTS
    // ═══════════════════════════════════════════════

    function test_isAuthorizedOrOwner_owner() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        assertTrue(identity.isAuthorizedOrOwner(alice, agentId));
    }

    function test_isAuthorizedOrOwner_approvedForAll() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.prank(alice);
        identity.setApprovalForAll(bob, true);

        assertTrue(identity.isAuthorizedOrOwner(bob, agentId));
    }

    function test_isAuthorizedOrOwner_approvedForToken() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.prank(alice);
        identity.approve(bob, agentId);

        assertTrue(identity.isAuthorizedOrOwner(bob, agentId));
    }

    function test_isAuthorizedOrOwner_unauthorized() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        assertFalse(identity.isAuthorizedOrOwner(bob, agentId));
    }

    function test_isAuthorizedOrOwner_nonexistentAgent() public view {
        assertFalse(identity.isAuthorizedOrOwner(alice, 999));
    }

    // ═══════════════════════════════════════════════
    // TRANSFER TESTS
    // ═══════════════════════════════════════════════

    function test_transfer_updatesWalletMapping() public {
        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://test");

        vm.prank(alice);
        identity.transferFrom(alice, bob, agentId);

        assertEq(identity.getAgent(alice), 0);
        assertEq(identity.getAgent(bob), agentId);
        assertFalse(identity.hasAgent(alice));
        assertTrue(identity.hasAgent(bob));
    }

    function test_transfer_clearsAgentWallet() public {
        vm.prank(alice);
        uint256 agentId = identity.register();

        // Set wallet
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _signSetAgentWallet(CHARLIE_PK, agentId, charlie, deadline);
        vm.prank(alice);
        identity.setAgentWallet(agentId, charlie, deadline, sig);
        assertEq(identity.getAgentWallet(agentId), charlie);

        // Transfer
        vm.prank(alice);
        identity.transferFrom(alice, bob, agentId);

        // Wallet should be cleared
        assertEq(identity.getAgentWallet(agentId), address(0));
    }

    function test_transfer_previousOwnerCanRegisterNewAgent() public {
        vm.prank(alice);
        uint256 agentId = identity.register("ipfs://first");

        vm.prank(alice);
        identity.transferFrom(alice, bob, agentId);

        // Alice can register a new agent
        vm.prank(alice);
        uint256 newId = identity.register("ipfs://second");

        assertEq(newId, 2);
        assertEq(identity.getAgent(alice), 2);
    }

    function test_transfer_recipientWithAgentCanReceive() public {
        // Bob already has an agent
        vm.prank(bob);
        identity.register("ipfs://bob");

        vm.prank(alice);
        uint256 aliceAgent = identity.register("ipfs://alice");

        // Transfer alice's agent to bob — this will overwrite bob's walletToAgent mapping
        // The ERC-721 transfer itself works, but bob's getAgent will now return alice's agent
        vm.prank(alice);
        identity.transferFrom(alice, bob, aliceAgent);

        // Bob now has alice's agent mapped
        assertEq(identity.getAgent(bob), aliceAgent);
        assertEq(identity.ownerOf(1), bob); // bob's original agent
        assertEq(identity.ownerOf(2), bob); // alice's transferred agent
    }

    // ═══════════════════════════════════════════════
    // CONVENIENCE FUNCTION TESTS
    // ═══════════════════════════════════════════════

    function test_getAgent_noAgent() public view {
        assertEq(identity.getAgent(alice), 0);
    }

    function test_hasAgent_noAgent() public view {
        assertFalse(identity.hasAgent(alice));
    }

    function test_hasAgent_withAgent() public {
        vm.prank(alice);
        identity.register();
        assertTrue(identity.hasAgent(alice));
    }

    // ═══════════════════════════════════════════════
    // ERC-721 INTERFACE TESTS
    // ═══════════════════════════════════════════════

    function test_name() public view {
        assertEq(identity.name(), "ClawCoach Agent");
    }

    function test_symbol() public view {
        assertEq(identity.symbol(), "CLAWCOACH");
    }

    function test_supportsInterface_ERC721() public view {
        // ERC-721 interface ID
        assertTrue(identity.supportsInterface(0x80ac58cd));
    }

    function test_supportsInterface_ERC721Metadata() public view {
        // ERC-721 Metadata interface ID
        assertTrue(identity.supportsInterface(0x5b5e139f));
    }

    function test_supportsInterface_ERC165() public view {
        // ERC-165 interface ID
        assertTrue(identity.supportsInterface(0x01ffc9a7));
    }

    // ═══════════════════════════════════════════════
    // FUZZ TESTS
    // ═══════════════════════════════════════════════

    function testFuzz_register_uniqueURIs(string calldata uri) public {
        vm.prank(alice);
        uint256 agentId = identity.register(uri);
        assertEq(identity.tokenURI(agentId), uri);
    }

    function testFuzz_setMetadata_arbitraryValues(string calldata key, bytes calldata value) public {
        // Skip reserved key
        vm.assume(keccak256(bytes(key)) != keccak256("agentWallet"));

        vm.prank(alice);
        uint256 agentId = identity.register();

        vm.prank(alice);
        identity.setMetadata(agentId, key, value);

        assertEq(identity.getMetadata(agentId, key), value);
    }

    function testFuzz_register_differentUsers(uint256 pkSeed) public {
        // Bound private key to valid range (1 to secp256k1 order - 1)
        uint256 pk = bound(pkSeed, 1, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140);
        address user = vm.addr(pk);

        vm.prank(user);
        uint256 agentId = identity.register("ipfs://fuzz");

        assertEq(identity.ownerOf(agentId), user);
        assertEq(identity.getAgent(user), agentId);
    }
}
