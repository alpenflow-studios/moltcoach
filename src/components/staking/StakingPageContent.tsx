"use client";

import { useAccount } from "wagmi";
import dynamic from "next/dynamic";

const ConnectWallet = dynamic(
  () => import("@/components/ConnectWallet").then((m) => m.ConnectWallet),
  { ssr: false },
);
import { Skeleton } from "@/components/ui/skeleton";
import { useStakingReads } from "@/hooks/useStakingReads";
import { StakingHeader } from "./StakingHeader";
import { TierCard } from "./TierCard";
import { StakeInfoCard } from "./StakeInfoCard";
import { StakeActions } from "./StakeActions";
import { TierBenefitsCard } from "./TierBenefitsCard";

export function StakingPageContent() {
  const { address, isConnected } = useAccount();
  const data = useStakingReads(address);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <h2 className="text-2xl font-bold">Connect your wallet to stake</h2>
        <p className="max-w-md text-muted-foreground">
          Connect a Coinbase Smart Wallet to view your staking position and
          manage $CLAWC tokens.
        </p>
        <ConnectWallet size="lg" />
      </div>
    );
  }

  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StakingHeader totalStaked={data.totalStaked} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <StakeInfoCard
            stake={data.stake}
            isEarlyUnstake={data.isEarlyUnstake}
          />
          <TierCard
            currentTier={data.tier}
            stakedAmount={data.stake.amount}
            thresholds={data.thresholds}
          />
        </div>

        <StakeActions
          walletBalance={data.walletBalance}
          allowance={data.allowance}
          stake={data.stake}
          isEarlyUnstake={data.isEarlyUnstake}
          onSuccess={data.refetchAll}
        />
      </div>

      <TierBenefitsCard
        currentTier={data.tier}
        thresholds={data.thresholds}
      />
    </div>
  );
}
