"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloudProvider } from "@/types";
import { CheckIcon } from "lucide-react";

const providers: { id: CloudProvider; name: string; description: string }[] = [
  { id: "aws", name: "Amazon Web Services", description: "Connect via IAM role or access keys" },
  { id: "gcp", name: "Google Cloud Platform", description: "Connect via service account JSON" },
  { id: "azure", name: "Microsoft Azure", description: "Connect via service principal" },
];

export default function NewAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<"provider" | "credentials">("provider");
  const [provider, setProvider] = useState<CloudProvider | null>(null);
  const [form, setForm] = useState({ account_id: "", account_name: "", credentials: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, ...form }),
    });
    const json = await res.json();
    if (json.error) {
      setError(json.error);
      setSaving(false);
    } else {
      router.push("/accounts");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connect Cloud Account</h1>
        <p className="text-gray-500 mt-1">Step {step === "provider" ? "1" : "2"} of 2</p>
      </div>

      {step === "provider" ? (
        <div className="space-y-3">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => { setProvider(p.id); setStep("credentials"); }}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg font-bold text-gray-600">
                {p.id.toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="font-medium text-gray-900">{p.name}</div>
                <div className="text-sm text-gray-500">{p.description}</div>
              </div>
              <CheckIcon className="w-5 h-5 text-primary-600 ml-auto opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">
            {providers.find((p) => p.id === provider)?.name} Credentials
          </h2>
          <form onSubmit={handleConnect} className="space-y-4">
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
              <input
                required
                value={form.account_id}
                onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
                placeholder={provider === "aws" ? "123456789012" : provider === "gcp" ? "my-project-id" : "subscription-id"}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input
                required
                value={form.account_name}
                onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
                placeholder="Production Account"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {provider === "aws" ? "Access Key / Role ARN" : provider === "gcp" ? "Service Account JSON" : "Client Secret"}
              </label>
              <textarea
                required
                rows={4}
                value={form.credentials}
                onChange={(e) => setForm((f) => ({ ...f, credentials: e.target.value }))}
                placeholder="Paste credentials here..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep("provider")} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">
                Back
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm disabled:opacity-50">
                {saving ? "Connecting..." : "Connect Account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}