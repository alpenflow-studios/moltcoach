"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, AlertTriangle, Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

type ButtonSize = ComponentProps<typeof Button>["size"];

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet({ size = "sm" }: { size?: ButtonSize }) {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  // State: connecting
  if (isConnecting) {
    return (
      <Button variant="outline" size={size} disabled>
        <Loader2 className="size-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  // State: connected but wrong chain
  if (isConnected && chain?.id !== baseSepolia.id) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => switchChain({ chainId: baseSepolia.id })}
        disabled={isSwitching}
      >
        {isSwitching ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <AlertTriangle className="size-4 text-yellow-500" />
        )}
        Switch to Base Sepolia
      </Button>
    );
  }

  // State: connected on correct chain
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border/50 bg-muted px-3 py-1.5 font-mono text-sm">
          {truncateAddress(address)}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={() => disconnect()}>
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  // State: disconnected — show a button per connector
  return (
    <div className="flex items-center gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          variant="outline"
          size={size}
          onClick={() => connect({ connector })}
        >
          <Wallet className="size-4" />
          {connector.name}
        </Button>
      ))}
    </div>
  );
}
