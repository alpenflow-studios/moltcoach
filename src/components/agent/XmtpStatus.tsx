"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, Wifi, WifiOff, AlertCircle } from "lucide-react";
import type { XmtpClientStatus } from "@/hooks/useXmtpClient";

type XmtpStatusProps = {
  status: XmtpClientStatus;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
};

const STATUS_CONFIG: Record<
  XmtpClientStatus,
  {
    icon: typeof Wifi;
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  disconnected: { icon: WifiOff, label: "XMTP Off", variant: "outline" },
  connecting: { icon: Loader2, label: "Connecting...", variant: "secondary" },
  connected: { icon: Wifi, label: "XMTP", variant: "default" },
  error: { icon: AlertCircle, label: "XMTP Error", variant: "destructive" },
};

export function XmtpStatus({ status, error, onConnect, onDisconnect }: XmtpStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  if (status === "disconnected") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onConnect}
        className="ml-auto gap-1.5 text-xs"
      >
        <MessageCircle className="size-3" />
        Connect XMTP
      </Button>
    );
  }

  return (
    <Badge
      variant={config.variant}
      className="ml-auto cursor-pointer gap-1.5"
      onClick={status === "connected" ? onDisconnect : onConnect}
      title={error ?? undefined}
    >
      <Icon className={`size-3 ${status === "connecting" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
