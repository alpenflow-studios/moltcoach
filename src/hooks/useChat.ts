"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";

type FreeTierInfo = {
  used: number;
  limit: number;
  paidEndpoint: string;
  message: string;
};

type UseChatOptions = {
  agentName: string;
  coachingStyle: string;
  walletAddress?: string;
  /** Supabase agent UUID — enables persona-aware prompts on the server */
  agentDbId?: string;
  /** Seed messages from XMTP history (loaded after mount) */
  initialMessages?: ChatMessage[];
  /** Called when a message pair (user + assistant) completes successfully */
  onMessageComplete?: (userMsg: ChatMessage, assistantMsg: ChatMessage) => void;
};

export function useChat({
  agentName,
  coachingStyle,
  walletAddress,
  agentDbId,
  initialMessages,
  onMessageComplete,
}: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<FreeTierInfo | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Seed from XMTP history when it loads (only if chat is empty)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages((prev) => (prev.length === 0 ? initialMessages : prev));
    }
  }, [initialMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: ChatMessage = { role: "user", content: content.trim() };
      const updatedMessages = [...messages, userMessage];

      setMessages([...updatedMessages, { role: "assistant", content: "" }]);
      setIsStreaming(true);
      setError(null);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(walletAddress ? { "X-Wallet-Address": walletAddress } : {}),
          },
          body: JSON.stringify({
            messages: updatedMessages,
            agentName,
            coachingStyle,
            ...(agentDbId ? { agentDbId } : {}),
          }),
          signal: abortRef.current.signal,
        });

        // Handle x402 paywall — free tier exceeded
        if (res.status === 402) {
          const body = (await res.json()) as {
            error: string;
            used: number;
            limit: number;
            paidEndpoint: string;
            message: string;
          };
          setPaywall({
            used: body.used,
            limit: body.limit,
            paidEndpoint: body.paidEndpoint,
            message: body.message,
          });
          // Remove the empty assistant placeholder
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.content === "") {
              return prev.slice(0, -1);
            }
            return prev;
          });
          return;
        }

        if (!res.ok) {
          const errBody = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(errBody?.error ?? `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          const current = accumulated;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: current };
            }
            return updated;
          });
        }

        // Notify caller of completed message pair (for XMTP persistence)
        if (onMessageComplete && accumulated) {
          onMessageComplete(userMessage, { role: "assistant", content: accumulated });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Failed to send message";
        setError(message);
        // Remove the empty assistant placeholder on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content === "") {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, agentName, coachingStyle, walletAddress, agentDbId, onMessageComplete],
  );

  const dismissPaywall = useCallback(() => {
    setPaywall(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setPaywall(null);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, paywall, sendMessage, dismissPaywall, reset };
}
