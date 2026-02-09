import type { Metadata } from "next";
import { AgentPageContent } from "@/components/agent/AgentPageContent";

export const metadata: Metadata = {
  title: "Your Agent | moltcoach",
  description: "Create and manage your on-chain AI coaching agent powered by ERC-8004.",
};

export default function AgentPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <AgentPageContent />
    </div>
  );
}
