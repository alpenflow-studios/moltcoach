"use client";

import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

type ChatMessageProps = {
  message: ChatMessageType;
  agentName: string;
};

export function ChatMessage({ message, agentName }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="size-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted",
        )}
      >
        {!isUser && (
          <p className="mb-1 text-xs font-medium text-primary">{agentName}</p>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
          {!isUser && message.content === "" && (
            <span className="inline-block animate-pulse">...</span>
          )}
        </div>
      </div>
    </div>
  );
}
