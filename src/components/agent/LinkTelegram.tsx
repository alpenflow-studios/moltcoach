"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Check, MessageCircle } from "lucide-react";

type LinkTelegramProps = {
  walletAddress: `0x${string}`;
};

export function LinkTelegram({ walletAddress }: LinkTelegramProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate code");
      }
      const data = (await res.json()) as { code: string };
      setCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  function copyCommand() {
    if (!code) return;
    void navigator.clipboard.writeText(`/connect ${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-5 text-[#26A5E4]" />
          Link Telegram
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!code ? (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your Telegram to sync coaching history and $CLAWC rewards
              across platforms.
            </p>
            <Button
              onClick={generateCode}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Generate Link Code
            </Button>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </>
        ) : (
          <>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="mb-2 text-xs text-muted-foreground">
                Send this to @ClawCoachBot on Telegram:
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="font-mono text-lg tracking-widest"
                >
                  /connect {code}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={copyCommand}
                >
                  {copied ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Code expires in 10 minutes
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <a
                  href="https://t.me/ClawCoachBot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Telegram Bot
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateCode}
                disabled={loading}
              >
                New Code
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
