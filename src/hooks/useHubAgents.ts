"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  CLAWCOACH_IDENTITY_ADDRESS,
  clawcoachIdentityAbi,
} from "@/config/contracts";
import { parseAgentURI } from "@/lib/agentURI";
import type { HubAgent } from "@/types/agent-hub";

// Standalone public client — Hub is public, no wallet connection required
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export function useHubAgents() {
  const [agents, setAgents] = useState<HubAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        // Fetch all Registered events from the ERC-8004 identity contract
        const logs = await publicClient.getContractEvents({
          address: CLAWCOACH_IDENTITY_ADDRESS,
          abi: clawcoachIdentityAbi,
          eventName: "Registered",
          fromBlock: 0n,
        });

        const hubAgents: HubAgent[] = await Promise.all(
          logs.map(async (log) => {
            const agentId = log.args.agentId!;
            const owner = log.args.owner!;

            // Get current URI (may have been updated since registration)
            let currentURI = "";
            try {
              currentURI = (await publicClient.readContract({
                address: CLAWCOACH_IDENTITY_ADDRESS,
                abi: clawcoachIdentityAbi,
                functionName: "tokenURI",
                args: [agentId],
              })) as string;
            } catch {
              // Token may have been burned — skip gracefully
            }

            const parsed = parseAgentURI(currentURI);

            return {
              agentId,
              owner,
              agentURI: currentURI,
              name: parsed?.name ?? `Agent #${agentId}`,
              style: parsed?.style ?? "unknown",
              category: parsed?.category ?? "fitness",
              version: parsed?.version ?? "1.0.0",
            };
          }),
        );

        setAgents(hubAgents);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch agents",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchAgents();
  }, []);

  return { agents, isLoading, error };
}
