"use client";
import { clsx } from "clsx";
import type { Budget } from "@/types";

interface BudgetProgressProps {
  budget: Budget;
  currentSpend: number;
}

export default function BudgetProgress({ budget, currentSpend }: BudgetProgressProps) {
  const pct = budget.amount_usd > 0 ? Math.min((currentSpend / Number(budget.amount_usd)) * 100, 100) : 0;
  const isWarning = pct >= budget.alert_threshold_pct && pct < 100;
  const isExceeded = pct >= 100;

  const barColor = isExceeded ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-blue-500";
  const borderColor = isExceeded ? "border-red-200" : isWarning ? "border-amber-200" : "border-gray-200";

  return (
    <div className={clsx("bg-white rounded-xl border p-5", borderColor)}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{budget.name}</h3>
        {isExceeded && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Exceeded</span>}
        {isWarning && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Alert</span>}
      </div>

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600 capitalize">{budget.scope_type}{budget.scope_value ? `: ${budget.scope_value}` : ""}</span>
        <span className="font-medium text-gray-900 capitalize">{budget.period}</span>
      </div>

      <div className="relative w-full bg-gray-200 rounded-full h-3 mb-2">
        <div className={clsx("h-3 rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
        {/* Alert threshold marker */}
        <div
          className="absolute top-0 h-3 w-0.5 bg-gray-500 opacity-60"
          style={{ left: `${budget.alert_threshold_pct}%` }}
          title={`Alert at ${budget.alert_threshold_pct}%`}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={clsx("font-semibold", isExceeded ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-700")}>
          ${currentSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })} / ${Number(budget.amount_usd).toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </span>
        <span className="text-gray-500">{pct.toFixed(1)}% used</span>
      </div>
    </div>
  );
}