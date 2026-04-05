"use client";
import { useState } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import type { CloudAccount } from "@/types";

const PROVIDER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  aws: { label: "AWS", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  gcp: { label: "GCP", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  azure: { label: "Azure", color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
};

const STATUS_ICONS = {
  active: <CheckCircle className="w-4 h-4 text-green-500" />,
  inactive: <XCircle className="w-4 h-4 text-gray-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
};

interface AccountCardProps {
  account: CloudAccount;
}

export default function AccountCard({ account }: AccountCardProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const provider = PROVIDER_LABELS[account.provider] ?? { label: account.provider.toUpperCase(), color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch(`/api/accounts/${account.id}/sync`, { method: "POST" });
      if (!res.ok) {
        const e = await res.json();
        setSyncError(e.error ?? "Sync failed");
      }
    } catch {
      setSyncError("Network error during sync");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("px-2.5 py-1 rounded-md text-xs font-bold border", provider.bg, provider.color)}>
          {provider.label}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {STATUS_ICONS[account.status]}
          <span className="capitalize">{account.status}</span>
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{account.name}</h3>
      <p className="text-xs text-gray-500 font-mono mb-3">{account.account_id}</p>
      <div className="text-xs text-gray-500 mb-4">
        {account.last_synced_at
          ? `Last synced ${new Date(account.last_synced_at).toLocaleDateString()}`
          : "Never synced"}
      </div>
      {syncError && <p className="text-xs text-red-600 mb-2">{syncError}</p>}
      <button onClick={handleSync} disabled={syncing}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
        <RefreshCw className={clsx("w-3 h-3", syncing && "animate-spin")} />
        {syncing ? "Syncing..." : "Sync Now"}
      </button>
    </div>
  );
}