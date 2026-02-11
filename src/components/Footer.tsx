import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium">
            Claw<span className="text-primary">Coach</span>
          </span>
          <div className="flex gap-4">
            <Link href="/staking" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Staking
            </Link>
            <Link href="/agent" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Agent
            </Link>
            <Link href="/dashboard" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} alpenflow studios
        </span>
      </div>
    </footer>
  );
}
