import type { Metadata } from "next";
import { HubPageContent } from "@/components/hub/HubPageContent";

export const metadata: Metadata = {
  title: "Agent Hub | ClawCoach",
  description:
    "Explore registered ClawCoach agents on Base. Autonomous AI agents with on-chain identity (ERC-8004) and cryptographic authentication (ERC-8128).",
};

export default function HubPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <HubPageContent />
    </div>
  );
}
