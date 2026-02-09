"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StakeForm } from "./StakeForm";
import { UnstakeForm } from "./UnstakeForm";
import type { StakeInfo } from "@/types/staking";

type StakeActionsProps = {
  walletBalance: bigint;
  allowance: bigint;
  stake: StakeInfo;
  isEarlyUnstake: boolean;
  onSuccess: () => void;
};

export function StakeActions({
  walletBalance,
  allowance,
  stake,
  isEarlyUnstake,
  onSuccess,
}: StakeActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stake">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>
          <TabsContent value="stake" className="mt-4">
            <StakeForm
              walletBalance={walletBalance}
              allowance={allowance}
              onSuccess={onSuccess}
            />
          </TabsContent>
          <TabsContent value="unstake" className="mt-4">
            <UnstakeForm
              stake={stake}
              isEarlyUnstake={isEarlyUnstake}
              onSuccess={onSuccess}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
