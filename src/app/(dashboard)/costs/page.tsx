import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CostChart from "@/components/CostChart";

export const metadata = { title: "Cost Explorer" };

export default async function CostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!membership) redirect("/onboarding");

  const { data: costs } = await supabase
    .from("cost_records")
    .select("service, region, amount_usd, period_start, tags")
    .eq("org_id", membership.org_id)
    .gte("period_start", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("period_start", { ascending: true })
    .limit(5000);

  const byService = new Map<string, number>();
  for (const c of costs ?? []) {
    const k = c.service;
    byService.set(k, (byService.get(k) ?? 0) + Number(c.amount_usd));
  }
  const topServices = Array.from(byService.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cost Explorer</h1>
        <p className="text-gray-600 mt-1">Analyze cloud spend by service, region, and tag</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Spend Trend (90 days)</h2>
        <CostChart data={(costs ?? []).map((c) => ({ date: c.period_start, service: c.service, amount: Number(c.amount_usd) }))} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Services by Spend</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-gray-600 font-medium">Service</th>
                <th className="text-right py-3 px-2 text-gray-600 font-medium">Total Spend</th>
                <th className="text-right py-3 px-2 text-gray-600 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map(([service, amount]) => {
                const totalAll = topServices.reduce((s, [, a]) => s + a, 0);
                return (
                  <tr key={service} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{service}</td>
                    <td className="py-3 px-2 text-right">${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{totalAll > 0 ? ((amount / totalAll) * 100).toFixed(1) : 0}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}