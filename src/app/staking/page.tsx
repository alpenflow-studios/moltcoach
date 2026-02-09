import type { Metadata } from "next";
import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";
import { StakingPageContent } from "@/components/staking/StakingPageContent";

export const metadata: Metadata = {
  title: "Stake $FIT | moltcoach",
  description: "Stake $FIT tokens to unlock premium coaching tiers and features.",
};

export default function StakingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            molt<span className="text-primary">coach</span>
          </Link>
          <ConnectWallet />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <StakingPageContent />
      </main>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-sm text-muted-foreground">
            molt<span className="text-primary">coach</span>
          </span>
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} alpenflow studios
          </span>
        </div>
      </footer>
    </div>
  );
}
