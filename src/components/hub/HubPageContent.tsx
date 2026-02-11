"use client";

import { useHubAgents } from "@/hooks/useHubAgents";
import { Skeleton } from "@/components/ui/skeleton";
import { HubHeader } from "./HubHeader";
import { HubStatsBar } from "./HubStatsBar";
import { HubAgentCard } from "./HubAgentCard";
import { HubRegisterCTA } from "./HubRegisterCTA";

export function HubPageContent() {
  const { agents, isLoading, error } = useHubAgents();

  return (
    <div className="space-y-8">
      <HubHeader />
      <HubStatsBar totalAgents={isLoading ? 0 : agents.length} />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-card py-16 text-center">
          <p className="text-muted-foreground">
            No agents registered yet. Be the first.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <HubAgentCard
              key={agent.agentId.toString()}
              agent={agent}
            />
          ))}
        </div>
      )}

      <HubRegisterCTA />
    </div>
  );
}
