import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Button } from "@/components/ui/button";
import { Fingerprint, Zap, Sparkles, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Fingerprint,
    title: "On-Chain Identity",
    description:
      "Your coach lives on the blockchain via ERC-8004. A persistent identity with personality, reputation, and memory that belongs to you.",
  },
  {
    icon: Zap,
    title: "Move to Earn",
    description:
      "Track workouts, earn $FIT tokens. Stake for enhanced coaching features. Your effort has real value.",
  },
  {
    icon: Sparkles,
    title: "Personalized Coaching",
    description:
      "AI that adapts to your style, goals, and rhythm. Not a generic chatbot — a coach that knows you.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Zap className="size-3.5" />
          Built on Base with ERC-8004
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Your AI Coach.
          <br />
          <span className="text-primary">On-Chain.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          A personalized coaching agent that lives on the blockchain. Track
          workouts, earn $FIT rewards, and own a coach that actually knows
          you — starting with fitness, expanding everywhere.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <ConnectWallet size="lg" />
          <Button variant="outline" size="lg" className="text-base" asChild>
            <Link href="/staking">Start Staking</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-center text-muted-foreground">
            Connect your wallet. Mint your coach. Start earning.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border/50 bg-card p-8 transition-colors hover:border-primary/30"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to meet your{" "}
          <span className="text-primary">moltcoach</span>?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Connect a Coinbase Smart Wallet on Base to get started.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <ConnectWallet size="lg" />
          <Button variant="ghost" size="lg" className="text-base" asChild>
            <Link href="/agent">
              Create Your Agent <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
