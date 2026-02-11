import { Bot, Globe, ShieldCheck } from "lucide-react";

type HubStatsBarProps = {
  totalAgents: number;
};

export function HubStatsBar({ totalAgents }: HubStatsBarProps) {
  const stats = [
    {
      label: "Total Agents",
      value: totalAgents.toString(),
      icon: Bot,
    },
    {
      label: "ERC-8128 Verified",
      value: "0",
      icon: ShieldCheck,
    },
    {
      label: "Network",
      value: "Base Sepolia",
      icon: Globe,
    },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border/50 bg-card p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <stat.icon className="size-4" />
            <span className="text-xs">{stat.label}</span>
          </div>
          <p className="mt-1 font-mono text-lg font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
