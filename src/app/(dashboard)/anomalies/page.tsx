"use client";

import { useEffect, useState } from "react";
import { Anomaly } from "@/types";
import AnomalyCard from "@/components/AnomalyCard";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/anomalies")
      .then((r) => r.json())
      .then((d) => { setAnomalies(d.data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Anomalies</h1>
        <p className="text-gray-500 mt-1">AI-detected spend spikes and unusual cost patterns</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading anomalies...</div>
      ) : anomalies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No anomalies detected. Your spend looks normal.</div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((a) => <AnomalyCard key={a.id} anomaly={a} />)}
        </div>
      )}
    </div>
  );
}