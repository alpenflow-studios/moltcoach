import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  CLAWCOACH_IDENTITY_ADDRESS,
  clawcoachIdentityAbi,
} from "@/config/contracts";
import { initVerifier } from "@/lib/verify-agent";
import type { Address } from "viem";

type AgentAuthSuccess = {
  authenticated: true;
  agentId: bigint;
  address: Address;
  chainId: number;
  binding: "request-bound" | "class-bound";
  replayable: boolean;
};

type AgentAuthFailure = {
  authenticated: false;
  reason: string;
};

type AgentAuthResult = AgentAuthSuccess | AgentAuthFailure;

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

/**
 * Verify that an incoming request is from a registered ClawCoach agent.
 *
 * 1. Verify ERC-8128 cryptographic signature
 * 2. Check signer address against ERC-8004 identity registry on-chain
 */
export async function verifyAgentRequest(
  request: Request,
): Promise<AgentAuthResult> {
  const verifier = await initVerifier();

  if (!verifier) {
    return { authenticated: false, reason: "verifier-unavailable" };
  }

  const result = await verifier.verifyRequest(request);

  if (!result.ok) {
    return { authenticated: false, reason: result.reason };
  }

  // Check the signing address against the on-chain ERC-8004 agent registry
  const agentId = (await publicClient.readContract({
    address: CLAWCOACH_IDENTITY_ADDRESS,
    abi: clawcoachIdentityAbi,
    functionName: "getAgent",
    args: [result.address],
  })) as bigint;

  if (agentId === 0n) {
    return { authenticated: false, reason: "unknown-agent" };
  }

  return {
    authenticated: true,
    agentId,
    address: result.address,
    chainId: result.chainId,
    binding: result.binding,
    replayable: result.replayable,
  };
}

export type { AgentAuthResult, AgentAuthSuccess, AgentAuthFailure };
