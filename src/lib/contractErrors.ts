/** Parse viem/wagmi contract errors into user-friendly messages */
export function parseContractError(error: Error): string {
  const msg = error.message;

  // User rejected in wallet
  if (msg.includes("User rejected") || msg.includes("user rejected")) {
    return "Transaction was rejected in your wallet.";
  }

  // Chain mismatch — wallet on wrong network
  if (
    msg.includes("chain") &&
    (msg.includes("mismatch") || msg.includes("not configured"))
  ) {
    return "Your wallet is on the wrong network. Please switch to Base Sepolia.";
  }

  // Insufficient funds for gas
  if (
    msg.includes("insufficient funds") ||
    msg.includes("exceeds the balance")
  ) {
    return "Not enough ETH for gas. Get Base Sepolia ETH from a faucet.";
  }

  // Contract-specific: wallet already has agent
  if (msg.includes("WalletAlreadyHasAgent")) {
    return "This wallet already has an agent registered.";
  }

  // RPC / network errors
  if (
    msg.includes("could not coalesce") ||
    msg.includes("TIMEOUT") ||
    msg.includes("fetch failed") ||
    msg.includes("network")
  ) {
    return "Network error — the RPC may be temporarily unavailable. Try again.";
  }

  // Contract call revert (generic)
  if (msg.includes("reverted")) {
    return "Transaction would fail on-chain. The contract reverted the call.";
  }

  // Fallback: first line, cleaned up
  const firstLine = msg.split("\n")[0] ?? "Unknown error";
  // Strip viem error class prefixes
  const cleaned = firstLine
    .replace(/^ContractFunctionExecutionError:\s*/, "")
    .replace(/^ContractFunctionRevertedError:\s*/, "")
    .replace(/^EstimateGasExecutionError:\s*/, "");
  return cleaned || "Unknown error";
}
