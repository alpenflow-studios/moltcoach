"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";

/**
 * Syncs the connected wallet address to Supabase on connect.
 * Call once near the root of the app (e.g., WalletProvider).
 */
export function useUserSync() {
  const { address, isConnected } = useAccount();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      syncedRef.current = null;
      return;
    }
    // Only sync once per address per session
    if (syncedRef.current === address) return;
    syncedRef.current = address;

    void fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address }),
    });
  }, [isConnected, address]);
}
