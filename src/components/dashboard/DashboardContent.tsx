"use client";

import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Bot,
  Coins,
  TrendingUp,
  ArrowRight,
  Zap,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useStakingReads } from "@/hooks/useStakingReads";
import { useAgentReads } from "@/hooks/useAgentReads";
import { formatFit } from "@/lib/format";
import { TIER_NAMES, TIER_COLORS, type TierIndex } from "@/config/contracts";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getNextTierThreshold(
  currentTier: TierIndex,
  thresholds: { basic: bigint; pro: bigint; elite: bigint },
): bigint | null {
  if (currentTier === 0) return thresholds.basic;
  if (currentTier === 1) return thresholds.pro;
  if (currentTier === 2) return thresholds.elite;
  return null;
}

export function DashboardContent() {
  const { address, isConnected } = useAccount();
  const staking = useStakingReads(address);
  const agent = useAgentReads(address);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="size-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Your Dashboard</h2>
        <p className="max-w-md text-muted-foreground">
          Connect your wallet to see your agent, staking position, and activity
          at a glance.
        </p>
        <ConnectWallet size="lg" />
      </div>
    );
  }

  if (staking.isLoading || agent.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const nextThreshold = getNextTierThreshold(staking.tier, staking.thresholds);
  const tierProgress = nextThreshold
    ? Number((staking.stake.amount * 100n) / nextThreshold)
    : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {truncateAddress(address!)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Coins className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">$FIT Balance</p>
                <p className="text-lg font-bold">{formatFit(staking.walletBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <TrendingUp className="size-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Staked</p>
                <p className="text-lg font-bold">{formatFit(staking.stake.amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Zap className="size-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tier</p>
                <p className={`text-lg font-bold ${TIER_COLORS[staking.tier]}`}>
                  {TIER_NAMES[staking.tier]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bot className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Agent</p>
                <p className="text-lg font-bold">
                  {agent.hasAgent ? `#${agent.agentId}` : "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Staking Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="size-4 text-primary" />
              Staking Overview
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staking">
                Manage <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Stake</span>
              <span className="font-medium">{formatFit(staking.stake.amount)} FIT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wallet Balance</span>
              <span className="font-medium">{formatFit(staking.walletBalance)} FIT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Protocol Total</span>
              <span className="font-medium">{formatFit(staking.totalStaked)} FIT</span>
            </div>

            {nextThreshold && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progress to {TIER_NAMES[Math.min(staking.tier + 1, 3) as TierIndex]}
                  </span>
                  <span className="text-muted-foreground">{Math.min(tierProgress, 100)}%</span>
                </div>
                <Progress value={Math.min(tierProgress, 100)} className="h-2" />
              </div>
            )}

            {staking.stake.amount === 0n && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs text-primary">
                  Stake $FIT tokens to unlock premium coaching features and earn
                  higher tiers.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agent Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="size-4 text-primary" />
              Agent Status
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agent">
                {agent.hasAgent ? "View" : "Create"} <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {agent.hasAgent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Agent #{agent.agentId.toString()}</p>
                    <Badge variant="outline" className="mt-1 text-xs text-primary">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <Activity className="mx-auto size-4 text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground">Workouts</p>
                    <p className="text-sm font-medium">0</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <Target className="mx-auto size-4 text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground">Goals</p>
                    <p className="text-sm font-medium">0</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <Zap className="mx-auto size-4 text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground">Earned</p>
                    <p className="text-sm font-medium">0 FIT</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted/50">
                  <Bot className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No Agent Yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your on-chain AI coaching agent to get started.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/agent">
                    Create Agent <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
