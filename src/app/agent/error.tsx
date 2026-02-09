"use client";

import { Button } from "@/components/ui/button";

export default function AgentError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-muted-foreground">
        There was an error loading the agent page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
