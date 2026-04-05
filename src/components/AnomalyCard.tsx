import { Anomaly } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUpIcon } from "lucide-react";

interface Props {
  anomaly: Anomaly;
}

function getSeverity(deviationPct: number): { label: string; color: string; bg: string } {
  if (deviationPct >= 200) return { label: "Critical", color: "text-red-700", bg: "bg-red-100" };
  if (deviationPct >= 100) return { label: "High", color: "text-orange-700", bg: "bg-orange-100" };
  if (deviationPct >= 50) return { label: "Medium", color: "text-amber-700", bg: "bg-amber-100" };
  return { label: "Low", color: "text-yellow-700", bg: "bg-yellow-100" };
}

export default function AnomalyCard({ anomaly }: Props) {
  const severity = getSeverity(Number(anomaly.deviation_pct));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUpIcon className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900">{anomaly.service}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severity.bg} ${severity.color}`}>
              {severity.label}
            </span>
            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold">
              +{Number(anomaly.deviation_pct).toFixed(1)}%
            </span>
          </div>

          <div className="flex gap-4 text-sm text-gray-500 mb-3">
            <span>
              Actual: <span className="font-semibold text-gray-700">{formatCurrency(Number(anomaly.spend_actual))}</span>
            </span>
            <span>
              Expected: <span className="font-semibold text-gray-700">{formatCurrency(Number(anomaly.spend_expected))}</span>
            </span>
          </div>

          {anomaly.ai_explanation && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium text-blue-900 mb-1">AI Analysis</p>
              <p>{anomaly.ai_explanation}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            Detected {formatDate(anomaly.detected_at, "MMM d, yyyy 'at' h:mm a")}
            {anomaly.cloud_account && ` · ${anomaly.cloud_account.account_name}`}
          </p>
        </div>
      </div>
    </div>
  );
}