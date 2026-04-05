"use client";

import { useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";

export default function ReportExporter() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, per_page: "1000" });
    const res = await fetch(`/api/costs?${params}`);
    const json = await res.json();
    const records = json.data ?? [];

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "csv") {
      const headers = ["id", "service", "region", "amount_usd", "currency", "usage_date"];
      const rows = records.map((r: Record<string, string | number>) =>
        headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
      );
      content = [headers.join(","), ...rows].join("\n");
      filename = `finopsiq-costs-${startDate}-${endDate}.csv`;
      mimeType = "text/csv";
    } else {
      content = JSON.stringify(records, null, 2);
      filename = `finopsiq-costs-${startDate}-${endDate}.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg">
      <h2 className="font-semibold text-gray-900 mb-4">Export Cost Data</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <div className="flex gap-2">
            {(["csv", "json"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium uppercase transition-colors ${
                  format === f
                    ? "bg-primary-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            <DownloadIcon className="w-4 h-4" />
          )}
          {loading ? "Exporting..." : "Download Report"}
        </button>
      </div>
    </div>
  );
}