import Link from "next/link";
import {
  CloudIcon,
  ZapIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  BellIcon,
  TagIcon,
  CheckIcon,
  ArrowRightIcon,
} from "lucide-react";

const features = [
  {
    icon: CloudIcon,
    title: "Multi-Cloud Ingestion",
    description: "Connect AWS, GCP, and Azure in minutes. Unified cost view across all providers.",
  },
  {
    icon: ZapIcon,
    title: "AI Waste Detection",
    description: "GPT-4o identifies idle instances, over-provisioned resources, and unused reservations automatically.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Budget Enforcement",
    description: "Set budget rules by team or project. Get alerts at 80% and auto-actions at 100%.",
  },
  {
    icon: BarChart3Icon,
    title: "Spend Analytics",
    description: "Daily trend charts, service breakdowns, and tag-based cost attribution.",
  },
  {
    icon: BellIcon,
    title: "Anomaly Detection",
    description: "Catch spend spikes the moment they happen with AI-generated explanations.",
  },
  {
    icon: TagIcon,
    title: "Cost Attribution",
    description: "Chargeback and showback by team, project, environment, or any custom tag.",
  },
];

const plans = [
  {
    name: "Team",
    price: 99,
    description: "Perfect for small engineering teams",
    features: [
      "Up to 5 cloud accounts",
      "Cost tracking & analytics",
      "Basic waste detection",
      "Email alerts",
      "CSV exports",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Business",
    price: 299,
    description: "For growing companies with complex needs",
    features: [
      "Up to 20 cloud accounts",
      "AI-powered waste detection",
      "Budget rules engine",
      "Anomaly detection",
      "API access",
      "Slack/PagerDuty alerts",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 999,
    description: "Unlimited scale with dedicated support",
    features: [
      "Unlimited cloud accounts",
      "All Business features",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated support",
      "On-premise option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ZapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FinOpsIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <ZapIcon className="w-4 h-4" />
          AI-Powered Cloud Cost Optimization
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Cut Cloud Costs by{" "}
          <span className="text-primary-600">40%</span> with AI
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          FinOpsIQ gives DevOps and platform teams real-time spend analytics,
          AI-powered waste detection, and budget enforcement across AWS, GCP,
          and Azure.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 justify-center"
          >
            Start Free Trial <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            View Demo
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to control cloud spend
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Start free. No credit card required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 border-2 ${
                  plan.highlighted
                    ? "border-primary-600 shadow-lg shadow-primary-100"
                    : "border-gray-100"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  ${plan.price}
                  <span className="text-lg font-normal text-gray-400">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to cut your cloud bill?
        </h2>
        <p className="text-gray-500 mb-8">
          Join hundreds of engineering teams saving thousands every month.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Start for free <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          © 2024 FinOpsIQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}