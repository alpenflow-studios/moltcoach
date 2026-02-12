import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Button } from "@/components/ui/button";
import { Fingerprint, Zap, Sparkles, ArrowRight, Send, MessageCircle } from "lucide-react";

function FarcasterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" />
      <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
      <path d="M693.333 746.667C681.06 746.667 671.111 756.616 671.111 768.889V795.556H666.667C654.394 795.556 644.444 805.505 644.444 817.778V844.445H893.333V817.778C893.333 805.505 883.384 795.556 871.111 795.556H866.667V768.889C866.667 756.616 856.717 746.667 844.444 746.667V351.111H868.889L897.778 253.333H720V746.667H693.333Z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Fingerprint,
    title: "On-Chain Identity",
    description:
      "Your coach lives on the blockchain via ERC-8004. A persistent identity with personality, reputation, and memory — it knows you, and grows with you. Chat via XMTP or Telegram, wherever you are.",
  },
  {
    icon: Zap,
    title: "Move to Earn",
    description:
      "Track workouts, earn $CLAWC tokens. Stake for enhanced coaching features. Connect your wearable, upload a screenshot, or log manually — your effort, your proof, your reward.",
  },
  {
    icon: Sparkles,
    title: "Personalized Coaching",
    description:
      "AI that adapts to your style, goals, rhythm, and life. Not a generic chatbot — a coach that knows and grows with you.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        {/* Orb — layered breathing glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 sm:h-[600px] sm:w-[600px]"
        >
          {/* Core green glow */}
          <div
            className="absolute inset-0 rounded-full blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, oklch(0.768 0.233 130.85 / 0.6) 0%, oklch(0.768 0.233 130.85 / 0.15) 40%, transparent 70%)",
              animation: "orb-breathe 6s ease-in-out infinite",
            }}
          />
          {/* White halo — offset cycle */}
          <div
            className="absolute inset-0 rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, oklch(1 0 0 / 0.35) 0%, oklch(1 0 0 / 0.08) 35%, transparent 65%)",
              animation: "orb-drift 8s ease-in-out infinite",
            }}
          />
          {/* Outer green ring — slow rotation */}
          <div
            className="absolute -inset-12 rounded-full blur-[80px]"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(0.768 0.233 130.85 / 0.12), transparent 30%, oklch(0.768 0.233 130.85 / 0.08), transparent 60%, oklch(1 0 0 / 0.06), transparent 90%)",
              animation: "orb-rotate 20s linear infinite",
            }}
          />
        </div>

        <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-[#8A63D2]/20 bg-[#8A63D2]/10 px-3 py-1 text-xs text-[#8A63D2]">
          <FarcasterIcon className="size-3" />
          Forged on Farcaster
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Your AI Coach.
          <br />
          <span className="text-primary">On-Chain.</span>
        </h1>
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
          <Zap className="size-3" />
          Built on Base with ERC-8004
        </div>
        <p className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Your personalized coaching agent that lives on the blockchain. Track
          workouts, earn $CLAWC rewards, and own a coach that knows and grows
          with you — starting with fitness, expanding everywhere.
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button variant="outline" size="lg" className="rounded-full text-base" asChild>
            <Link href="/agent">I AM HUMAN</Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full text-base" asChild>
            <Link href="/hub">I AM NOT</Link>
          </Button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <ConnectWallet size="lg" />
          <Button variant="outline" size="lg" className="rounded-full text-base" asChild>
            <Link href="/staking">Start Staking</Link>
          </Button>
        </div>
      </section>

      <div className="flex justify-center pb-16">
        <Button size="lg" className="rounded-full px-10 py-6 text-lg font-semibold" asChild>
          <Link href="/staking">Purchase $CLAWC</Link>
        </Button>
      </div>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto max-w-2xl text-center text-muted-foreground">
            Connect your wallet. Mint your coach. Start earning.
          </p>
          <p className="mx-auto mb-16 mt-2 max-w-2xl text-center text-sm text-muted-foreground/70">
            Don&apos;t have a wallet?{" "}
            <button type="button" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Sign up with your email
            </button>{" "}
            and we&apos;ll create one for you.
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

      {/* Comms */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
        <h2 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
          Talk to your coach on{" "}
          <span className="text-primary">your terms</span>
        </h2>
        <div className="flex items-center justify-center gap-5">
          <Button variant="outline" size="lg" className="rounded-full text-base" asChild>
            <Link href="/agent?xmtp=1">
              <MessageCircle className="size-4" />
              XMTP
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full text-base" asChild>
            <a href={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "https://t.me/ClawCoachBot"} target="_blank" rel="noopener noreferrer">
              <Send className="size-4" />
              Telegram
            </a>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to meet your{" "}
          <span className="text-primary">ClawCoach</span>?
        </h2>
        <p className="mt-4 text-muted-foreground">
          A coach that knows and grows with you — connect your wallet to get started.
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
