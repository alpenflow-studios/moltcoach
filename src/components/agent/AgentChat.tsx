"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageSquare, AlertCircle, X } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import type { XmtpClientStatus } from "@/hooks/useXmtpClient";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { XmtpStatus } from "./XmtpStatus";

type AgentChatProps = {
  agentName: string;
  coachingStyle: string;
  walletAddress?: string;
  // Onboarding + persona (from agent sync response)
  agentDbId?: string;
  onboardingComplete?: boolean;
  // Supabase chat persistence
  chatHistory?: ChatMessageType[];
  onSaveMessages?: (userMsg: ChatMessageType, assistantMsg: ChatMessageType) => void;
  // XMTP (all optional — undefined means XMTP not active)
  xmtpStatus?: XmtpClientStatus;
  xmtpError?: string | null;
  xmtpHistory?: ChatMessageType[];
  onXmtpConnect?: () => void;
  onXmtpDisconnect?: () => void;
  onXmtpSendMessage?: (content: string, role: "user" | "assistant") => Promise<void>;
};

const STYLE_GREETINGS: Record<string, string> = {
  motivator:
    "Hey! I'm your coach and I'm pumped to get started. What are your fitness goals? Let's build a plan and crush it!",
  "drill-sergeant":
    "Listen up. I'm here to get you results — no excuses, no shortcuts. Tell me your goal, your experience level, and what equipment you've got. Let's move.",
  scientist:
    "Welcome. I take an evidence-based approach to training. To design an optimal program, I need three data points: your primary goal, training history, and available equipment. Let's start there.",
  friend:
    "Hey there! So glad you're here. I'd love to help you with your fitness journey — no pressure, just good vibes. What are you hoping to work on?",
};

export function AgentChat({
  agentName,
  coachingStyle,
  walletAddress,
  agentDbId,
  onboardingComplete,
  chatHistory,
  onSaveMessages,
  xmtpStatus,
  xmtpError,
  xmtpHistory,
  onXmtpConnect,
  onXmtpDisconnect,
  onXmtpSendMessage,
}: AgentChatProps) {
  // Track onboarding state locally (defaults to false — show onboarding until sync confirms otherwise)
  const [isOnboarded, setIsOnboarded] = useState(onboardingComplete ?? false);

  // Accumulate ALL messages across the session so extraction sees full conversation
  const allMessagesRef = useRef<ChatMessageType[]>([]);

  // Sync when prop changes (e.g., after agent sync response arrives)
  useEffect(() => {
    if (onboardingComplete !== undefined) {
      setIsOnboarded(onboardingComplete);
    }
  }, [onboardingComplete]);

  // Seed the ref from Supabase history when it loads (e.g., on return visit)
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0 && allMessagesRef.current.length === 0) {
      allMessagesRef.current = [...chatHistory];
    }
  }, [chatHistory]);

  // Handle completed message pairs — save to Supabase + mirror to XMTP + extract
  const handleMessageComplete = useCallback(
    (userMsg: ChatMessageType, assistantMsg: ChatMessageType) => {
      // Accumulate messages in ref for extraction
      allMessagesRef.current = [...allMessagesRef.current, userMsg, assistantMsg];

      // Persist to Supabase
      onSaveMessages?.(userMsg, assistantMsg);
      // Mirror to XMTP
      if (onXmtpSendMessage) {
        void onXmtpSendMessage(userMsg.content, "user");
        void onXmtpSendMessage(assistantMsg.content, "assistant");
      }
      // Trigger async persona/memory extraction
      if (agentDbId) {
        void fetch("/api/chat/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentDbId,
            messages: allMessagesRef.current,
            latestUser: userMsg.content,
            latestAssistant: assistantMsg.content,
          }),
        })
          .then((res) => res.json())
          .then((data: { onboardingComplete?: boolean }) => {
            if (data.onboardingComplete && !isOnboarded) {
              setIsOnboarded(true);
              toast.success("Onboarding complete! Your coach now knows you.");
            }
          })
          .catch(() => {});
      }
    },
    [onSaveMessages, onXmtpSendMessage, agentDbId, isOnboarded],
  );

  // Supabase history always loads (includes mid-onboarding conversation).
  // XMTP fallback only when onboarded — prevents stale pre-onboarding XMTP messages.
  const initialMessages =
    chatHistory && chatHistory.length > 0
      ? chatHistory
      : isOnboarded
        ? xmtpHistory
        : undefined;

  const { messages, isStreaming, error, paywall, sendMessage, dismissPaywall } = useChat({
    agentName,
    coachingStyle,
    walletAddress,
    agentDbId,
    initialMessages,
    onMessageComplete: handleMessageComplete,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show errors via toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const greeting = !isOnboarded
    ? `Hey! I'm ${agentName}, your new ClawCoach. Before we start training, I'd love to learn about you. What's your current fitness level — beginner, intermediate, or advanced?`
    : (STYLE_GREETINGS[coachingStyle] ?? STYLE_GREETINGS["motivator"]!);
  const hasMessages = messages.length > 0;
  const showXmtp = xmtpStatus !== undefined;

  return (
    <Card className="flex max-h-[600px] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-5 text-primary" />
          Chat with {agentName}
          {showXmtp && (
            <XmtpStatus
              status={xmtpStatus}
              error={xmtpError ?? null}
              onConnect={onXmtpConnect ?? (() => {})}
              onDisconnect={onXmtpDisconnect ?? (() => {})}
            />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {/* Empty state greeting */}
          {!hasMessages && (
            <ChatMessage
              message={{ role: "assistant", content: greeting }}
              agentName={agentName}
            />
          )}

          {/* Conversation messages */}
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} agentName={agentName} />
          ))}

          <div ref={scrollRef} />
        </div>

        {/* x402 paywall banner */}
        {paywall && (
          <div className="px-6 pb-2">
            <Alert className="border-primary/30 bg-primary/5 relative">
              <AlertCircle className="size-4 text-primary" />
              <AlertTitle>Free tier reached</AlertTitle>
              <AlertDescription>
                <p>
                  You&apos;ve used {paywall.used}/{paywall.limit} free messages.
                  Continue coaching for <strong>$0.01/message</strong> in USDC on Base.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Powered by x402 micro-payments — pay directly from your wallet.
                </p>
              </AlertDescription>
              <button
                onClick={dismissPaywall}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-4" />
              </button>
            </Alert>
          </div>
        )}

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </CardContent>
    </Card>
  );
}
