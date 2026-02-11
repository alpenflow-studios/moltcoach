"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useWalletClient } from "wagmi";
import { walletClientToXmtpSigner } from "@/lib/xmtpSigner";
import { XMTP_ENV } from "@/config/xmtp";

export type XmtpClientStatus = "disconnected" | "connecting" | "connected" | "error";

/**
 * Structural type for the XMTP V3 Client (avoids top-level import of @xmtp/browser-sdk).
 * Covers the subset of the Client API used by our hooks.
 */
export type XmtpClientRef = {
  inboxId: string;
  accountIdentifier: { identifier: string };
  conversations: {
    sync: () => Promise<void>;
    fetchDmByIdentifier: (identifier: {
      identifier: string;
      identifierKind: number;
    }) => Promise<XmtpDmRef | null>;
    createDmWithIdentifier: (identifier: {
      identifier: string;
      identifierKind: number;
    }) => Promise<XmtpDmRef>;
  };
};

export type XmtpDmRef = {
  sync: () => Promise<void>;
  sendText: (content: string) => Promise<unknown>;
  messages: (options?: {
    direction?: number;
  }) => Promise<XmtpDecodedMessage[]>;
};

export type XmtpDecodedMessage = {
  senderInboxId: string;
  content: unknown;
  sentAt: Date;
};

export function useXmtpClient() {
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<XmtpClientRef | null>(null);
  const [status, setStatus] = useState<XmtpClientStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<XmtpClientRef | null>(null);

  const connect = useCallback(async () => {
    if (!walletClient) {
      setError("No wallet connected");
      setStatus("error");
      return;
    }
    if (clientRef.current) return;

    setStatus("connecting");
    setError(null);

    try {
      const { Client } = await import("@xmtp/browser-sdk");
      const signer = walletClientToXmtpSigner(walletClient);
      const xmtpClient = await Client.create(signer, { env: XMTP_ENV });

      clientRef.current = xmtpClient as unknown as XmtpClientRef;
      setClient(xmtpClient as unknown as XmtpClientRef);
      setStatus("connected");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to XMTP";
      setError(message);
      setStatus("error");
    }
  }, [walletClient]);

  const disconnect = useCallback(() => {
    clientRef.current = null;
    setClient(null);
    setStatus("disconnected");
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clientRef.current = null;
    };
  }, []);

  // Disconnect if wallet disconnects
  useEffect(() => {
    if (!walletClient && clientRef.current) {
      disconnect();
    }
  }, [walletClient, disconnect]);

  return { client, status, error, connect, disconnect };
}
