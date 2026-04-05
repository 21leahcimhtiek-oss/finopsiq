"use client";

import { useState } from "react";
import { CostRecord } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";

interface Props {
  records: CostRecord[];
  loading?: boolean;
}

type SortField = "service" | "amount_usd" | "usage_date" | "region";

export default function CostTable({ records, loading }: Props) {
  const [sortField, setSortField] = useState<SortField>("usage_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sorted = [...records].sort((a, b) => {
    let va: string | number = a[sortField] ?? "";
    let vb: string | number = b[sortField] ?? "";
    if (sortField === "amount_usd") {
      va = Number(va);
      vb = Number(vb);
    }
    return sortDir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-400 text-sm">Loading cost records...</div>;
  }

  if (!sorted.length) {
    return <div className="p-8 text-center text-gray-400 text-sm">No records found for the selected filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              { field: "service" as SortField, label: "Service" },
              { field: "region" as SortField, label: "Region" },
              { field: "amount_usd" as SortField, label: "Amount" },
              { field: "usage_date" as SortField, label: "Date" },
            ].map(({ field, label }) => (
              <th
                key={field}
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort(field)}
              >
                <span className="flex items-center gap-1">
                  {label}
                  {sortField === field ? (
                    sortDir === "asc" ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />
                  ) : null}
                </span>
              </th>
            ))}
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{r.service}</td>
              <td className="px-4 py-3 text-gray-500">{r.region ?? "—"}</td>
              <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(Number(r.amount_usd))}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(r.usage_date)}</td>
              <td className="px-4 py-3">
                {r.tags && Object.entries(r.tags).slice(0, 2).map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-1">
                    {k}: {v}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}