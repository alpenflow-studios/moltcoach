"use client";

import { useReadContract } from "wagmi";
import {
  CLAWCOACH_IDENTITY_ADDRESS,
  clawcoachIdentityAbi,
} from "@/config/contracts";

export function useAgentReads(userAddress: `0x${string}` | undefined) {
  const enabled = !!userAddress;

  const hasAgent = useReadContract({
    address: CLAWCOACH_IDENTITY_ADDRESS,
    abi: clawcoachIdentityAbi,
    functionName: "hasAgent",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  const agentId = useReadContract({
    address: CLAWCOACH_IDENTITY_ADDRESS,
    abi: clawcoachIdentityAbi,
    functionName: "getAgent",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && hasAgent.data === true },
  });

  const agentURI = useReadContract({
    address: CLAWCOACH_IDENTITY_ADDRESS,
    abi: clawcoachIdentityAbi,
    functionName: "tokenURI",
    args: agentId.data ? [agentId.data] : undefined,
    query: { enabled: !!agentId.data },
  });

  const isLoading = hasAgent.isLoading;
  const error = hasAgent.error ?? agentId.error ?? agentURI.error ?? null;

  function refetchAll() {
    void hasAgent.refetch();
    void agentId.refetch();
    void agentURI.refetch();
  }

  return {
    hasAgent: hasAgent.data ?? false,
    agentId: agentId.data ?? 0n,
    agentURI: agentURI.data ?? "",
    isLoading,
    error,
    refetchAll,
  };
}
