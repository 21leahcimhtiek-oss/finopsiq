"use client";
import { useState } from "react";
import { AlertTriangle, TrendingUp, CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import type { Anomaly } from "@/types";

function getSeverity(deviationPct: number): { label: string; className: string } {
  const abs = Math.abs(deviationPct);
  if (abs >= 100) return { label: "Critical", className: "bg-red-100 text-red-800 border-red-200" };
  if (abs >= 50) return { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" };
  if (abs >= 25) return { label: "Medium", className: "bg-amber-100 text-amber-800 border-amber-200" };
  return { label: "Low", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
}

interface AnomalyCardProps {
  anomaly: Anomaly & { cloud_accounts?: { name: string; provider: string } | null };
}

export default function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const [acknowledging, setAcknowledging] = useState(false);
  const [status, setStatus] = useState(anomaly.status);
  const severity = getSeverity(anomaly.deviation_pct);

  const acknowledge = async () => {
    setAcknowledging(true);
    const res = await fetch(`/api/anomalies/${anomaly.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "acknowledged" }),
    });
    if (res.ok) setStatus("acknowledged");
    setAcknowledging(false);
  };

  return (
    <div className={clsx("bg-white rounded-xl border p-5", status === "open" ? "border-amber-200" : "border-gray-200")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={clsx("w-5 h-5", status === "open" ? "text-amber-500" : "text-gray-400")} />
          <div>
            <h3 className="font-semibold text-gray-900">{anomaly.service}</h3>
            {anomaly.cloud_accounts && (
              <p className="text-xs text-gray-500">{anomaly.cloud_accounts.name} ({anomaly.cloud_accounts.provider.toUpperCase()})</p>
            )}
          </div>
        </div>
        <span className={clsx("text-xs font-medium px-2 py-1 rounded-full border", severity.className)}>
          {severity.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Expected</p>
          <p className="font-semibold text-gray-900">${Number(anomaly.expected_daily_usd).toFixed(2)}/day</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Actual</p>
          <p className="font-semibold text-gray-900">${Number(anomaly.actual_daily_usd).toFixed(2)}/day</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Deviation</p>
          <p className={clsx("font-semibold flex items-center gap-1", anomaly.deviation_pct > 0 ? "text-red-600" : "text-green-600")}>
            <TrendingUp className="w-3 h-3" />
            {anomaly.deviation_pct > 0 ? "+" : ""}{Number(anomaly.deviation_pct).toFixed(1)}%
          </p>
        </div>
      </div>

      {anomaly.ai_explanation && (
        <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 leading-relaxed">
          {anomaly.ai_explanation}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{new Date(anomaly.detected_at).toLocaleString()}</span>
        {status === "open" && (
          <button onClick={acknowledge} disabled={acknowledging}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
            <CheckCheck className="w-3 h-3" />
            {acknowledging ? "..." : "Acknowledge"}
          </button>
        )}
        {status === "acknowledged" && (
          <span className="text-xs text-gray-500 flex items-center gap-1"><CheckCheck className="w-3 h-3" /> Acknowledged</span>
        )}
      </div>
    </div>
  );
}