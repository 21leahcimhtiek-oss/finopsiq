import Link from "next/link";
import { CloudLightning, TrendingDown, Bell, BarChart2, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: CloudLightning, title: "Multi-Cloud Ingestion", description: "Import costs from AWS, GCP, and Azure via CSV upload or API connectors. Normalize into a unified data model instantly." },
  { icon: Zap, title: "AI Anomaly Detection", description: "GPT-4 powered spike detection catches unusual spend patterns before they blow up your budget. Get plain-English explanations." },
  { icon: TrendingDown, title: "Cost Forecasting", description: "ML-based 30/60/90-day projections with confidence intervals. Know your cloud bill before finance asks." },
  { icon: Bell, title: "Budget Alerts", description: "Set budget thresholds by team, service, or environment. Get notified via Slack or email the moment you are approaching limits." },
  { icon: BarChart2, title: "Cost Allocation", description: "Break down spend by team, project, environment, or any custom tag. Generate chargeback and showback reports automatically." },
  { icon: Shield, title: "Rightsizing Recommendations", description: "AI identifies over-provisioned resources and tells you exactly what to change, with specific savings amounts." },
];

const plans = [
  {
    name: "Starter", price: 99, description: "For small teams getting started",
    features: ["3 cloud accounts", "6-month history", "CSV upload", "Basic budget alerts", "5 team members"],
    cta: "Start free trial", highlight: false,
  },
  {
    name: "Pro", price: 249, description: "For teams that need AI-powered insights",
    features: ["15 cloud accounts", "18-month history", "AI anomaly detection", "ML forecasting", "Slack integration", "25 team members"],
    cta: "Start free trial", highlight: true,
  },
  {
    name: "Enterprise", price: 599, description: "Unlimited scale + full AI",
    features: ["Unlimited accounts", "36-month history", "AI recommendations", "Chargeback reports", "SSO / SAML", "Unlimited members"],
    cta: "Contact sales", highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">FinOpsIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#roi" className="hover:text-gray-900 transition-colors">ROI</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
            <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <Zap className="w-4 h-4" />
          Average enterprise wastes 32% of cloud budget
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Stop guessing.<br />
          <span className="text-blue-600">Start optimizing.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          FinOpsIQ gives your team AI-powered visibility into cloud costs across AWS, GCP, and Azure.
          Detect anomalies, forecast budgets, and find savings — automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg">
            Start free 14-day trial <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#features" className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-lg">
            See how it works
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">No credit card required. Setup in under 30 minutes.</p>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "32%", label: "Average cloud waste" },
              { value: "20-35%", label: "Typical savings" },
              { value: "30 min", label: "Setup time" },
              { value: "90 days", label: "Forecast horizon" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything your FinOps team needs</h2>
          <p className="text-xl text-gray-600">From ingestion to insights in minutes, not months.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
              <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi" className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Calculate your ROI</h2>
          <p className="text-blue-100 text-xl mb-8">If your monthly cloud spend is $50,000, a 25% reduction saves $12,500/month — that is $150,000/year. FinOpsIQ costs $249/month.</p>
          <div className="bg-white/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Monthly cloud spend", value: "$50,000" },
              { label: "Average savings (25%)", value: "$12,500/mo" },
              { label: "Annual ROI", value: "600x" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-3xl font-bold mb-1">{item.value}</div>
                <div className="text-blue-200 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-600">14-day free trial on all plans. No credit card required.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-8 border-2 ${plan.highlight ? "border-blue-600 shadow-xl shadow-blue-100" : "border-gray-200"}`}>
              {plan.highlight && (
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Most Popular</div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.name === "Enterprise" ? "mailto:sales@finopsiq.io" : "/signup"} className={`block text-center py-3 px-6 rounded-xl font-semibold transition-colors ${plan.highlight ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">FinOpsIQ</span>
          </div>
          <p className="text-sm text-gray-500">2024 FinOpsIQ. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-gray-900">Privacy</a>
            <a href="/terms" className="hover:text-gray-900">Terms</a>
            <a href="mailto:support@finopsiq.io" className="hover:text-gray-900">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}