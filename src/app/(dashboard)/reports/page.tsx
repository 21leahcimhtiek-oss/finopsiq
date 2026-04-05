"use client";

import ReportExporter from "@/components/ReportExporter";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Export cost data and generate executive reports</p>
      </div>
      <ReportExporter />
    </div>
  );
}