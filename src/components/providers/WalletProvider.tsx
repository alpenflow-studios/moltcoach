"use client";

import { type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/config/wagmi";
import { useUserSync } from "@/hooks/useUserSync";

const queryClient = new QueryClient();

/** Runs hooks that need wagmi context */
function WalletSyncProvider({ children }: { children: ReactNode }) {
  useUserSync();
  return <>{children}</>;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletSyncProvider>{children}</WalletSyncProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
