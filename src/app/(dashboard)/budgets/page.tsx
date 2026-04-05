import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import BudgetProgress from "@/components/BudgetProgress";

export const metadata = { title: "Budgets" };

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!membership) redirect("/onboarding");

  const [budgetsResult, costsResult] = await Promise.all([
    supabase.from("budgets").select("*").eq("org_id", membership.org_id).order("created_at", { ascending: false }),
    supabase.from("cost_records")
      .select("amount_usd, period_start")
      .eq("org_id", membership.org_id)
      .gte("period_start", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
  ]);

  const budgets = budgetsResult.data ?? [];
  const currentMonthSpend = (costsResult.data ?? []).reduce((sum, c) => sum + Number(c.amount_usd), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">{budgets.length} budgets configured</p>
        </div>
        <Link href="/budgets/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Create Budget
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-600 mb-4">Create budget alerts to get notified when spend exceeds your thresholds.</p>
          <Link href="/budgets/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Create your first budget
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <BudgetProgress key={budget.id} budget={budget} currentSpend={currentMonthSpend} />
          ))}
        </div>
      )}
    </div>
  );
}