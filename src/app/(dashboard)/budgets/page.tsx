"use client";

import { useEffect, useState } from "react";
import { Budget } from "@/types";
import BudgetBar from "@/components/BudgetBar";
import { PlusIcon } from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", monthly_limit_usd: "", alert_at_percent: "80" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/budgets")
      .then((r) => r.json())
      .then((d) => { setBudgets(d.data ?? []); setLoading(false); });
  }, []);

  async function createBudget(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        monthly_limit_usd: parseFloat(form.monthly_limit_usd),
        alert_at_percent: parseFloat(form.alert_at_percent),
      }),
    });
    const json = await res.json();
    if (json.data) {
      setBudgets((prev) => [...prev, json.data]);
      setShowModal(false);
      setForm({ name: "", monthly_limit_usd: "", alert_at_percent: "80" });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-500 mt-1">Monitor and enforce cloud spending limits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" /> New Budget
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No budgets yet. Create one to start tracking.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => <BudgetBar key={b.id} budget={b} />)}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Budget</h2>
            <form onSubmit={createBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Production AWS"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit (USD)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.monthly_limit_usd}
                  onChange={(e) => setForm((f) => ({ ...f, monthly_limit_usd: e.target.value }))}
                  placeholder="5000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alert at (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.alert_at_percent}
                  onChange={(e) => setForm((f) => ({ ...f, alert_at_percent: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm disabled:opacity-50">
                  {saving ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}