import type { Metadata } from "next";
import { StakingPageContent } from "@/components/staking/StakingPageContent";

export const metadata: Metadata = {
  title: "Stake $FIT | ClawCoach",
  description: "Stake $FIT tokens to unlock premium coaching tiers and features.",
};

export default function StakingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <StakingPageContent />
    </div>
  );
}
