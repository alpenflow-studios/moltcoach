"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  FIT_TOKEN_ADDRESS,
  FIT_STAKING_ADDRESS,
  fitTokenAbi,
  fitStakingAbi,
} from "@/config/contracts";

type StakeState =
  | "idle"
  | "approving"
  | "waitingApproval"
  | "approved"
  | "staking"
  | "waitingStake"
  | "success"
  | "error";

export function useStakeAction(options: { onSuccess?: () => void }) {
  const [state, setState] = useState<StakeState>("idle");
  const [error, setError] = useState<string | null>(null);

  const approve = useWriteContract();
  const stake = useWriteContract();

  const approveReceipt = useWaitForTransactionReceipt({
    hash: approve.data,
    query: {
      enabled: !!approve.data,
    },
  });

  const stakeReceipt = useWaitForTransactionReceipt({
    hash: stake.data,
    query: {
      enabled: !!stake.data,
    },
  });

  // Handle approval confirmation — show "approved" state so user can click Stake
  if (state === "waitingApproval" && approveReceipt.isSuccess) {
    setState("approved");
  }
  if (state === "waitingApproval" && approveReceipt.isError) {
    setState("error");
    setError("Approval transaction failed");
  }

  // Handle stake confirmation
  if (state === "waitingStake" && stakeReceipt.isSuccess) {
    setState("success");
    options.onSuccess?.();
  }
  if (state === "waitingStake" && stakeReceipt.isError) {
    setState("error");
    setError("Stake transaction failed");
  }

  const startApprove = useCallback(
    (amount: bigint) => {
      setState("approving");
      setError(null);
      approve.writeContract(
        {
          address: FIT_TOKEN_ADDRESS,
          abi: fitTokenAbi,
          functionName: "approve",
          args: [FIT_STAKING_ADDRESS, amount],
        },
        {
          onSuccess: () => setState("waitingApproval"),
          onError: (err) => {
            setState("error");
            setError(err.message.split("\n")[0] ?? "Approval rejected");
          },
        },
      );
    },
    [approve],
  );

  const startStake = useCallback(
    (amount: bigint) => {
      setState("staking");
      setError(null);
      stake.writeContract(
        {
          address: FIT_STAKING_ADDRESS,
          abi: fitStakingAbi,
          functionName: "stake",
          args: [amount],
        },
        {
          onSuccess: () => setState("waitingStake"),
          onError: (err) => {
            setState("error");
            setError(err.message.split("\n")[0] ?? "Stake rejected");
          },
        },
      );
    },
    [stake],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    approve.reset();
    stake.reset();
  }, [approve, stake]);

  return {
    state,
    error,
    startApprove,
    startStake,
    reset,
  };
}
