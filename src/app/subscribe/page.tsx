import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Subscribe | ClawCoach",
  description:
    "Subscribe to ClawCoach premium tiers with USDC or ETH on Base.",
};

export default function SubscribePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20 text-center">
      <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
        Coming soon
      </Badge>
      <h1 className="text-4xl font-bold tracking-tight">
        Subscriptions launching soon
      </h1>
      <p className="mt-4 max-w-lg text-lg text-muted-foreground">
        Pay monthly with USDC or ETH to unlock premium coaching tiers. In the
        meantime, you can stake $FIT for instant access.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/staking">Stake $FIT Instead</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/pricing">View Pricing</Link>
        </Button>
      </div>
    </div>
  );
}
