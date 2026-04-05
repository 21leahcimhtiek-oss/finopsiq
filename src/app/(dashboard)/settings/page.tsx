"use client";

import { useEffect, useState } from "react";
import { Member } from "@/types";

export default function SettingsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/invite")
      .then((r) => r.json())
      .then((d) => setMembers(d.data ?? []));
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    const res = await fetch("/api/auth/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const json = await res.json();
    setMessage(json.error ? json.error : "Invitation sent!");
    setInviteEmail("");
    setInviting(false);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your organization and team</p>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Team Members</h2>
        <div className="space-y-3 mb-6">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{m.user?.email}</p>
                <p className="text-xs text-gray-400 capitalize">{m.role}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                m.role === "owner" ? "bg-purple-100 text-purple-700" :
                m.role === "admin" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>

        {/* Invite */}
        <form onSubmit={invite} className="flex gap-2">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={inviting}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </form>
        {message && <p className="text-sm mt-2 text-green-600">{message}</p>}
      </div>
    </div>
  );
}