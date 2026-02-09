import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | moltcoach",
  description: "Your moltcoach dashboard — agent, staking, and activity at a glance.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <DashboardContent />
    </div>
  );
}
