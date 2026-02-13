"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const ConnectWallet = dynamic(
  () => import("@/components/ConnectWallet").then((m) => m.ConnectWallet),
  { ssr: false },
);
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { useAgentReads } from "@/hooks/useAgentReads";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useXmtpClient } from "@/hooks/useXmtpClient";
import { useXmtpConversation } from "@/hooks/useXmtpConversation";
import { parseAgentURI } from "@/lib/agentURI";
import { parseContractError } from "@/lib/contractErrors";
import { RegisterAgentForm } from "./RegisterAgentForm";
import { AgentProfileCard } from "./AgentProfileCard";
import { AgentChat } from "./AgentChat";
import { LinkTelegram } from "./LinkTelegram";

export function AgentPageContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const data = useAgentReads(address);
  const searchParams = useSearchParams();

  // Supabase chat history (loads on mount, provides save function)
  const agentIdNum = data.agentId ? Number(data.agentId) : undefined;
  const chatHistory = useChatHistory({
    walletAddress: address,
    agentIdOnchain: agentIdNum,
  });

  // XMTP lifecycle (hooks called unconditionally per React rules)
  const {
    client: xmtpClient,
    status: xmtpStatus,
    error: xmtpError,
    connect: xmtpConnect,
    disconnect: xmtpDisconnect,
  } = useXmtpClient();
  const xmtpConvo = useXmtpConversation(xmtpClient);

  // Agent identity from Supabase (captured from sync response)
  const [agentDbId, setAgentDbId] = useState<string | undefined>();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | undefined>();

  // Sync agent to Supabase when loaded (idempotent — runs once per agent)
  const agentSyncedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!data.hasAgent || !address || !data.agentURI) return;
    const key = `${address}-${data.agentId}`;
    if (agentSyncedRef.current === key) return;
    agentSyncedRef.current = key;

    const parsed = parseAgentURI(data.agentURI);
    void fetch("/api/agents/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: address,
        agentIdOnchain: Number(data.agentId),
        name: parsed?.name ?? "Coach",
        coachingStyle: parsed?.style ?? "motivator",
        agentUri: data.agentURI,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((agent: { id: string; onboarding_complete: boolean } | null) => {
        if (agent) {
          setAgentDbId(agent.id);
          setOnboardingComplete(agent.onboarding_complete);
        }
      })
      .catch(() => {});
  }, [data.hasAgent, data.agentId, data.agentURI, address]);

  // Auto-connect XMTP when arriving from landing page (?xmtp=1)
  const autoConnectXmtp = searchParams.get("xmtp") === "1";
  useEffect(() => {
    if (autoConnectXmtp && data.hasAgent && xmtpStatus === "disconnected") {
      void xmtpConnect();
    }
  }, [autoConnectXmtp, data.hasAgent, xmtpStatus, xmtpConnect]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <h2 className="text-2xl font-bold">Connect your wallet</h2>
        <p className="max-w-md text-muted-foreground">
          Connect a Coinbase Smart Wallet to create your on-chain coaching agent
          powered by ERC-8004.
        </p>
        <ConnectWallet size="lg" />
      </div>
    );
  }

  if (isConnected && chainId !== baseSepolia.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <AlertTriangle className="size-10 text-yellow-500" />
        <h2 className="text-2xl font-bold">Wrong Network</h2>
        <p className="max-w-md text-muted-foreground">
          ClawCoach runs on Base Sepolia. Please switch your wallet to continue.
        </p>
        <Button
          size="lg"
          onClick={() => switchChain({ chainId: baseSepolia.id })}
        >
          Switch to Base Sepolia
        </Button>
      </div>
    );
  }

  if (data.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <AlertTriangle className="size-10 text-destructive" />
        <h2 className="text-2xl font-bold">Failed to load agent data</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {parseContractError(data.error)}
        </p>
        <Button onClick={data.refetchAll}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your <span className="text-primary">ClawCoach</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {data.hasAgent
            ? "Manage your on-chain coaching agent."
            : "Create your personalized AI coaching agent on Base."}
        </p>
      </div>

      {data.hasAgent ? (
        <>
          <AgentProfileCard
            agentId={data.agentId}
            agentURI={data.agentURI}
            ownerAddress={address!}
          />
          {(() => {
            const parsed = parseAgentURI(data.agentURI);
            const name = parsed?.name ?? "Coach";
            const style = parsed?.style ?? "motivator";
            return (
              <AgentChat
                agentName={name}
                coachingStyle={style}
                walletAddress={address}
                agentDbId={agentDbId}
                onboardingComplete={onboardingComplete}
                chatHistory={chatHistory.history}
                onSaveMessages={chatHistory.saveMessages}
                xmtpStatus={xmtpStatus}
                xmtpError={xmtpError}
                xmtpHistory={xmtpConvo.history}
                onXmtpConnect={xmtpConnect}
                onXmtpDisconnect={xmtpDisconnect}
                onXmtpSendMessage={xmtpConvo.sendMessage}
              />
            );
          })()}
          <LinkTelegram walletAddress={address!} />
        </>
      ) : (
        <RegisterAgentForm onSuccess={data.refetchAll} />
      )}
    </div>
  );
}
