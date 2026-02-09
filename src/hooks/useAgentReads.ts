"use client";

import { useReadContract } from "wagmi";
import {
  MOLTCOACH_IDENTITY_ADDRESS,
  moltcoachIdentityAbi,
} from "@/config/contracts";

export function useAgentReads(userAddress: `0x${string}` | undefined) {
  const enabled = !!userAddress;

  const hasAgent = useReadContract({
    address: MOLTCOACH_IDENTITY_ADDRESS,
    abi: moltcoachIdentityAbi,
    functionName: "hasAgent",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  const agentId = useReadContract({
    address: MOLTCOACH_IDENTITY_ADDRESS,
    abi: moltcoachIdentityAbi,
    functionName: "getAgent",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && hasAgent.data === true },
  });

  const agentURI = useReadContract({
    address: MOLTCOACH_IDENTITY_ADDRESS,
    abi: moltcoachIdentityAbi,
    functionName: "tokenURI",
    args: agentId.data ? [agentId.data] : undefined,
    query: { enabled: !!agentId.data },
  });

  const isLoading = hasAgent.isLoading;

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
    refetchAll,
  };
}
