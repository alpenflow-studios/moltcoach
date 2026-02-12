"use client";

import { useMemo, useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, AlertTriangle, Loader2, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

type ButtonSize = ComponentProps<typeof Button>["size"];

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return isTouch;
}

export function ConnectWallet({ size = "sm" }: { size?: ButtonSize }) {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isTouch = useIsTouchDevice();
  const [showMobileWallets, setShowMobileWallets] = useState(false);

  // Deduplicate connectors by name (wagmi can return duplicates for injected providers)
  const uniqueConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((c) => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    });
  }, [connectors]);

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

  // State: disconnected — mobile touch: plain buttons (bypasses Radix portal issues)
  if (isTouch) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Button
          variant="outline"
          size={size}
          onClick={() => setShowMobileWallets((v) => !v)}
        >
          <Wallet className="size-4" />
          Connect Wallet
          <ChevronDown className={`size-3 transition-transform ${showMobileWallets ? "rotate-180" : ""}`} />
        </Button>
        {showMobileWallets && (
          <div className="flex flex-col gap-1 rounded-md border border-border bg-popover p-1 shadow-md">
            {uniqueConnectors.map((connector) => (
              <button
                key={connector.uid}
                type="button"
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-popover-foreground hover:bg-accent active:bg-accent"
                onClick={() => {
                  setShowMobileWallets(false);
                  connect({ connector });
                }}
              >
                <Wallet className="size-4" />
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // State: disconnected — desktop: Radix dropdown (works fine with pointer devices)
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}>
          <Wallet className="size-4" />
          Connect Wallet
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {uniqueConnectors.map((connector) => (
          <DropdownMenuItem
            key={connector.uid}
            onSelect={() => connect({ connector })}
          >
            <Wallet className="size-4" />
            {connector.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
