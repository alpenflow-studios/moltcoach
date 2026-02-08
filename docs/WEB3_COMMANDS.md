# WEB3_COMMANDS.md — CLI Reference

---

## Foundry (forge, cast, anvil)

### forge — Build, Test, Deploy

```bash
# Build
forge build                              # Compile all contracts
forge build --sizes                      # Show contract sizes

# Test
forge test                               # Run all tests
forge test -vvvv                         # Max verbosity
forge test --match-test testStake        # Run specific test
forge test --gas-report                  # Show gas usage

# Coverage
forge coverage                           # Line/branch coverage

# Gas Snapshots
forge snapshot                           # Create .gas-snapshot
forge snapshot --check                   # Compare (CI)

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC \
  --broadcast \
  --verify \
  -vvvv
```

### cast — Read/Write Chain

```bash
# Read
cast call [ADDR] "balanceOf(address)" [WALLET]
cast call [ADDR] "totalSupply()(uint256)"

# Conversions
cast to-wei 1.5 ether
cast from-wei 1500000000000000000

# Chain info
cast chain-id --rpc-url $BASE_RPC
cast block-number --rpc-url $BASE_RPC
cast gas-price --rpc-url $BASE_RPC
cast balance [ADDR] --rpc-url $BASE_RPC

# Send tx
cast send [ADDR] "transfer(address,uint256)" [TO] [AMT] \
  --rpc-url $BASE_RPC \
  --private-key $KEY
```

### anvil — Local Chain

```bash
anvil                                    # Start local chain
anvil --fork-url $BASE_RPC              # Fork Base mainnet
anvil --chain-id 8453                   # Match Base chain ID
```

---

## Base Networks

```
# Base Mainnet
RPC: https://mainnet.base.org
Chain ID: 8453
Explorer: https://basescan.org

# Base Sepolia
RPC: https://sepolia.base.org
Chain ID: 84532
Explorer: https://sepolia.basescan.org
```

---

## Useful Aliases

```bash
# Add to ~/.zshrc
alias fb="forge build"
alias ft="forge test"
alias ftv="forge test -vvvv"
alias fs="forge snapshot"
alias cb="cast balance"
alias cc="cast call"
alias dev="pnpm dev"
alias tc="pnpm typecheck"
```
