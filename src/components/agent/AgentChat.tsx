"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

type AgentChatProps = {
  agentName: string;
  coachingStyle: string;
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

export function AgentChat({ agentName, coachingStyle }: AgentChatProps) {
  const { messages, isStreaming, error, sendMessage } = useChat({
    agentName,
    coachingStyle,
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

  const greeting =
    STYLE_GREETINGS[coachingStyle] ?? STYLE_GREETINGS["motivator"]!;
  const hasMessages = messages.length > 0;

  return (
    <Card className="flex max-h-[600px] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-5 text-primary" />
          Chat with {agentName}
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

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </CardContent>
    </Card>
  );
}
