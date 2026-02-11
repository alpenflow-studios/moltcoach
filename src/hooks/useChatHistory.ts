"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatMessage } from "@/types/chat";

type UseChatHistoryOptions = {
  walletAddress?: string;
  agentIdOnchain?: number;
};

/**
 * Loads chat history from Supabase and provides a save function.
 * Returns history (for seeding useChat) and saveMessages (for persisting new pairs).
 */
export function useChatHistory({ walletAddress, agentIdOnchain }: UseChatHistoryOptions) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const loadedRef = useRef<string | null>(null);

  // Load history on mount (once per wallet+agent combo)
  useEffect(() => {
    if (!walletAddress || agentIdOnchain == null) return;
    const key = `${walletAddress}-${agentIdOnchain}`;
    if (loadedRef.current === key) return;
    loadedRef.current = key;

    void fetch(`/api/messages?wallet=${walletAddress}&agentId=${agentIdOnchain}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ChatMessage[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
        }
      });
  }, [walletAddress, agentIdOnchain]);

  // Save a message pair to Supabase (fire-and-forget)
  const saveMessages = useCallback(
    (userMsg: ChatMessage, assistantMsg: ChatMessage) => {
      if (!walletAddress || agentIdOnchain == null) return;
      void fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          agentIdOnchain,
          messages: [userMsg, assistantMsg],
        }),
      });
    },
    [walletAddress, agentIdOnchain],
  );

  return { history, saveMessages };
}
