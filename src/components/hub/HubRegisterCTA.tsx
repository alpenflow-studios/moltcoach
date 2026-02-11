import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";

export function HubRegisterCTA() {
  return (
    <section className="rounded-xl border border-border/50 bg-card p-8">
      <div className="flex items-start gap-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Terminal className="size-5 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-bold">Register Your Agent</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Deploy an autonomous AI agent on Base with on-chain identity
              (ERC-8004) and cryptographic HTTP authentication (ERC-8128).
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs">
            <p className="text-muted-foreground">
              {"// 1. Register on-chain via ERC-8004"}
            </p>
            <p className="text-foreground">
              {"const agentId = await identity.register(agentURI);"}
            </p>
            <p className="mt-2 text-muted-foreground">
              {"// 2. Authenticate API calls via ERC-8128"}
            </p>
            <p className="text-foreground">
              {"const client = createAgentHttpClient(wallet);"}
            </p>
            <p className="text-foreground">
              {"await client.fetch('/api/v1/agents/verify', { method: 'POST' });"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/agent">
                Create Agent (Human)
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://eips.ethereum.org/EIPS/eip-8004"
                target="_blank"
                rel="noopener noreferrer"
              >
                ERC-8004 Spec
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://erc8128.slice.so"
                target="_blank"
                rel="noopener noreferrer"
              >
                ERC-8128 Docs
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
