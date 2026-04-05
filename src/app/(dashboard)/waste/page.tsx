"use client";

import { useEffect, useState } from "react";
import { WasteFinding as WasteType } from "@/types";
import WasteFindingCard from "@/components/WasteFinding";
import { ZapIcon, RefreshCwIcon } from "lucide-react";

export default function WastePage() {
  const [findings, setFindings] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("open");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/waste?status=${statusFilter}`);
    const json = await res.json();
    setFindings(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function runScan() {
    setScanning(true);
    await fetch("/api/waste", { method: "POST" });
    await load();
    setScanning(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/waste/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setFindings((prev) => prev.map((f) => f.id === id ? { ...f, status: status as WasteType["status"] } : f));
  }

  const totalWaste = findings.reduce((s, f) => s + f.estimated_monthly_waste_usd, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waste Detection</h1>
          <p className="text-gray-500 mt-1">
            {findings.length} findings · ${totalWaste.toFixed(0)}/month estimated waste
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {scanning ? (
            <RefreshCwIcon className="w-4 h-4 animate-spin" />
          ) : (
            <ZapIcon className="w-4 h-4" />
          )}
          {scanning ? "Scanning..." : "Run AI Scan"}
        </button>
      </div>

      <div className="flex gap-2">
        {["open", "dismissed", "resolved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
              statusFilter === s
                ? "bg-primary-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading findings...</div>
      ) : findings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No {statusFilter} findings. Run an AI scan to detect waste.
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((f) => (
            <WasteFindingCard key={f.id} finding={f} onStatusChange={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}