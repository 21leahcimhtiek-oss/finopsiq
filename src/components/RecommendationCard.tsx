"use client";
import { useState } from "react";
import { TrendingDown, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Recommendation } from "@/types";

interface RecommendationCardProps {
  recommendation: Recommendation & { cloud_accounts?: { name: string; provider: string } | null };
}

export default function RecommendationCard({ recommendation: rec }: RecommendationCardProps) {
  const [status, setStatus] = useState(rec.status);
  const [loading, setLoading] = useState<"implementing" | "dismissed" | null>(null);

  const updateStatus = async (newStatus: "implementing" | "dismissed") => {
    setLoading(newStatus);
    const res = await fetch(`/api/recommendations/${rec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{rec.resource_type}</span>
            {rec.region && <span className="text-xs text-gray-500">{rec.region}</span>}
          </div>
          <p className="text-xs font-mono text-gray-500 truncate max-w-xs">{rec.resource_id}</p>
          {rec.cloud_accounts && (
            <p className="text-xs text-gray-400 mt-0.5">{rec.cloud_accounts.name}</p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600 font-bold">
            <TrendingDown className="w-4 h-4" />
            <span>${Number(rec.savings_usd).toFixed(2)}/mo</span>
          </div>
          <p className="text-xs text-gray-500">potential savings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm bg-gray-50 rounded-lg p-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Current cost</p>
          <p className="font-semibold text-gray-900">${Number(rec.current_cost_usd).toFixed(2)}/mo</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Recommended</p>
          <p className="font-semibold text-green-700">${Number(rec.recommended_cost_usd).toFixed(2)}/mo</p>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4">{rec.recommendation}</p>

      {status === "open" && (
        <div className="flex gap-2">
          <button onClick={() => updateStatus("implementing")} disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading === "implementing" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Implement
          </button>
          <button onClick={() => updateStatus("dismissed")} disabled={loading !== null}
            className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {loading === "dismissed" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
          </button>
        </div>
      )}
      {status !== "open" && (
        <span className="text-xs text-gray-500 capitalize">{status}</span>
      )}
    </div>
  );
}