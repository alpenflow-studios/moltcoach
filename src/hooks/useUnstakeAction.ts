"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FIT_STAKING_ADDRESS, fitStakingAbi } from "@/config/contracts";

type UnstakeState = "idle" | "unstaking" | "waiting" | "success" | "error";

export function useUnstakeAction(options: { onSuccess?: () => void }) {
  const [state, setState] = useState<UnstakeState>("idle");
  const [error, setError] = useState<string | null>(null);

  const unstake = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: unstake.data,
    query: {
      enabled: !!unstake.data,
    },
  });

  if (state === "waiting" && receipt.isSuccess) {
    setState("success");
    options.onSuccess?.();
  }
  if (state === "waiting" && receipt.isError) {
    setState("error");
    setError("Unstake transaction failed");
  }

  const startUnstake = useCallback(
    (amount: bigint) => {
      setState("unstaking");
      setError(null);
      unstake.writeContract(
        {
          address: FIT_STAKING_ADDRESS,
          abi: fitStakingAbi,
          functionName: "unstake",
          args: [amount],
        },
        {
          onSuccess: () => setState("waiting"),
          onError: (err) => {
            setState("error");
            setError(err.message.split("\n")[0] ?? "Unstake rejected");
          },
        },
      );
    },
    [unstake],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    unstake.reset();
  }, [unstake]);

  return {
    state,
    error,
    startUnstake,
    reset,
  };
}
