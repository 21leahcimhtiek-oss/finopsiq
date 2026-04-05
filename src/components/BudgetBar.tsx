import { Budget } from "@/types";
import { calculateBudgetUsage, formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  budget: Budget;
}

export default function BudgetBar({ budget }: Props) {
  const { percentage, status, remaining } = calculateBudgetUsage(
    Number(budget.current_spend_usd),
    Number(budget.monthly_limit_usd)
  );

  const barColor = {
    healthy: "bg-green-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
  }[status];

  const statusBadge = {
    healthy: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    critical: "bg-red-50 text-red-700",
  }[status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{budget.name}</h3>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", statusBadge)}>
          {status}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className={cn("h-2 rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {formatCurrency(Number(budget.current_spend_usd))} of {formatCurrency(Number(budget.monthly_limit_usd))}
        </span>
        <span className={cn("font-semibold", status === "critical" ? "text-red-600" : "text-gray-700")}>
          {formatPercent(percentage)}
        </span>
      </div>

      {remaining > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          {formatCurrency(remaining)} remaining
        </p>
      )}

      {percentage >= budget.alert_at_percent && (
        <div className="mt-3 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg">
          Alert threshold reached ({formatPercent(budget.alert_at_percent)})
        </div>
      )}
    </div>
  );
}