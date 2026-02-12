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
│   ├── ClawcoachIdentity.sol    # ERC-8004 agent identity (ERC-721)
│   ├── ClawcToken.sol            # $CLAWC ERC-20 token
│   ├── ClawcStaking.sol          # $CLAWC staking contract
│   └── fees/
│       └── ProtocolFeeCollector.sol
├── test/
│   ├── ClawcoachIdentity.t.sol
│   ├── ClawcToken.t.sol
│   ├── ClawcStaking.t.sol
│   └── ProtocolFeeCollector.t.sol
├── script/
│   ├── Deploy.s.sol
│   └── MintTestTokens.s.sol
├── foundry.toml
└── remappings.txt
```

---

## Contract Specs

### ClawcoachIdentity.sol
- **Standard**: ERC-8004 Identity Registry (extends ERC-721 + URIStorage)
- **Purpose**: On-chain identity for each ClawCoach agent
- **Key functions**:
  - `createAgent(string agentURI)` — Mint new agent to msg.sender (1 per wallet)
  - `updateAgentURI(uint256 agentId, string newURI)` — Update agent registration file
  - `getAgent(address owner)` — Look up agent by wallet
- **Access control**: Only token owner can update their agent's URI
- **Events**: `AgentCreated(address owner, uint256 agentId, string agentURI)`

### ClawcToken.sol
- **Standard**: ERC-20 (OpenZeppelin)
- **Purpose**: Platform staking & governance token
- **Key functions**:
  - `mint(address to, uint256 amount)` — Owner-only minting for rewards
  - `burn(uint256 amount)` — Token holders can burn
- **Access control**: Ownable (reward minting restricted)
- **Supply**: TBD (tokenomics not finalized)

### ClawcStaking.sol
- **Purpose**: Stake $CLAWC for enhanced coaching features
- **Key functions**:
  - `stake(uint256 amount)` — Stake $CLAWC tokens
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

## Deployed Addresses (Base Sepolia — 84532)

> Deployed Session 23, Feb 11 2026. All verified on BaseScan.

| Contract | Address |
|----------|---------|
| ClawcToken ($CLAWC) | [`0x275534e19e025058d02a7837350ffaD6Ba136b7c`](https://sepolia.basescan.org/address/0x275534e19e025058d02a7837350ffaD6Ba136b7c) |
| ProtocolFeeCollector | [`0x9233CC1Ab2ca19F7a240AD9238cBcf59516Def55`](https://sepolia.basescan.org/address/0x9233CC1Ab2ca19F7a240AD9238cBcf59516Def55) |
| ClawcStaking | [`0x6B2D2f674373466F0C490E26a1DE00FF7F63BFad`](https://sepolia.basescan.org/address/0x6B2D2f674373466F0C490E26a1DE00FF7F63BFad) |
| ClawcoachIdentity (ERC-8004) | [`0xB95fab07C7750C50583eDe6CE751cc753811116c`](https://sepolia.basescan.org/address/0xB95fab07C7750C50583eDe6CE751cc753811116c) |
| USDC (testnet) | [`0x036CbD53842c5426634e7929541eC2318f3dCF7e`](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e) |

**Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`

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
