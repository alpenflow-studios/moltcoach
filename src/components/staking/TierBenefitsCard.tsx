"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TIER_NAMES,
  TIER_COLORS,
  TIER_DESCRIPTIONS,
  type TierIndex,
} from "@/config/contracts";
import { formatFit } from "@/lib/format";

type TierBenefitsCardProps = {
  currentTier: TierIndex;
  thresholds: {
    basic: bigint;
    pro: bigint;
    elite: bigint;
  };
};

const TIER_THRESHOLDS: { tier: TierIndex; getThreshold: (t: TierBenefitsCardProps["thresholds"]) => bigint }[] = [
  { tier: 0, getThreshold: () => 0n },
  { tier: 1, getThreshold: (t) => t.basic },
  { tier: 2, getThreshold: (t) => t.pro },
  { tier: 3, getThreshold: (t) => t.elite },
];

export function TierBenefitsCard({ currentTier, thresholds }: TierBenefitsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Tier Benefits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIER_THRESHOLDS.map(({ tier, getThreshold }) => {
            const isActive = tier === currentTier;
            const threshold = getThreshold(thresholds);
            return (
              <div
                key={tier}
                className={`rounded-lg border p-4 transition-colors ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border/50"
                }`}
              >
                <Badge
                  variant="outline"
                  className={`mb-2 ${TIER_COLORS[tier]}`}
                >
                  {TIER_NAMES[tier]}
                </Badge>
                <p className="text-sm font-medium">
                  {tier === 0 ? "Free" : `${formatFit(threshold)} FIT`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {TIER_DESCRIPTIONS[tier]}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
