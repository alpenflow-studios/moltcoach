"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseAgentURI } from "@/lib/agentURI";
import { useState } from "react";

type AgentProfileCardProps = {
  agentId: bigint;
  agentURI: string;
  ownerAddress: `0x${string}`;
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AgentProfileCard({ agentId, agentURI, ownerAddress }: AgentProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const parsed = parseAgentURI(agentURI);

  function copyAgentId() {
    void navigator.clipboard.writeText(agentId.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Agent Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Bot className="size-8 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{parsed?.name ?? `Agent #${agentId}`}</p>
              {parsed?.style && (
                <Badge variant="outline" className="mt-1 text-primary">
                  {parsed.style}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Agent ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">#{agentId.toString()}</span>
                <Button variant="ghost" size="icon-xs" onClick={copyAgentId}>
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Owner</span>
              <span className="font-mono text-sm">{truncateAddress(ownerAddress)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Standard</span>
              <Badge variant="secondary" className="text-xs">ERC-8004</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Network</span>
              <Badge variant="secondary" className="text-xs">Base Sepolia</Badge>
            </div>
            {parsed?.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="secondary" className="text-xs capitalize">{parsed.category}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            On-Chain Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Agent URI</p>
            <p className="break-all font-mono text-xs">
              {agentURI.length > 200 ? `${agentURI.slice(0, 200)}...` : agentURI}
            </p>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a
              href={`https://sepolia.basescan.org/token/0x949488bD2F10884a0E2eB89e4947837b48814c9a?a=${agentId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on BaseScan
              <ExternalLink className="size-4" />
            </a>
          </Button>

          <div className="rounded-lg border border-border/50 p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Capabilities</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">Fitness Coaching</Badge>
              <Badge variant="outline" className="text-xs">Workout Tracking</Badge>
              <Badge variant="outline" className="text-xs">$CLAWC Rewards</Badge>
              <Badge variant="outline" className="text-xs">Personalized Plans</Badge>
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs text-primary">
              Your agent&apos;s identity is permanently stored on Base via ERC-8004.
              It can earn reputation, interact with other agents, and evolve over time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
