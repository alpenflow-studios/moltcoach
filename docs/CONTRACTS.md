# CONTRACTS.md — Smart Contract Specifications

> **Chain**: Base (chainId 8453)
> **Framework**: Foundry
> **Solidity**: ^0.8.20
> **Libraries**: OpenZeppelin 5.x
> **Standard**: ERC-8004 (Trustless Agents)

---

## Directory Structure

```
contracts/
├── src/
│   ├── MoltcoachIdentity.sol    # ERC-8004 agent identity (ERC-721)
│   ├── FitToken.sol              # $FIT ERC-20 token
│   └── FitStaking.sol            # $FIT staking contract
├── test/
│   ├── MoltcoachIdentity.t.sol
│   ├── FitToken.t.sol
│   └── FitStaking.t.sol
├── script/
│   └── Deploy.s.sol
├── foundry.toml
└── remappings.txt
```

---

## Contract Specs

### MoltcoachIdentity.sol
- **Standard**: ERC-8004 Identity Registry (extends ERC-721 + URIStorage)
- **Purpose**: On-chain identity for each ClawCoach agent
- **Key functions**:
  - `createAgent(string agentURI)` — Mint new agent to msg.sender (1 per wallet)
  - `updateAgentURI(uint256 agentId, string newURI)` — Update agent registration file
  - `getAgent(address owner)` — Look up agent by wallet
- **Access control**: Only token owner can update their agent's URI
- **Events**: `AgentCreated(address owner, uint256 agentId, string agentURI)`

### FitToken.sol
- **Standard**: ERC-20 (OpenZeppelin)
- **Purpose**: Move-to-earn reward token
- **Key functions**:
  - `mint(address to, uint256 amount)` — Owner-only minting for rewards
  - `burn(uint256 amount)` — Token holders can burn
- **Access control**: Ownable (reward minting restricted)
- **Supply**: TBD (tokenomics not finalized)

### FitStaking.sol
- **Purpose**: Stake $FIT for enhanced coaching features
- **Key functions**:
  - `stake(uint256 amount)` — Stake $FIT tokens
  - `unstake(uint256 amount)` — Withdraw staked tokens
  - `getStake(address user)` — View staked balance
- **Security**: ReentrancyGuard on stake/unstake

---

## Deploy Commands

```bash
# Testnet (Base Sepolia)
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_KEY \
  -vvvv

# Mainnet
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_KEY \
  -vvvv
```

---

## Security Checklist

### Pre-Testnet
- [ ] All tests passing (`forge test -vvvv`)
- [ ] Coverage > 90% (`forge coverage`)
- [ ] Slither clean
- [ ] No `tx.origin` usage
- [ ] All state changes emit events
- [ ] ReentrancyGuard on value-transfer functions

### Pre-Mainnet
- [ ] All of the above
- [ ] Testnet tested for 2+ weeks
- [ ] External audit or peer review
- [ ] Admin keys secured (hardware wallet or multi-sig)
