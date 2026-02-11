import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  CLAWCOACH_IDENTITY_ADDRESS,
  clawcoachIdentityAbi,
} from "@/config/contracts";
import { parseAgentURI } from "@/lib/agentURI";
import { verifyAgentRequest } from "@/middleware/agent-auth";
import { NextResponse } from "next/server";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function POST(request: Request): Promise<Response> {
  const auth = await verifyAgentRequest(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { error: "Unauthorized", reason: auth.reason },
      { status: 401 },
    );
  }

  // Fetch the agent's current URI from chain
  let agentURI = "";
  try {
    agentURI = (await publicClient.readContract({
      address: CLAWCOACH_IDENTITY_ADDRESS,
      abi: clawcoachIdentityAbi,
      functionName: "tokenURI",
      args: [auth.agentId],
    })) as string;
  } catch {
    // Token URI may not be available
  }

  const parsed = parseAgentURI(agentURI);

  return NextResponse.json({
    agentId: auth.agentId.toString(),
    address: auth.address,
    chainId: auth.chainId,
    name: parsed?.name ?? null,
    style: parsed?.style ?? null,
    category: parsed?.category ?? null,
    agentURI,
    verified: true,
  });
}
