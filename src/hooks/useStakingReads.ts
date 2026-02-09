"use client";

import { useReadContract } from "wagmi";
import {
  FIT_TOKEN_ADDRESS,
  FIT_STAKING_ADDRESS,
  fitTokenAbi,
  fitStakingAbi,
} from "@/config/contracts";
import type { TierIndex } from "@/config/contracts";
import type { StakeInfo } from "@/types/staking";

export function useStakingReads(userAddress: `0x${string}` | undefined) {
  const enabled = !!userAddress;

  // FitToken reads
  const walletBalance = useReadContract({
    address: FIT_TOKEN_ADDRESS,
    abi: fitTokenAbi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  const allowance = useReadContract({
    address: FIT_TOKEN_ADDRESS,
    abi: fitTokenAbi,
    functionName: "allowance",
    args: userAddress ? [userAddress, FIT_STAKING_ADDRESS] : undefined,
    query: { enabled },
  });

  // FitStaking reads
  const stakeData = useReadContract({
    address: FIT_STAKING_ADDRESS,
    abi: fitStakingAbi,
    functionName: "getStake",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  const tierData = useReadContract({
    address: FIT_STAKING_ADDRESS,
    abi: fitStakingAbi,
    functionName: "getTier",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  const isEarly = useReadContract({
    address: FIT_STAKING_ADDRESS,
    abi: fitStakingAbi,
    functionName: "isEarlyUnstake",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // Protocol-wide reads (no user address needed)
  const totalStaked = useReadContract({
    address: FIT_STAKING_ADDRESS,
    abi: fitStakingAbi,
    functionName: "totalStaked",
  });

  const basicThreshold = useReadContract({
    address: FIT_STAKING_ADDRESS,
    abi: fitStakingAbi,
    functionName: "basicThreshold",
  });

  const proThreshold = useReadContract({
    address: FIT_STAKING_ADDRESS,
    abi: fitStakingAbi,
    functionName: "proThreshold",
  });

  const eliteThreshold = useReadContract({
    address: FIT_STAKING_ADDRESS,
    abi: fitStakingAbi,
    functionName: "eliteThreshold",
  });

  // Derive structured values
  const stake: StakeInfo = {
    amount: stakeData.data?.[0] ?? 0n,
    stakedAt: stakeData.data?.[1] ?? 0n,
  };

  const tier = (tierData.data ?? 0) as TierIndex;

  const thresholds = {
    basic: basicThreshold.data ?? 0n,
    pro: proThreshold.data ?? 0n,
    elite: eliteThreshold.data ?? 0n,
  };

  const isLoading =
    walletBalance.isLoading ||
    allowance.isLoading ||
    stakeData.isLoading ||
    tierData.isLoading;

  function refetchAll() {
    void walletBalance.refetch();
    void allowance.refetch();
    void stakeData.refetch();
    void tierData.refetch();
    void isEarly.refetch();
    void totalStaked.refetch();
  }

  return {
    walletBalance: walletBalance.data ?? 0n,
    allowance: allowance.data ?? 0n,
    stake,
    tier,
    isEarlyUnstake: isEarly.data ?? false,
    totalStaked: totalStaked.data ?? 0n,
    thresholds,
    isLoading,
    refetchAll,
  };
}
