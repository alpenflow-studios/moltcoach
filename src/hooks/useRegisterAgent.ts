"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  CLAWCOACH_IDENTITY_ADDRESS,
  clawcoachIdentityAbi,
} from "@/config/contracts";
import { builderCodesDataSuffix } from "@/lib/builderCodes";
import { parseContractError } from "@/lib/contractErrors";

type RegisterState = "idle" | "registering" | "waiting" | "success" | "error";

export function useRegisterAgent(options: { onSuccess?: () => void }) {
  const [state, setState] = useState<RegisterState>("idle");
  const [error, setError] = useState<string | null>(null);

  const register = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: register.data,
    query: {
      enabled: !!register.data,
    },
  });

  if (state === "waiting" && receipt.isSuccess) {
    setState("success");
    options.onSuccess?.();
  }
  if (state === "waiting" && receipt.isError) {
    setState("error");
    setError("Registration transaction failed");
  }

  const startRegister = useCallback(
    (agentURI: string) => {
      setState("registering");
      setError(null);
      register.writeContract(
        {
          address: CLAWCOACH_IDENTITY_ADDRESS,
          abi: clawcoachIdentityAbi,
          functionName: "register",
          args: [agentURI],
          dataSuffix: builderCodesDataSuffix,
        },
        {
          onSuccess: () => setState("waiting"),
          onError: (err) => {
            setState("error");
            setError(parseContractError(err));
          },
        },
      );
    },
    [register],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    register.reset();
  }, [register]);

  return {
    state,
    error,
    startRegister,
    reset,
  };
}
