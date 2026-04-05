"use client";
import { clsx } from "clsx";
import type { OrgPlan } from "@/types";

const PLAN_BADGES: Record<OrgPlan, { label: string; className: string }> = {
  starter: { label: "Starter", className: "bg-gray-100 text-gray-700" },
  pro: { label: "Pro", className: "bg-blue-100 text-blue-700" },
  enterprise: { label: "Enterprise", className: "bg-purple-100 text-purple-700" },
};

interface OrgSwitcherProps {
  orgName: string;
  plan: OrgPlan;
}

export default function OrgSwitcher({ orgName, plan }: OrgSwitcherProps) {
  const badge = PLAN_BADGES[plan];
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
        {orgName[0]?.toUpperCase() ?? "O"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{orgName}</p>
      </div>
      <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full", badge.className)}>
        {badge.label}
      </span>
    </div>
  );
}