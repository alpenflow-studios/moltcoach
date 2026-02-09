"use client";

import { useState, useEffect } from "react";
import { parseUnits } from "viem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { formatFit } from "@/lib/format";
import { useUnstakeAction } from "@/hooks/useUnstakeAction";
import type { StakeInfo } from "@/types/staking";

type UnstakeFormProps = {
  stake: StakeInfo;
  isEarlyUnstake: boolean;
  onSuccess: () => void;
};

export function UnstakeForm({ stake, isEarlyUnstake, onSuccess }: UnstakeFormProps) {
  const [amountStr, setAmountStr] = useState("");
  const { state, error, startUnstake, reset } = useUnstakeAction({ onSuccess });

  let parsedAmount = 0n;
  let parseError = false;
  try {
    if (amountStr) parsedAmount = parseUnits(amountStr, 18);
  } catch {
    parseError = true;
  }

  const penalty = isEarlyUnstake ? (parsedAmount * 5n) / 100n : 0n;
  const payout = parsedAmount - penalty;
  const canUnstake = parsedAmount > 0n && parsedAmount <= stake.amount && !parseError;

  const isProcessing = state === "unstaking" || state === "waiting";

  // Reset form on success
  useEffect(() => {
    if (state === "success") {
      const timer = setTimeout(() => {
        setAmountStr("");
        reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, reset]);

  function handleSubmit() {
    if (!canUnstake) return;
    startUnstake(parsedAmount);
  }

  function getButtonLabel(): string {
    switch (state) {
      case "unstaking":
        return "Confirm in wallet...";
      case "waiting":
        return "Confirming unstake...";
      case "success":
        return "Unstaked!";
      case "error":
        return "Try again";
      default:
        return `Unstake ${amountStr || "0"} FIT`;
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="unstake-amount">Amount</Label>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => {
              setAmountStr(formatFit(stake.amount, 18, 18).replace(/,/g, ""));
              reset();
            }}
          >
            MAX
          </button>
        </div>
        <Input
          id="unstake-amount"
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
          Staked: {formatFit(stake.amount)} FIT
        </p>
      </div>

      {isEarlyUnstake && parsedAmount > 0n && !parseError && (
        <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-200 [&>svg]:text-yellow-400">
          <AlertTriangle className="size-4" />
          <AlertDescription className="space-y-1">
            <p>5% early unstake penalty applies.</p>
            <p className="text-xs">
              Penalty: {formatFit(penalty)} FIT &middot; You receive: {formatFit(payout)} FIT
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Button
        className="w-full"
        variant={isEarlyUnstake && canUnstake ? "destructive" : "default"}
        onClick={state === "error" ? reset : handleSubmit}
        disabled={(state === "idle" && !canUnstake) || isProcessing || state === "success"}
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

      {parsedAmount > stake.amount && !parseError && amountStr && (
        <p className="text-xs text-destructive">Exceeds staked balance</p>
      )}
    </div>
  );
}
