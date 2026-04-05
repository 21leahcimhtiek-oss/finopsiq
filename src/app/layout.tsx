import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "FinOpsIQ — Multi-Cloud Cost Optimization",
    template: "%s | FinOpsIQ",
  },
  description:
    "Cut cloud costs by 40% with AI-powered waste detection, real-time spend analytics, and budget enforcement across AWS, GCP, and Azure.",
  keywords: [
    "cloud cost optimization",
    "FinOps",
    "AWS cost management",
    "GCP billing",
    "Azure cost",
    "waste detection",
  ],
  authors: [{ name: "FinOpsIQ" }],
  openGraph: {
    title: "FinOpsIQ — Multi-Cloud Cost Optimization",
    description: "Cut cloud costs by 40% with AI-powered waste detection",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}