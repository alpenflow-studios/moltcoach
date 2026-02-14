"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useAccount, useDisconnect } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { config } from "@/config/wagmi";
import { useUserSync } from "@/hooks/useUserSync";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

const PRIVY_APP_ID = (process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "").trim();

/**
 * Clear cached data when Privy logs out.
 * Privy is the auth source of truth — wagmi may auto-reconnect after logout,
 * so we watch `authenticated` (not `isConnected`) and force wagmi disconnect.
 */
function useAuthCleanup() {
  const { authenticated } = usePrivy();
  const { isConnected } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const qc = useQueryClient();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (authenticated) {
      wasAuthenticated.current = true;
    } else if (wasAuthenticated.current) {
      wasAuthenticated.current = false;
      // Force wagmi disconnect so it can't auto-reconnect
      if (isConnected) {
        disconnectWagmi();
      }
      qc.clear();
    }
  }, [authenticated, isConnected, disconnectWagmi, qc]);
}

/** Runs hooks that need wagmi context */
function WalletSyncProvider({ children }: { children: ReactNode }) {
  useUserSync();
  useAuthCleanup();
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
    return (
      <div className="flex min-h-screen flex-col overflow-x-clip">
        {/* Navbar skeleton */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <Skeleton className="h-6 w-32" />
              <div className="hidden items-center gap-2 md:flex">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-16" />
                ))}
              </div>
            </div>
            <Skeleton className="hidden h-9 w-28 rounded-md md:block" />
          </nav>
        </header>

        {/* Content skeleton */}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading 🦞 ClawCoach...</p>
        </main>

        {/* Footer skeleton */}
        <footer className="border-t border-border/50 py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-center px-6">
            <Skeleton className="h-4 w-48" />
          </div>
        </footer>
      </div>
    );
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
