"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/chat";
import type { XmtpClientRef, XmtpDmRef, XmtpDecodedMessage } from "@/hooks/useXmtpClient";
import {
  CLAWCOACH_AGENT_XMTP_ADDRESS,
  ASSISTANT_MSG_PREFIX,
} from "@/config/xmtp";

/** IdentifierKind.Ethereum = 0, SortDirection.Ascending = 0 */
const IDENTIFIER_KIND_ETHEREUM = 0;
const SORT_DIRECTION_ASCENDING = 0;

/**
 * Parse an XMTP V3 message into our ChatMessage type.
 * Messages prefixed with "[assistant] " are AI responses written by the user's client.
 * Messages from the user's inboxId (without prefix) are user messages.
 */
function decodeXmtpMessage(
  msg: XmtpDecodedMessage,
  userInboxId: string,
): ChatMessage | null {
  const content = typeof msg.content === "string" ? msg.content : null;
  if (!content) return null;

  if (content.startsWith(ASSISTANT_MSG_PREFIX)) {
    return {
      role: "assistant",
      content: content.slice(ASSISTANT_MSG_PREFIX.length),
    };
  }

  const isUser = msg.senderInboxId === userInboxId;
  return {
    role: isUser ? "user" : "assistant",
    content,
  };
}

export function useXmtpConversation(client: XmtpClientRef | null) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dmRef = useRef<XmtpDmRef | null>(null);

  // Initialize conversation and load history when client connects
  useEffect(() => {
    if (!client) {
      dmRef.current = null;
      setIsReady(false);
      setHistory([]);
      return;
    }

    if (!CLAWCOACH_AGENT_XMTP_ADDRESS) {
      setError("Agent XMTP address not configured");
      return;
    }

    let cancelled = false;

    async function init() {
      if (!client) return;

      setIsLoadingHistory(true);
      setError(null);

      try {
        const agentIdentifier = {
          identifier: CLAWCOACH_AGENT_XMTP_ADDRESS.toLowerCase(),
          identifierKind: IDENTIFIER_KIND_ETHEREUM,
        };

        // Try to find existing DM, then create if not found
        let dm = await client.conversations.fetchDmByIdentifier(agentIdentifier);
        if (!dm && !cancelled) {
          dm = await client.conversations.createDmWithIdentifier(agentIdentifier);
        }
        if (cancelled || !dm) return;

        dmRef.current = dm;

        // Sync to pull latest messages from the network
        await dm.sync();
        if (cancelled) return;

        const existing = await dm.messages({
          direction: SORT_DIRECTION_ASCENDING,
        });
        if (cancelled) return;

        const userInboxId = client.inboxId;
        const parsed = existing
          .map((m) => decodeXmtpMessage(m, userInboxId))
          .filter((m): m is ChatMessage => m !== null);

        setHistory(parsed);
        setIsReady(true);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load XMTP conversation";
        setError(message);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const sendMessage = useCallback(
    async (content: string, role: "user" | "assistant") => {
      if (!dmRef.current) return;

      try {
        const payload =
          role === "assistant" ? `${ASSISTANT_MSG_PREFIX}${content}` : content;
        await dmRef.current.sendText(payload);
      } catch (err) {
        // Non-fatal: XMTP send failure shouldn't break the HTTP chat
        console.error("XMTP send failed:", err);
      }
    },
    [],
  );

  return { history, isLoadingHistory, sendMessage, isReady, error };
}
