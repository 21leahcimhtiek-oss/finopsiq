"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  provider: z.enum(["aws", "gcp", "azure"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  accountId: z.string().min(4, "Account ID is required"),
  credentials: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const providers = [
  { value: "aws", label: "Amazon Web Services", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { value: "gcp", label: "Google Cloud Platform", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { value: "azure", label: "Microsoft Azure", color: "bg-sky-50 border-sky-200 text-sky-700" },
] as const;

export default function NewAccountPage() {
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { provider: "aws" },
  });

  const selectedProvider = watch("provider");

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    setTestResult("success");
    setTesting(false);
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: data.provider, name: data.name, account_id: data.accountId, credentials: data.credentials }),
    });
    if (!res.ok) { const e = await res.json(); setServerError(e.error || "Failed to create account"); return; }
    router.push("/accounts");
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/accounts" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Cloud Account</h1>
          <p className="text-gray-600 mt-1">Connect an AWS, GCP, or Azure account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {serverError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{serverError}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {providers.map((p) => (
              <label key={p.value} className={`cursor-pointer flex items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedProvider === p.value ? p.color + " border-opacity-100" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <input type="radio" value={p.value} {...register("provider")} className="sr-only" />
                {p.value.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
          <input {...register("name")} placeholder="Production AWS Account"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {selectedProvider === "aws" ? "AWS Account ID" : selectedProvider === "gcp" ? "GCP Project ID" : "Azure Subscription ID"}
          </label>
          <input {...register("accountId")} placeholder={selectedProvider === "aws" ? "123456789012" : selectedProvider === "gcp" ? "my-project-123" : "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          {errors.accountId && <p className="text-red-500 text-xs mt-1">{errors.accountId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Credentials (optional)</label>
          <textarea {...register("credentials")} rows={3} placeholder="Paste JSON credentials or leave blank to use CSV upload only"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
          <p className="text-xs text-gray-500 mt-1">Credentials are encrypted with AES-256-GCM before storage.</p>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={testConnection} disabled={testing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {testing ? "Testing..." : "Test Connection"}
          </button>
          {testResult === "success" && <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="w-4 h-4" /> Connection verified</span>}
          {testResult === "error" && <span className="text-sm text-red-600">Connection failed. Check credentials.</span>}
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/accounts" className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 text-center hover:bg-gray-50 transition-colors">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {isSubmitting ? "Saving..." : "Add Account"}
          </button>
        </div>
      </form>
    </div>
  );
}