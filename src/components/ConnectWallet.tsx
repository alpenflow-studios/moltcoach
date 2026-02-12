"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

type ButtonSize = ComponentProps<typeof Button>["size"];

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet({ size = "sm" }: { size?: ButtonSize }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useAccount();

  if (!ready) {
    return (
      <Button variant="outline" size={size} disabled>
        <Loader2 className="size-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (authenticated && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border/50 bg-muted px-3 py-1.5 font-mono text-sm">
          {truncateAddress(address)}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => void logout()}>
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size={size} onClick={() => login()}>
      <Wallet className="size-4" />
      Connect
    </Button>
  );
}
