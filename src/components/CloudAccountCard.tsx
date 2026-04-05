import { CloudAccount } from "@/types";
import { formatDate } from "@/lib/utils";
import { RefreshCwIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

interface Props {
  account: CloudAccount;
  onSync: () => void;
}

const PROVIDER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  aws: { bg: "bg-orange-50", text: "text-orange-700", label: "AWS" },
  gcp: { bg: "bg-blue-50", text: "text-blue-700", label: "GCP" },
  azure: { bg: "bg-sky-50", text: "text-sky-700", label: "Azure" },
};

export default function CloudAccountCard({ account, onSync }: Props) {
  const provider = PROVIDER_COLORS[account.provider] ?? { bg: "bg-gray-50", text: "text-gray-700", label: account.provider.toUpperCase() };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${provider.bg} rounded-lg flex items-center justify-center`}>
            <span className={`text-sm font-bold ${provider.text}`}>{provider.label}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{account.account_name}</h3>
            <p className="text-xs text-gray-400 font-mono">{account.account_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {account.is_active ? (
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          ) : (
            <XCircleIcon className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs font-medium ${account.is_active ? "text-green-600" : "text-red-500"}`}>
            {account.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-4">
        {account.last_synced_at ? (
          <>Last synced {formatDate(account.last_synced_at, "MMM d 'at' h:mm a")}</>
        ) : (
          "Never synced"
        )}
      </div>

      <button
        onClick={onSync}
        className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium w-full justify-center"
      >
        <RefreshCwIcon className="w-3.5 h-3.5" /> Sync Now
      </button>
    </div>
  );
}