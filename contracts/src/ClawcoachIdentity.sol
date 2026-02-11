// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title ClawcoachIdentity
/// @notice ERC-8004 compliant Identity Registry for ClawCoach AI coaching agents
/// @dev Extends ERC-721 with on-chain metadata, EIP-712 wallet verification, and
///      one-agent-per-wallet constraint. Each agent is an NFT with a URI pointing
///      to its registration file (personality, capabilities, services).
contract ClawcoachIdentity is ERC721URIStorage, EIP712 {
    // ──────────────────────────────────────────────
    // Structs
    // ──────────────────────────────────────────────

    /// @notice Key-value metadata entry for batch registration
    struct MetadataEntry {
        string metadataKey;
        bytes metadataValue;
    }

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    /// @notice Auto-incrementing agent ID counter (starts at 1, 0 = no agent)
    uint256 private _nextAgentId;

    /// @notice wallet address → agentId (enforces one agent per wallet)
    mapping(address => uint256) private _walletToAgent;

    /// @notice agentId → (metadataKey → metadataValue)
    mapping(uint256 => mapping(string => bytes)) private _metadata;

    /// @notice Reserved metadata key for agent wallet address
    string private constant AGENT_WALLET_KEY = "agentWallet";

    /// @notice EIP-712 typehash for SetAgentWallet
    bytes32 private constant SET_AGENT_WALLET_TYPEHASH =
        keccak256("SetAgentWallet(uint256 agentId,address newWallet,uint256 deadline)");

    // ──────────────────────────────────────────────
    // Events (ERC-8004)
    // ──────────────────────────────────────────────

    /// @notice Emitted when a new agent is registered
    /// @param agentId The ERC-721 tokenId assigned
    /// @param agentURI URI pointing to the agent's registration file
    /// @param owner The wallet address that owns this agent
    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);

    /// @notice Emitted when an agent's URI is updated
    /// @param agentId The agent being updated
    /// @param newURI The new URI value
    /// @param updatedBy The address that triggered the update
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);

    /// @notice Emitted when metadata is set for an agent
    /// @param agentId The agent being updated
    /// @param indexedMetadataKey Indexed version of key (for log filtering)
    /// @param metadataKey The actual metadata key string
    /// @param metadataValue The metadata value bytes
    event MetadataSet(
        uint256 indexed agentId,
        string indexed indexedMetadataKey,
        string metadataKey,
        bytes metadataValue
    );

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    /// @notice Wallet already has an agent registered
    error WalletAlreadyHasAgent(address wallet, uint256 existingAgentId);

    /// @notice Agent does not exist
    error AgentNotFound(uint256 agentId);

    /// @notice Caller is not authorized for this agent
    error NotAuthorized(address caller, uint256 agentId);

    /// @notice EIP-712 signature has expired
    error SignatureExpired(uint256 deadline);

    /// @notice EIP-712 signature is invalid
    error InvalidSignature(address expected, address recovered);

    /// @notice Cannot set reserved metadata key via setMetadata
    error ReservedMetadataKey(string key);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    constructor() ERC721("ClawCoach Agent", "CLAWCOACH") EIP712("ClawcoachIdentity", "1") {
        _nextAgentId = 1;
    }

    // ──────────────────────────────────────────────
    // ERC-8004 Registration (3 overloads)
    // ──────────────────────────────────────────────

    /// @notice Register a new agent with URI and metadata
    /// @param agentURI URI pointing to agent registration file (IPFS, HTTPS, etc.)
    /// @param metadata Array of key-value metadata entries to set on creation
    /// @return agentId The newly minted agent's ID
    function register(string memory agentURI, MetadataEntry[] memory metadata) public returns (uint256 agentId) {
        if (_walletToAgent[msg.sender] != 0) {
            revert WalletAlreadyHasAgent(msg.sender, _walletToAgent[msg.sender]);
        }

        agentId = _nextAgentId++;
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);

        _walletToAgent[msg.sender] = agentId;

        for (uint256 i = 0; i < metadata.length; i++) {
            _setMetadataInternal(agentId, metadata[i].metadataKey, metadata[i].metadataValue);
        }

        emit Registered(agentId, agentURI, msg.sender);
    }

    /// @notice Register a new agent with just a URI (no metadata)
    /// @param agentURI URI pointing to agent registration file
    /// @return agentId The newly minted agent's ID
    function register(string memory agentURI) public returns (uint256 agentId) {
        MetadataEntry[] memory empty = new MetadataEntry[](0);
        return register(agentURI, empty);
    }

    /// @notice Register a new agent with default empty URI
    /// @return agentId The newly minted agent's ID
    function register() external returns (uint256 agentId) {
        return register("");
    }

    // ──────────────────────────────────────────────
    // ERC-8004 URI Management
    // ──────────────────────────────────────────────

    /// @notice Update an agent's URI
    /// @param agentId The agent to update
    /// @param newURI The new URI value
    function setAgentURI(uint256 agentId, string calldata newURI) external {
        if (!isAuthorizedOrOwner(msg.sender, agentId)) {
            revert NotAuthorized(msg.sender, agentId);
        }
        _setTokenURI(agentId, newURI);
        emit URIUpdated(agentId, newURI, msg.sender);
    }

    // ──────────────────────────────────────────────
    // ERC-8004 Metadata Management
    // ──────────────────────────────────────────────

    /// @notice Get metadata value for an agent
    /// @param agentId The agent to query
    /// @param metadataKey The key to look up
    /// @return The stored bytes value (empty if not set)
    function getMetadata(uint256 agentId, string memory metadataKey) external view returns (bytes memory) {
        if (_ownerOf(agentId) == address(0)) {
            revert AgentNotFound(agentId);
        }
        return _metadata[agentId][metadataKey];
    }

    /// @notice Set metadata for an agent
    /// @param agentId The agent to update
    /// @param metadataKey The key to set
    /// @param metadataValue The value to store
    /// @dev Cannot set reserved "agentWallet" key — use setAgentWallet instead
    function setMetadata(uint256 agentId, string memory metadataKey, bytes memory metadataValue) external {
        if (!isAuthorizedOrOwner(msg.sender, agentId)) {
            revert NotAuthorized(msg.sender, agentId);
        }
        if (keccak256(bytes(metadataKey)) == keccak256(bytes(AGENT_WALLET_KEY))) {
            revert ReservedMetadataKey(metadataKey);
        }
        _setMetadataInternal(agentId, metadataKey, metadataValue);
    }

    // ──────────────────────────────────────────────
    // ERC-8004 Wallet Management (EIP-712)
    // ──────────────────────────────────────────────

    /// @notice Set agent's payment wallet with EIP-712 signature verification
    /// @param agentId The agent to update
    /// @param newWallet The wallet address to set as payment recipient
    /// @param deadline Unix timestamp after which the signature expires
    /// @param signature EIP-712 signature from newWallet proving consent
    function setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes calldata signature) external {
        if (!isAuthorizedOrOwner(msg.sender, agentId)) {
            revert NotAuthorized(msg.sender, agentId);
        }
        if (block.timestamp > deadline) {
            revert SignatureExpired(deadline);
        }

        bytes32 structHash = keccak256(abi.encode(SET_AGENT_WALLET_TYPEHASH, agentId, newWallet, deadline));
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(digest, signature);

        if (recovered != newWallet) {
            revert InvalidSignature(newWallet, recovered);
        }

        _metadata[agentId][AGENT_WALLET_KEY] = abi.encode(newWallet);
        emit MetadataSet(agentId, AGENT_WALLET_KEY, AGENT_WALLET_KEY, abi.encode(newWallet));
    }

    /// @notice Get the payment wallet for an agent
    /// @param agentId The agent to query
    /// @return The wallet address (address(0) if not set)
    function getAgentWallet(uint256 agentId) external view returns (address) {
        bytes memory walletBytes = _metadata[agentId][AGENT_WALLET_KEY];
        if (walletBytes.length == 0) {
            return address(0);
        }
        return abi.decode(walletBytes, (address));
    }

    /// @notice Clear agent's payment wallet
    /// @param agentId The agent to update
    function unsetAgentWallet(uint256 agentId) external {
        if (!isAuthorizedOrOwner(msg.sender, agentId)) {
            revert NotAuthorized(msg.sender, agentId);
        }
        delete _metadata[agentId][AGENT_WALLET_KEY];
        emit MetadataSet(agentId, AGENT_WALLET_KEY, AGENT_WALLET_KEY, "");
    }

    // ──────────────────────────────────────────────
    // Authorization
    // ──────────────────────────────────────────────

    /// @notice Check if an address is authorized for an agent (owner or approved)
    /// @param spender The address to check
    /// @param agentId The agent to check against
    /// @return True if spender is owner, approved for token, or approved for all
    function isAuthorizedOrOwner(address spender, uint256 agentId) public view returns (bool) {
        address owner = _ownerOf(agentId);
        if (owner == address(0)) return false;
        return spender == owner || isApprovedForAll(owner, spender) || getApproved(agentId) == spender;
    }

    // ──────────────────────────────────────────────
    // ClawCoach Convenience Functions
    // ──────────────────────────────────────────────

    /// @notice Get agent ID for a wallet address
    /// @param owner The wallet address to look up
    /// @return The agent ID (0 if wallet has no agent)
    function getAgent(address owner) external view returns (uint256) {
        return _walletToAgent[owner];
    }

    /// @notice Check if a wallet has a registered agent
    /// @param owner The wallet address to check
    /// @return True if wallet owns an agent
    function hasAgent(address owner) external view returns (bool) {
        return _walletToAgent[owner] != 0;
    }

    // ──────────────────────────────────────────────
    // Internal
    // ──────────────────────────────────────────────

    /// @dev Store metadata and emit event
    function _setMetadataInternal(uint256 agentId, string memory metadataKey, bytes memory metadataValue) internal {
        _metadata[agentId][metadataKey] = metadataValue;
        emit MetadataSet(agentId, metadataKey, metadataKey, metadataValue);
    }

    /// @dev Override _update to clear agentWallet and update walletToAgent on transfer
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != address(0) && to != address(0)) {
            // Transfer: clear wallet and update mapping
            delete _metadata[tokenId][AGENT_WALLET_KEY];
            delete _walletToAgent[from];
            _walletToAgent[to] = tokenId;
        } else if (from == address(0) && to != address(0)) {
            // Mint: mapping already set in register()
        } else if (from != address(0) && to == address(0)) {
            // Burn: clear mapping
            delete _walletToAgent[from];
        }

        return from;
    }

    /// @dev Override required by ERC721URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /// @dev Override supportsInterface for ERC-165
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
