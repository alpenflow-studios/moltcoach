"use client";

import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentReads } from "@/hooks/useAgentReads";
import { parseAgentURI } from "@/lib/agentURI";
import { RegisterAgentForm } from "./RegisterAgentForm";
import { AgentProfileCard } from "./AgentProfileCard";
import { AgentChat } from "./AgentChat";

export function AgentPageContent() {
  const { address, isConnected } = useAccount();
  const data = useAgentReads(address);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <h2 className="text-2xl font-bold">Connect your wallet</h2>
        <p className="max-w-md text-muted-foreground">
          Connect a Coinbase Smart Wallet to create your on-chain coaching agent
          powered by ERC-8004.
        </p>
        <ConnectWallet size="lg" />
      </div>
    );
  }

  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your <span className="text-primary">moltcoach</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {data.hasAgent
            ? "Manage your on-chain coaching agent."
            : "Create your personalized AI coaching agent on Base."}
        </p>
      </div>

      {data.hasAgent ? (
        <>
          <AgentProfileCard
            agentId={data.agentId}
            agentURI={data.agentURI}
            ownerAddress={address!}
          />
          {(() => {
            const parsed = parseAgentURI(data.agentURI);
            const name = parsed?.name ?? "Coach";
            const style = parsed?.style ?? "motivator";
            return <AgentChat agentName={name} coachingStyle={style} />;
          })()}
        </>
      ) : (
        <RegisterAgentForm onSuccess={data.refetchAll} />
      )}
    </div>
  );
}
