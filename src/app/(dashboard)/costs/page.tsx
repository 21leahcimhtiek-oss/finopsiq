"use client";

import { useEffect, useState } from "react";
import CostTable from "@/components/CostTable";
import { CostRecord } from "@/types";

export default function CostsPage() {
  const [records, setRecords] = useState<CostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    service: "",
    account_id: "",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.start_date) params.set("start_date", filters.start_date);
      if (filters.end_date) params.set("end_date", filters.end_date);
      if (filters.service) params.set("service", filters.service);
      if (filters.account_id) params.set("account_id", filters.account_id);
      const res = await fetch(`/api/costs?${params}`);
      const json = await res.json();
      setRecords(json.data ?? []);
      setLoading(false);
    }
    load();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cost Explorer</h1>
        <p className="text-gray-500 mt-1">Explore and analyze your cloud spending</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Service</label>
          <input
            type="text"
            value={filters.service}
            onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value }))}
            placeholder="e.g. Amazon EC2"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <CostTable records={records} loading={loading} />
      </div>
    </div>
  );
}