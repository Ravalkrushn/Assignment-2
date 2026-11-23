"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@slideshow.internal");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      // Successful login - redirect to admin overview
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid administrator credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#EDE7DC] flex flex-col justify-center items-center p-4 relative selection:bg-[#E8913C]/30 selection:text-[#EDE7DC]">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2E6B72]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E8913C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-[#101317] border border-[#EDE7DC]/15 rounded-3xl p-8 shadow-2xl space-y-6 z-10">
        {/* Emblem & Branding */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8913C] to-[#2E6B72] flex items-center justify-center mx-auto shadow-lg shadow-[#E8913C]/20 border border-[#EDE7DC]/20">
            <Sparkles className="w-7 h-7 text-[#EDE7DC]" />
          </div>
          <div>
            <h1 className="text-2xl font-syne font-bold tracking-tight text-[#EDE7DC]">
              Admin Authentication
            </h1>
            <p className="text-xs font-sora text-[#9EA5A8] mt-1">
              Visitor Photo Archive & Smart TV Console
            </p>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2.5 text-rose-300 text-xs font-sora animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sora">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-mono tracking-wider text-[#9EA5A8]">
              Admin Identity / Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@slideshow.internal"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/15 text-xs text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#E8913C] transition-colors font-mono"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] uppercase font-mono tracking-wider text-[#9EA5A8]">
                Master Security Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                required
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/15 text-xs text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#E8913C] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6C7378] hover:text-[#EDE7DC] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Credentials Helper Box */}
          <div className="p-3 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 text-[11px] font-sora text-[#9EA5A8] space-y-1">
            <div className="flex items-center gap-1.5 text-[#E8913C] font-semibold text-[10px] uppercase font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Evaluation Access
            </div>
            <p>
              Default Password: <code className="text-[#EDE7DC] bg-[#101317] px-1.5 py-0.5 rounded border border-[#EDE7DC]/10">AdminSecure2026!</code>
            </p>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#E8913C] hover:bg-[#E8913C]/90 text-[#0A0C0E] font-syne font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#E8913C]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#0A0C0E] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 text-center text-xs text-[#6C7378] font-sora">
          <Link href="/" className="hover:text-[#EDE7DC] transition-colors">
            &larr; Return to Visitor Intake Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
