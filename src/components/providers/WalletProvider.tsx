"use client";

import { useState, useEffect, type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia } from "wagmi/chains";
import { config } from "@/config/wagmi";
import { useUserSync } from "@/hooks/useUserSync";

const queryClient = new QueryClient();

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

/** Runs hooks that need wagmi context */
function WalletSyncProvider({ children }: { children: ReactNode }) {
  useUserSync();
  return <>{children}</>;
}

/**
 * PrivyProvider validates the app ID at construction time (network call).
 * This fails during Next.js static generation / prerendering on Vercel.
 * We defer the entire provider tree to client-only via a mount guard.
 * The brief flash is acceptable for a beta site behind password protection.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#84cc16",
          walletList: [
            "coinbase_wallet",
            "metamask",
            "rainbow",
            "wallet_connect",
            "phantom",
          ],
        },
        loginMethods: ["email", "farcaster", "wallet"],
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <WalletSyncProvider>{children}</WalletSyncProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
