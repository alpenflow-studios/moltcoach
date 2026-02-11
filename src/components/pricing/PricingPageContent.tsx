"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Dumbbell, BarChart3, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  TIERS,
  formatFitStake,
  formatUsd,
  getTokenPrice,
  BILLING_LABELS,
  BILLING_SAVINGS,
  type PricingModel,
  type PaymentToken,
  type BillingPeriod,
} from "@/config/pricing";

const TIER_ICONS: Record<number, typeof Dumbbell> = {
  0: Dumbbell,
  1: Zap,
  2: BarChart3,
  3: Crown,
};

export default function PricingPageContent() {
  const [model, setModel] = useState<PricingModel>("stake");
  const [token, setToken] = useState<PaymentToken>("USDC");
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
          Choose your path
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Stake <span className="text-primary">$FIT</span> or subscribe
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Unlock premium coaching by staking $FIT tokens or subscribing with
          USDC&nbsp;/&nbsp;ETH. Same tiers, your choice of access model.
        </p>
      </div>

      {/* Model toggle */}
      <div className="mb-8 flex justify-center">
        <Tabs
          value={model}
          onValueChange={(v) => setModel(v as PricingModel)}
          className="w-auto"
        >
          <TabsList className="grid w-[320px] grid-cols-2">
            <TabsTrigger value="stake">Stake $FIT</TabsTrigger>
            <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Subscription controls — only show in subscribe mode */}
      {model === "subscribe" && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          {/* Token selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pay with:</span>
            <div className="inline-flex rounded-lg border border-border/50 p-0.5">
              {(["USDC", "ETH"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setToken(t)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                    token === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Billing period selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Billed:</span>
            <div className="inline-flex rounded-lg border border-border/50 p-0.5">
              {(["monthly", "quarterly", "annual"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    "relative rounded-md px-3 py-1 text-sm font-medium transition-colors",
                    billing === b
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {BILLING_LABELS[b]}
                  {BILLING_SAVINGS[b] && billing !== b && (
                    <span className="absolute -right-1 -top-2 text-[10px] font-bold text-primary">
                      {BILLING_SAVINGS[b]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tier cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier, i) => {
          const Icon = TIER_ICONS[i] ?? Dumbbell;
          const isStake = model === "stake";

          // Determine the price display
          const priceLabel = isStake
            ? formatFitStake(tier.fitStake)
            : tier.subscription[billing] === 0
              ? "Free"
              : getTokenPrice(tier.subscription[billing], token);

          const priceSubtext = isStake
            ? tier.fitStake > 0
              ? "staked"
              : null
            : tier.subscription[billing] > 0
              ? `/${billing === "monthly" ? "mo" : billing === "quarterly" ? "qtr" : "yr"}`
              : null;

          // CTA
          const ctaText = isStake
            ? tier.fitStake === 0
              ? "Get Started"
              : `Stake ${formatFitStake(tier.fitStake)}`
            : tier.subscription[billing] === 0
              ? "Get Started"
              : `Subscribe — ${formatUsd(tier.subscription[billing])}/${billing === "monthly" ? "mo" : billing === "quarterly" ? "qtr" : "yr"}`;

          const ctaHref = isStake
            ? tier.fitStake === 0
              ? "/agent"
              : "/staking"
            : tier.subscription[billing] === 0
              ? "/agent"
              : "/subscribe";

          return (
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
                <Icon className="size-5 text-primary" />
              </div>

              <h2 className="text-xl font-bold">{tier.name}</h2>

              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {priceLabel}
                </span>
                {priceSubtext && (
                  <span className="text-sm text-muted-foreground">
                    {priceSubtext}
                  </span>
                )}
              </div>

              {/* Show alternate model price as subtext */}
              {!isStake && tier.fitStake > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  or stake {formatFitStake(tier.fitStake)}
                </p>
              )}
              {isStake && tier.subscription.monthly > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  or {formatUsd(tier.subscription.monthly)}/mo subscription
                </p>
              )}

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
                <Link href={ctaHref}>{ctaText}</Link>
              </Button>
            </div>
          );
        })}
      </div>

      {/* How it works — context-aware */}
      <Tabs
        value={model}
        onValueChange={(v) => setModel(v as PricingModel)}
        className="mt-16"
      >
        <TabsContent value="stake">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-8">
            <h2 className="mb-6 text-center text-2xl font-bold">
              How staking works
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <h3 className="mb-2 font-semibold">Earn $FIT</h3>
                <p className="text-sm text-muted-foreground">
                  Complete verified workouts to earn $FIT tokens. Connect
                  wearables for the highest reward multiplier.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Stake for access</h3>
                <p className="text-sm text-muted-foreground">
                  Stake your earned $FIT to unlock premium tiers. No lock-up
                  period — unstake anytime after 30 days with no penalty.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Keep your tokens</h3>
                <p className="text-sm text-muted-foreground">
                  Staked tokens aren&apos;t spent — they&apos;re held in the
                  smart contract. Unstake to withdraw. Early unstake (&lt;30
                  days) has a 5% penalty.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscribe">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-8">
            <h2 className="mb-6 text-center text-2xl font-bold">
              How subscriptions work
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <h3 className="mb-2 font-semibold">Choose your tier</h3>
                <p className="text-sm text-muted-foreground">
                  Pick the plan that fits your goals. Pay monthly, quarterly
                  (save&nbsp;10%), or annually (save&nbsp;20%).
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Pay in USDC or ETH</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribe with USDC (stablecoin, exact pricing) or ETH
                  (approximate rate at time of payment). All on Base.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Still earn $FIT</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribers earn $FIT per workout just like stakers. Stake
                  your earned $FIT later for additional benefits.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
