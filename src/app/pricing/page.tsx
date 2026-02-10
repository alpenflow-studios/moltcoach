import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Dumbbell, BarChart3, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing | moltcoach",
  description:
    "Stake $FIT to unlock premium coaching tiers. No subscriptions — stake once, keep access as long as you hold.",
};

const TIERS = [
  {
    name: "Free",
    stake: "0",
    icon: Dumbbell,
    description: "Start your journey with core coaching features.",
    features: [
      "AI coaching chat",
      "Manual workout entry",
      "Basic progress tracking",
      "Web dashboard access",
      "Earn $FIT per workout",
    ],
    cta: "Get Started",
    href: "/agent",
    highlighted: false,
  },
  {
    name: "Basic",
    stake: "100",
    icon: Zap,
    description: "Connect your wearables for verified tracking.",
    features: [
      "Everything in Free",
      "Wearable API integration",
      "Strava, Apple Health, Garmin",
      "Auto-validated workouts",
      "Higher reward multiplier",
    ],
    cta: "Stake 100 FIT",
    href: "/staking",
    highlighted: false,
  },
  {
    name: "Pro",
    stake: "1,000",
    icon: BarChart3,
    description: "Advanced analytics and nutrition guidance.",
    features: [
      "Everything in Basic",
      "Advanced performance analytics",
      "Nutrition guidance",
      "Priority coach responses",
      "Workout plan generation",
    ],
    cta: "Stake 1,000 FIT",
    href: "/staking",
    highlighted: true,
  },
  {
    name: "Elite",
    stake: "10,000",
    icon: Crown,
    description: "Full suite with exclusive features and early access.",
    features: [
      "Everything in Pro",
      "Early access to new features",
      "Custom agent skills",
      "Exclusive community access",
      "Shape the product roadmap",
    ],
    cta: "Stake 10,000 FIT",
    href: "/staking",
    highlighted: false,
  },
] as const;

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4 text-primary border-primary/30">
          Stake to unlock
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          No subscriptions. Just <span className="text-primary">$FIT</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Stake $FIT tokens to unlock premium tiers. Your tokens stay yours — unstake
          anytime to get them back. Earn $FIT by completing workouts.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative flex flex-col rounded-xl border p-6 transition-colors",
              tier.highlighted
                ? "border-primary/50 bg-primary/5"
                : "border-border/50 bg-card hover:border-primary/20",
            )}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <tier.icon className="size-5 text-primary" />
            </div>

            <h2 className="text-xl font-bold">{tier.name}</h2>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">
                {tier.stake}
              </span>
              <span className="text-sm text-muted-foreground">$FIT staked</span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              {tier.description}
            </p>

            <ul className="my-6 flex-1 space-y-2.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={tier.highlighted ? "default" : "outline"}
              className="w-full"
              asChild
            >
              <Link href={tier.href}>{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ / explainer */}
      <div className="mt-16 rounded-xl border border-border/50 bg-muted/30 p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">How staking works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="mb-2 font-semibold">Earn $FIT</h3>
            <p className="text-sm text-muted-foreground">
              Complete verified workouts to earn $FIT tokens. Connect wearables for
              the highest reward multiplier.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Stake for access</h3>
            <p className="text-sm text-muted-foreground">
              Stake your earned $FIT to unlock premium tiers. No lock-up period — unstake
              anytime after 30 days with no penalty.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Keep your tokens</h3>
            <p className="text-sm text-muted-foreground">
              Staked tokens aren&apos;t spent — they&apos;re held in the smart contract.
              Unstake to withdraw. Early unstake (&lt;30 days) has a 5% penalty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
