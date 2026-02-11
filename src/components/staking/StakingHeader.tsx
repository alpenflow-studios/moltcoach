"use client";

import { formatClawc } from "@/lib/format";

type StakingHeaderProps = {
  totalStaked: bigint;
};

export function StakingHeader({ totalStaked }: StakingHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Stake <span className="text-primary">$CLAWC</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Stake to unlock premium coaching tiers and features.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Total staked across protocol:{" "}
        <span className="font-medium text-foreground">
          {formatClawc(totalStaked)} CLAWC
        </span>
      </p>
    </div>
  );
}
