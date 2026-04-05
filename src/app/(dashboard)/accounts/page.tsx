"use client";

import { useEffect, useState } from "react";
import { CloudAccount } from "@/types";
import CloudAccountCard from "@/components/CloudAccountCard";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/accounts");
    const json = await res.json();
    setAccounts(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function syncAccount(id: string) {
    await fetch(`/api/accounts/${id}/sync`, { method: "POST" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cloud Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your connected cloud accounts</p>
        </div>
        <Link
          href="/accounts/new"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" /> Connect Account
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No accounts connected.{" "}
          <Link href="/accounts/new" className="text-primary-600 hover:underline">
            Connect your first cloud account
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <CloudAccountCard key={a.id} account={a} onSync={() => syncAccount(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}