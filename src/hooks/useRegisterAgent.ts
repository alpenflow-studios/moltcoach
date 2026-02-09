"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  MOLTCOACH_IDENTITY_ADDRESS,
  moltcoachIdentityAbi,
} from "@/config/contracts";

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
          address: MOLTCOACH_IDENTITY_ADDRESS,
          abi: moltcoachIdentityAbi,
          functionName: "register",
          args: [agentURI],
        },
        {
          onSuccess: () => setState("waiting"),
          onError: (err) => {
            setState("error");
            setError(err.message.split("\n")[0] ?? "Registration rejected");
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
