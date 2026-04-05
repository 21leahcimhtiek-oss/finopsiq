import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnomalyCard from "@/components/AnomalyCard";

export const metadata = { title: "Anomalies" };

export default async function AnomaliesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("org_members").select("org_id, orgs(plan)").eq("user_id", user.id).single();
  if (!membership) redirect("/onboarding");

  const org = membership.orgs as { plan: string } | null;

  const { data: anomalies } = await supabase
    .from("anomalies")
    .select("*, cloud_accounts(name, provider)")
    .eq("org_id", membership.org_id)
    .order("detected_at", { ascending: false })
    .limit(50);

  const open = anomalies?.filter((a) => a.status === "open").length ?? 0;
  const acknowledged = anomalies?.filter((a) => a.status === "acknowledged").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anomalies</h1>
          <p className="text-gray-600 mt-1">{open} open, {acknowledged} acknowledged</p>
        </div>
        {org?.plan === "starter" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
            Upgrade to Pro to enable AI anomaly detection
          </div>
        )}
      </div>

      {!anomalies || anomalies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No anomalies detected yet. Run a detection scan to analyze your cost data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} />
          ))}
        </div>
      )}
    </div>
  );
}