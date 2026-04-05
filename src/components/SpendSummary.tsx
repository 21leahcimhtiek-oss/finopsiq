import { TrendingUp, TrendingDown, DollarSign, Zap } from "lucide-react";
import { clsx } from "clsx";

interface SpendSummaryProps {
  totalSpend: number;
  momChangePct: number;
  savingsFound: number;
  anomaliesCount: number;
}

export default function SpendSummary({ totalSpend, momChangePct, savingsFound, anomaliesCount }: SpendSummaryProps) {
  const isIncrease = momChangePct > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Total Spend</span>
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          ${totalSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-gray-500 mt-1">This month</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">vs Last Month</span>
          <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", isIncrease ? "bg-red-50" : "bg-green-50")}>
            {isIncrease ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-green-500" />}
          </div>
        </div>
        <p className={clsx("text-2xl font-bold", isIncrease ? "text-red-600" : "text-green-600")}>
          {isIncrease ? "+" : ""}{momChangePct.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-500 mt-1">Month-over-month</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Savings Found</span>
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-green-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-green-600">
          ${savingsFound.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-gray-500 mt-1">Monthly potential</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Anomalies</span>
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{anomaliesCount}</p>
        <p className="text-xs text-gray-500 mt-1">Open anomalies</p>
      </div>
    </div>
  );
}