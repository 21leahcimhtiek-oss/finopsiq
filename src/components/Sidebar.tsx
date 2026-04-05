"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cloud, BarChart2, AlertTriangle, Target, TrendingDown, FileText, CreditCard, Settings, TrendingUp } from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/accounts", icon: Cloud, label: "Cloud Accounts" },
  { href: "/costs", icon: BarChart2, label: "Cost Explorer" },
  { href: "/anomalies", icon: AlertTriangle, label: "Anomalies" },
  { href: "/budgets", icon: Target, label: "Budgets" },
  { href: "/recommendations", icon: TrendingDown, label: "Recommendations" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">FinOpsIQ</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}>
              <item.icon className={clsx("w-4 h-4", isActive ? "text-blue-600" : "text-gray-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">FinOpsIQ v1.0.0</p>
      </div>
    </aside>
  );
}