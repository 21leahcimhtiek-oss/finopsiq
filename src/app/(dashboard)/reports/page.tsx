import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Download, Clock } from "lucide-react";

export const metadata = { title: "Reports" };

const REPORT_TEMPLATES = [
  { type: "chargeback", name: "Chargeback Report", description: "Allocate cloud costs to teams and cost centers for internal billing", icon: "💳" },
  { type: "showback", name: "Showback Report", description: "Show teams their cloud costs without charging them — great for awareness", icon: "👀" },
  { type: "executive_summary", name: "Executive Summary", description: "High-level cloud spend overview for leadership and finance teams", icon: "📊" },
  { type: "cost_by_service", name: "Cost by Service", description: "Detailed breakdown of spend by cloud service (EC2, S3, RDS, etc.)", icon: "☁️" },
  { type: "cost_by_team", name: "Cost by Team", description: "Cloud spend broken down by team tag for FinOps accountability", icon: "👥" },
];

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).single();
  if (!membership) redirect("/onboarding");

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and schedule cost reports for your team</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TEMPLATES.map((template) => (
            <div key={template.type} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="text-2xl mb-3">{template.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                  <FileText className="w-3 h-3" /> Generate
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Clock className="w-3 h-3" /> Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reports && reports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Saved Reports</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Last Run</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Schedule</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{report.name}</td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{report.type.replace("_", " ")}</td>
                    <td className="py-3 px-4 text-gray-600">{report.last_run_at ? new Date(report.last_run_at).toLocaleDateString() : "Never"}</td>
                    <td className="py-3 px-4 text-gray-600">{report.schedule ?? "Manual"}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium">
                        <Download className="w-3 h-3" /> Download CSV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}