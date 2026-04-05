"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { TrendingDown, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({ email: z.string().email("Invalid email address") });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
    });
    if (error) { setServerError(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">We sent a password reset link. Check your inbox (and spam folder).</p>
          <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700 text-sm">Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FinOpsIQ</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-600 mt-1">We will send you a reset link</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{serverError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input {...register("email")} type="email" autoComplete="email" placeholder="you@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
        <div className="text-center mt-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}