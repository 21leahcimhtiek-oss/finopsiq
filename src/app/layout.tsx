import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "FinOpsIQ", template: "%s | FinOpsIQ" },
  description: "Automated cloud cost intelligence for engineering teams. Detect anomalies, forecast budgets, and get rightsizing recommendations powered by AI.",
  keywords: ["cloud cost", "FinOps", "AWS cost", "GCP billing", "Azure cost", "cost optimization", "cloud spend"],
  openGraph: {
    title: "FinOpsIQ — Cloud Cost Intelligence",
    description: "Stop guessing. Start optimizing. AI-powered cloud cost management for engineering teams.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: { card: "summary_large_image", title: "FinOpsIQ", description: "AI-powered cloud cost intelligence" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>{children}</body>
    </html>
  );
}