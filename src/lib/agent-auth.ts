import { createSignerClient } from "@slicekit/erc8128";
import type { EthHttpSigner } from "@slicekit/erc8128";
import type { Address, Hex } from "viem";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "84532");

/**
 * Create an authenticated HTTP client for a ClawCoach agent.
 * The agent's Smart Wallet signs every outgoing request via ERC-8128.
 *
 * Usage (agent runtime):
 * ```ts
 * const client = createAgentHttpClient({
 *   address: agentWalletAddress,
 *   signMessage: wallet.signMessage,
 * });
 * const res = await client.fetch("https://clawcoach.ai/api/v1/workouts", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ workoutType: "strength", durationMinutes: 60, ... }),
 * });
 * ```
 */
export function createAgentHttpClient(agentWallet: {
  address: Address;
  signMessage: (message: Uint8Array) => Promise<Hex>;
}) {
  const signer: EthHttpSigner = {
    chainId: CHAIN_ID,
    address: agentWallet.address,
    signMessage: agentWallet.signMessage,
  };

  return createSignerClient(signer, {
    binding: "request-bound",
    replay: "non-replayable",
    ttlSeconds: 60,
    label: "clawcoach",
  });
}
