"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  CLAWC_TOKEN_ADDRESS,
  CLAWC_STAKING_ADDRESS,
  clawcTokenAbi,
  clawcStakingAbi,
} from "@/config/contracts";

type StakeState =
  | "idle"
  | "approving"
  | "waitingApproval"
  | "staking"
  | "waitingStake"
  | "success"
  | "error";

export function useStakeAction(options: { onSuccess?: () => void }) {
  const [state, setState] = useState<StakeState>("idle");
  const [error, setError] = useState<string | null>(null);
  const pendingAmount = useRef<bigint>(0n);

  const approve = useWriteContract();
  const stake = useWriteContract();

  const approveReceipt = useWaitForTransactionReceipt({
    hash: approve.data,
    query: { enabled: !!approve.data },
  });

  const stakeReceipt = useWaitForTransactionReceipt({
    hash: stake.data,
    query: { enabled: !!stake.data },
  });

  // Auto-stake after approval confirms
  useEffect(() => {
    if (state === "waitingApproval" && approveReceipt.isSuccess) {
      setState("staking");
      stake.writeContract(
        {
          address: CLAWC_STAKING_ADDRESS,
          abi: clawcStakingAbi,
          functionName: "stake",
          args: [pendingAmount.current],
        },
        {
          onSuccess: () => setState("waitingStake"),
          onError: (err) => {
            setState("error");
            setError(err.message.split("\n")[0] ?? "Stake rejected");
          },
        },
      );
    }
    if (state === "waitingApproval" && approveReceipt.isError) {
      setState("error");
      setError("Approval transaction failed");
    }
  }, [state, approveReceipt.isSuccess, approveReceipt.isError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle stake confirmation
  if (state === "waitingStake" && stakeReceipt.isSuccess) {
    setState("success");
    options.onSuccess?.();
  }
  if (state === "waitingStake" && stakeReceipt.isError) {
    setState("error");
    setError("Stake transaction failed");
  }

  const startApproveAndStake = useCallback(
    (amount: bigint) => {
      pendingAmount.current = amount;
      setState("approving");
      setError(null);
      approve.writeContract(
        {
          address: CLAWC_TOKEN_ADDRESS,
          abi: clawcTokenAbi,
          functionName: "approve",
          args: [CLAWC_STAKING_ADDRESS, amount],
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
      pendingAmount.current = amount;
      setState("staking");
      setError(null);
      stake.writeContract(
        {
          address: CLAWC_STAKING_ADDRESS,
          abi: clawcStakingAbi,
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
    pendingAmount.current = 0n;
    approve.reset();
    stake.reset();
  }, [approve, stake]);

  return {
    state,
    error,
    startApproveAndStake,
    startStake,
    reset,
  };
}
