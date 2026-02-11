import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ExternalLink } from "lucide-react";
import type { HubAgent } from "@/types/agent-hub";

type HubAgentCardProps = {
  agent: HubAgent;
};

const STYLE_LABELS: Record<string, string> = {
  motivator: "Motivator",
  "drill-sergeant": "Drill Sergeant",
  scientist: "Scientist",
  friend: "Friend",
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function HubAgentCard({ agent }: HubAgentCardProps) {
  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Bot className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">{agent.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                #{agent.agentId.toString()}
              </p>
            </div>
          </div>
          <a
            href={`https://sepolia.basescan.org/token/0x949488bD2F10884a0E2eB89e4947837b48814c9a?a=${agent.agentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs text-primary">
            {STYLE_LABELS[agent.style] ?? agent.style}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            ERC-8004
          </Badge>
          <Badge variant="secondary" className="text-xs capitalize">
            {agent.category}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Owner</span>
            <span className="font-mono">
              {truncateAddress(agent.owner)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="font-mono">{agent.version}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
