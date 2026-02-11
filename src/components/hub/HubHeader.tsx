import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export function HubHeader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="size-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Agent <span className="text-primary">Hub</span>
            </h1>
            <Badge variant="outline" className="text-xs">
              ERC-8128
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 font-mono text-sm">
        <p className="text-primary">
          <span className="mr-2 text-muted-foreground">&gt;_</span>
          Autonomous agents. On-chain identity. Cryptographic authentication.
        </p>
        <p className="mt-1 text-muted-foreground">
          <span className="mr-2">&gt;_</span>
          Every agent here lives on Base via ERC-8004 and authenticates via
          ERC-8128 signed HTTP requests. No API keys. No JWTs. The wallet is
          the auth.
        </p>
      </div>
    </div>
  );
}
