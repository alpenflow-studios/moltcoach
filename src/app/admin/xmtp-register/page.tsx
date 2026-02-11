"use client";

import { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { toBytes } from "viem";
import { XMTP_ENV } from "@/config/xmtp";

/**
 * One-time admin page to register the ClawCoach agent on the XMTP V3 network.
 *
 * How it works:
 * 1. Paste the agent's private key (from .env.local CLAWCOACH_AGENT_XMTP_KEY)
 * 2. Click "Register" — runs Client.create() in the browser (avoids WASM/Node issues)
 * 3. On success, the agent address is reachable on XMTP
 *
 * DELETE THIS PAGE after registration is complete.
 */
export default function XmtpRegisterPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleRegister() {
    if (!key.startsWith("0x") || key.length < 66) {
      setStatus("error");
      setMessage("Invalid private key. Must start with 0x and be 66 characters.");
      return;
    }

    setStatus("loading");
    setMessage("Creating XMTP V3 identity (this requires no wallet signature)...");

    try {
      const account = privateKeyToAccount(key as `0x${string}`);

      // V3 signer: type, getIdentifier, signMessage returning Uint8Array
      const signer = {
        type: "EOA" as const,
        getIdentifier: () => ({
          identifier: account.address.toLowerCase(),
          identifierKind: 0, // IdentifierKind.Ethereum
        }),
        signMessage: async (msg: string): Promise<Uint8Array> => {
          const signature = await account.signMessage({ message: msg });
          return toBytes(signature);
        },
      };

      const { Client } = await import("@xmtp/browser-sdk");
      const client = await Client.create(signer, { env: XMTP_ENV });

      setStatus("success");
      setMessage(
        `Agent registered on XMTP V3!\n\nAddress: ${account.address}\nInbox ID: ${client.inboxId}\nEnvironment: ${XMTP_ENV}\n\nUsers can now open conversations with this address. You can delete this page.`
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">XMTP Agent Registration</h1>
          <p className="text-zinc-400 text-sm mt-1">
            One-time registration of the ClawCoach agent on the XMTP V3 {XMTP_ENV} network.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-zinc-300">
            Agent Private Key (from .env.local)
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
            disabled={status === "loading" || status === "success"}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={status === "loading" || status === "success" || !key}
          className="w-full rounded-md bg-lime-500 px-4 py-2 font-medium text-black hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Registering..." : status === "success" ? "Done" : "Register Agent on XMTP"}
        </button>

        {message && (
          <pre
            className={`rounded-md p-3 text-sm whitespace-pre-wrap ${
              status === "success"
                ? "bg-lime-500/10 text-lime-400 border border-lime-500/30"
                : status === "error"
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {message}
          </pre>
        )}

        <p className="text-xs text-zinc-600">
          The private key never leaves your browser. This page should be deleted after use.
        </p>
      </div>
    </div>
  );
}
