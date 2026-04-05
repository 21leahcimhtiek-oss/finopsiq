"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DataPoint {
  date: string;
  amount: number;
}

interface Props {
  data: DataPoint[];
}

export default function SpendChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No spend data available
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    displayDate: formatDate(d.date, "MMM d"),
  }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, "USD", true)}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Spend"]}
          labelFormatter={(label) => label}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#spendGradient)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}