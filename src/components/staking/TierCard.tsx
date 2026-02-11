"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TIER_NAMES,
  TIER_COLORS,
  type TierIndex,
} from "@/config/contracts";
import { formatClawc } from "@/lib/format";

type TierCardProps = {
  currentTier: TierIndex;
  stakedAmount: bigint;
  thresholds: {
    basic: bigint;
    pro: bigint;
    elite: bigint;
  };
};

function getNextTier(
  currentTier: TierIndex,
  thresholds: TierCardProps["thresholds"],
): { name: string; threshold: bigint } | null {
  if (currentTier === 0) return { name: "Basic", threshold: thresholds.basic };
  if (currentTier === 1) return { name: "Pro", threshold: thresholds.pro };
  if (currentTier === 2) return { name: "Elite", threshold: thresholds.elite };
  return null;
}

function getProgress(
  stakedAmount: bigint,
  currentTier: TierIndex,
  thresholds: TierCardProps["thresholds"],
): number {
  const next = getNextTier(currentTier, thresholds);
  if (!next) return 100;

  const prevThreshold =
    currentTier === 0
      ? 0n
      : currentTier === 1
        ? thresholds.basic
        : currentTier === 2
          ? thresholds.pro
          : thresholds.elite;

  const range = next.threshold - prevThreshold;
  if (range === 0n) return 100;

  const progress = stakedAmount - prevThreshold;
  return Math.min(100, Number((progress * 100n) / range));
}

export function TierCard({ currentTier, stakedAmount, thresholds }: TierCardProps) {
  const nextTier = getNextTier(currentTier, thresholds);
  const progress = getProgress(stakedAmount, currentTier, thresholds);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Tier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge
          variant="outline"
          className={`text-base px-3 py-1 ${TIER_COLORS[currentTier]}`}
        >
          {TIER_NAMES[currentTier]}
        </Badge>

        {nextTier ? (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {formatClawc(stakedAmount)} / {formatClawc(nextTier.threshold)} CLAWC to{" "}
              <span className="font-medium text-foreground">{nextTier.name}</span>
            </p>
          </div>
        ) : (
          <p className="text-xs text-primary">Max tier reached</p>
        )}
      </CardContent>
    </Card>
  );
}
