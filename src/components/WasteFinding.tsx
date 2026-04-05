import { WasteFinding } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

interface Props {
  finding: WasteFinding;
  onStatusChange: (id: string, status: string) => void;
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  idle_instance: "Idle Instance",
  over_provisioned: "Over-Provisioned",
  orphaned_storage: "Orphaned Storage",
  unused_reservation: "Unused Reservation",
  unattached_ip: "Unattached IP",
  stopped_instance: "Stopped Instance",
};

export default function WasteFindingCard({ finding, onStatusChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-gray-900">{finding.resource_id}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {finding.resource_type}
              </span>
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                {WASTE_TYPE_LABELS[finding.waste_type] ?? finding.waste_type}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{finding.recommendation}</p>
            {finding.confidence_score !== null && (
              <span className="text-xs text-gray-400">
                Confidence: {Math.round((finding.confidence_score ?? 0) * 100)}%
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(finding.estimated_monthly_waste_usd)}
          </p>
          <p className="text-xs text-gray-400">/month waste</p>
        </div>
      </div>

      {finding.status === "open" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
          <button
            onClick={() => onStatusChange(finding.id, "resolved")}
            className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium"
          >
            <CheckCircleIcon className="w-3.5 h-3.5" /> Mark Resolved
          </button>
          <button
            onClick={() => onStatusChange(finding.id, "dismissed")}
            className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium"
          >
            <XCircleIcon className="w-3.5 h-3.5" /> Dismiss
          </button>
        </div>
      )}
    </div>
  );
}