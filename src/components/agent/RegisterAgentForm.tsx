"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Bot } from "lucide-react";
import { toast } from "sonner";
import { useRegisterAgent } from "@/hooks/useRegisterAgent";

type RegisterAgentFormProps = {
  onSuccess: () => void;
};

const COACHING_STYLES = [
  { id: "motivator", label: "Motivator", description: "High energy, positive reinforcement" },
  { id: "drill-sergeant", label: "Drill Sergeant", description: "Tough love, no excuses" },
  { id: "scientist", label: "Scientist", description: "Data-driven, analytical approach" },
  { id: "friend", label: "Friend", description: "Supportive, conversational, empathetic" },
] as const;

export function RegisterAgentForm({ onSuccess }: RegisterAgentFormProps) {
  const [agentName, setAgentName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const { state, error, startRegister, reset } = useRegisterAgent({ onSuccess });

  const isProcessing = state === "registering" || state === "waiting";
  const canRegister = agentName.trim().length > 0 && selectedStyle.length > 0;

  useEffect(() => {
    if (state === "success") {
      toast.success(`${agentName.trim()} is live!`, {
        description: "Your AI coaching agent has been created on-chain.",
      });
      const timer = setTimeout(() => {
        reset();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRegister() {
    if (!canRegister) return;
    // Build a simple agent URI with the coaching profile
    const agentURI = `data:application/json,${encodeURIComponent(
      JSON.stringify({
        name: agentName.trim(),
        type: "moltcoach",
        style: selectedStyle,
        version: "1.0.0",
        category: "fitness",
      }),
    )}`;
    startRegister(agentURI);
  }

  function getButtonLabel(): string {
    switch (state) {
      case "registering":
        return "Confirm in wallet...";
      case "waiting":
        return "Creating agent...";
      case "success":
        return "Agent Created!";
      case "error":
        return "Try again";
      default:
        return "Create My Agent";
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            Agent Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input
              id="agent-name"
              type="text"
              placeholder="e.g. Coach Rex, Iron Will..."
              value={agentName}
              onChange={(e) => {
                setAgentName(e.target.value);
                if (state === "error") reset();
              }}
              disabled={isProcessing || state === "success"}
              maxLength={32}
            />
            <p className="text-xs text-muted-foreground">
              Give your AI coach a name. This is stored on-chain.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Coaching Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {COACHING_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    setSelectedStyle(style.id);
                    if (state === "error") reset();
                  }}
                  disabled={isProcessing || state === "success"}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedStyle === style.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30"
                  } disabled:opacity-50`}
                >
                  <p className="text-sm font-medium">{style.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={state === "error" ? reset : handleRegister}
            disabled={(state === "idle" && !canRegister) || isProcessing || state === "success"}
          >
            {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
            {state === "success" && <Sparkles className="mr-2 size-4" />}
            {getButtonLabel()}
          </Button>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Bot className="size-10 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">
              {agentName.trim() || "Your Agent"}
            </p>
            {selectedStyle && (
              <Badge variant="outline" className="mt-2 text-primary">
                {COACHING_STYLES.find((s) => s.id === selectedStyle)?.label}
              </Badge>
            )}
          </div>
          <div className="mt-4 w-full space-y-2 rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground">On-Chain Identity</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">ERC-8004</Badge>
              <Badge variant="secondary" className="text-xs">Base Sepolia</Badge>
              <Badge variant="secondary" className="text-xs">Fitness</Badge>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Your agent will be minted as an NFT on Base, giving it a permanent
            on-chain identity with ERC-8004.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
