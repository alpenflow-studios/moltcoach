import type { Metadata } from "next";
import PricingPageContent from "@/components/pricing/PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing | ClawCoach",
  description:
    "Stake $CLAWC or subscribe with USDC/ETH to unlock premium coaching tiers. Two paths, same great features.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
