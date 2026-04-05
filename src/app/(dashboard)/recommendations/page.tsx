import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RecommendationCard from "@/components/RecommendationCard";
import { DollarSign } from "lucide-react";

export const metadata = { title: "Recommendations" };

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("org_members").select("org_id, orgs(plan)").eq("user_id", user.id).single();
  if (!membership) redirect("/onboarding");

  const org = membership.orgs as { plan: string } | null;

  const { data: recs } = await supabase
    .from("recommendations")
    .select("*, cloud_accounts(name, provider)")
    .eq("org_id", membership.org_id)
    .eq("status", "open")
    .order("savings_usd", { ascending: false });

  const totalSavings = (recs ?? []).reduce((sum, r) => sum + Number(r.savings_usd), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rightsizing Recommendations</h1>
          <p className="text-gray-600 mt-1">{recs?.length ?? 0} open recommendations</p>
        </div>
        {totalSavings > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="flex items-center gap-2 text-green-700">
              <DollarSign className="w-5 h-5" />
              <span className="text-2xl font-bold">${totalSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-green-600 text-sm mt-1">Total potential monthly savings</p>
          </div>
        )}
      </div>

      {org?.plan !== "enterprise" && (
        <div className="bg-purple-50 border border-purple-200 text-purple-800 px-4 py-3 rounded-lg text-sm">
          AI-powered recommendations require an Enterprise plan. <a href="/billing" className="font-medium underline">Upgrade now</a>
        </div>
      )}

      {!recs || recs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No open recommendations. Run an AI analysis on your accounts to generate savings opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}