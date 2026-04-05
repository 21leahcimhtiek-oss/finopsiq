"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface DataPoint {
  date: string;
  service: string;
  amount: number;
}

interface CostChartProps {
  data: DataPoint[];
  height?: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1"];

export default function CostChart({ data, height = 300 }: CostChartProps) {
  const { chartData, services } = useMemo(() => {
    // Group by date, then service
    const byDate = new Map<string, Record<string, number>>();
    const serviceSet = new Set<string>();

    for (const d of data) {
      if (!byDate.has(d.date)) byDate.set(d.date, {});
      const dateEntry = byDate.get(d.date)!;
      dateEntry[d.service] = (dateEntry[d.service] ?? 0) + d.amount;
      serviceSet.add(d.service);
    }

    const allServices = Array.from(serviceSet);
    const chartData = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, services]) => ({ date: date.slice(5), ...services })); // MM-DD format

    return { chartData, services: allServices.slice(0, 8) }; // Show top 8 services
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No cost data available. Upload a CSV file to see your cost breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`} />
        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, ""]} labelFormatter={(l) => `Date: ${l}`} />
        <Legend />
        {services.map((service, i) => (
          <Bar key={service} dataKey={service} stackId="a" fill={COLORS[i % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}