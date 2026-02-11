import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  CLAWCOACH_IDENTITY_ADDRESS,
  clawcoachIdentityAbi,
} from "@/config/contracts";
import { parseAgentURI } from "@/lib/agentURI";
import { NextResponse } from "next/server";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function GET(): Promise<Response> {
  try {
    const logs = await publicClient.getContractEvents({
      address: CLAWCOACH_IDENTITY_ADDRESS,
      abi: clawcoachIdentityAbi,
      eventName: "Registered",
      fromBlock: 0n,
    });

    const agents = await Promise.all(
      logs.map(async (log) => {
        const agentId = log.args.agentId!;
        const owner = log.args.owner!;

        let currentURI = "";
        try {
          currentURI = (await publicClient.readContract({
            address: CLAWCOACH_IDENTITY_ADDRESS,
            abi: clawcoachIdentityAbi,
            functionName: "tokenURI",
            args: [agentId],
          })) as string;
        } catch {
          // Token may have been burned
        }

        const parsed = parseAgentURI(currentURI);

        return {
          agentId: agentId.toString(),
          owner,
          name: parsed?.name ?? `Agent #${agentId}`,
          style: parsed?.style ?? "unknown",
          category: parsed?.category ?? "fitness",
          agentURI: currentURI,
        };
      }),
    );

    return NextResponse.json({ agents, total: agents.length });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch agents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
