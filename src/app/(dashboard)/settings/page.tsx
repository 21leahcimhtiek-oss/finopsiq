"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Bell, Users, Building } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const orgSchema = z.object({ name: z.string().min(2) });
const notifSchema = z.object({
  slack_webhook: z.string().url("Invalid URL").optional().or(z.literal("")),
  email_alerts: z.boolean(),
});

type OrgForm = z.infer<typeof orgSchema>;
type NotifForm = z.infer<typeof notifSchema>;

export default function SettingsPage() {
  const supabase = createClient();
  const [orgSaved, setOrgSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const orgForm = useForm<OrgForm>({ resolver: zodResolver(orgSchema) });
  const notifForm = useForm<NotifForm>({
    resolver: zodResolver(notifSchema),
    defaultValues: { email_alerts: true },
  });

  const onSaveOrg = async (data: OrgForm) => {
    setOrgSaved(true);
    setTimeout(() => setOrgSaved(false), 2000);
  };

  const onSaveNotif = async (data: NotifForm) => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your organization and notification preferences</p>
      </div>

      {/* Org Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
        </div>
        <form onSubmit={orgForm.handleSubmit(onSaveOrg)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input {...orgForm.register("name")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Save className="w-4 h-4" />
            {orgSaved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        <form onSubmit={notifForm.handleSubmit(onSaveNotif)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slack Webhook URL</label>
            <input {...notifForm.register("slack_webhook")} type="url" placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Receive budget alerts and anomaly notifications in Slack</p>
            {notifForm.formState.errors.slack_webhook && (
              <p className="text-red-500 text-xs mt-1">{notifForm.formState.errors.slack_webhook.message}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input {...notifForm.register("email_alerts")} type="checkbox" id="emailAlerts" className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="emailAlerts" className="text-sm text-gray-700">Receive email alerts for budget thresholds and anomalies</label>
          </div>
          <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Save className="w-4 h-4" />
            {notifSaved ? "Saved!" : "Save Notifications"}
          </button>
        </form>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Invite Member
          </button>
        </div>
        <p className="text-sm text-gray-600">Manage team access and roles in the Members section.</p>
      </div>
    </div>
  );
}