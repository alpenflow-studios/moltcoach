"use client";

import { useState, useEffect } from "react";
import { parseUnits } from "viem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatClawc } from "@/lib/format";
import { useStakeAction } from "@/hooks/useStakeAction";

type StakeFormProps = {
  walletBalance: bigint;
  allowance: bigint;
  onSuccess: () => void;
};

export function StakeForm({ walletBalance, allowance, onSuccess }: StakeFormProps) {
  const [amountStr, setAmountStr] = useState("");
  const { state, error, startApproveAndStake, startStake, reset } = useStakeAction({ onSuccess });

  let parsedAmount = 0n;
  let parseError = false;
  try {
    if (amountStr) parsedAmount = parseUnits(amountStr, 18);
  } catch {
    parseError = true;
  }

  const needsApproval = parsedAmount > 0n && allowance < parsedAmount;
  const canStake = parsedAmount > 0n && parsedAmount <= walletBalance && !parseError;

  // Toast + reset on success
  useEffect(() => {
    if (state === "success") {
      toast.success(`Staked ${amountStr} CLAWC`, {
        description: "Your tokens have been staked successfully.",
      });
      const timer = setTimeout(() => {
        setAmountStr("");
        reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    if (!canStake) return;
    if (needsApproval) {
      startApproveAndStake(parsedAmount);
    } else {
      startStake(parsedAmount);
    }
  }

  const isProcessing = state !== "idle" && state !== "success" && state !== "error";

  function getButtonLabel(): string {
    switch (state) {
      case "approving":
        return "Approve in wallet...";
      case "waitingApproval":
        return "Confirming approval...";
      case "staking":
        return "Confirm stake in wallet...";
      case "waitingStake":
        return "Confirming stake...";
      case "success":
        return "Staked!";
      case "error":
        return "Try again";
      default:
        return needsApproval
          ? `Approve & Stake ${amountStr || "0"} CLAWC`
          : `Stake ${amountStr || "0"} CLAWC`;
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="stake-amount">Amount</Label>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => {
              setAmountStr(formatClawc(walletBalance, 18, 18).replace(/,/g, ""));
              reset();
            }}
          >
            MAX
          </button>
        </div>
        <Input
          id="stake-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amountStr}
          onChange={(e) => {
            setAmountStr(e.target.value);
            if (state === "error" || state === "success") reset();
          }}
          disabled={isProcessing}
        />
        <p className="text-xs text-muted-foreground">
          Wallet balance: {formatClawc(walletBalance)} CLAWC
        </p>
      </div>

      <Button
        className="w-full"
        onClick={state === "error" ? reset : handleSubmit}
        disabled={
          (state === "idle" && !canStake) || isProcessing || state === "success"
        }
      >
        {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
        {getButtonLabel()}
      </Button>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {parseError && amountStr && (
        <p className="text-xs text-destructive">Invalid amount</p>
      )}

      {parsedAmount > walletBalance && !parseError && amountStr && (
        <p className="text-xs text-destructive">Exceeds wallet balance</p>
      )}
    </div>
  );
}
