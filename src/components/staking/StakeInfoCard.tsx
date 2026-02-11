"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatClawc, formatStakeDate, daysUntilPenaltyFree } from "@/lib/format";
import type { StakeInfo } from "@/types/staking";

type StakeInfoCardProps = {
  stake: StakeInfo;
  isEarlyUnstake: boolean;
};

export function StakeInfoCard({ stake, isEarlyUnstake }: StakeInfoCardProps) {
  const daysLeft = daysUntilPenaltyFree(stake.stakedAt);
  const hasStake = stake.amount > 0n;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Your Stake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold">{formatClawc(stake.amount)} CLAWC</p>
          {hasStake && (
            <p className="text-sm text-muted-foreground">
              Staked since {formatStakeDate(stake.stakedAt)}
            </p>
          )}
        </div>

        {hasStake && isEarlyUnstake && (
          <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-200 [&>svg]:text-yellow-400">
            <AlertTriangle className="size-4" />
            <AlertDescription>
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} until penalty-free unstaking.
              Early unstake incurs a 5% penalty.
            </AlertDescription>
          </Alert>
        )}

        {hasStake && !isEarlyUnstake && (
          <Alert className="border-primary/50 bg-primary/10 text-primary [&>svg]:text-primary">
            <CheckCircle className="size-4" />
            <AlertDescription>Penalty-free unstaking available.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
