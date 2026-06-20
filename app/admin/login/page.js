"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";
import { API_BASE } from "@/lib/config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      if (data.user?.role !== "admin") {
        setError("Access denied. You do not have admin privileges.");
        setLoading(false);
        return;
      }

      localStorage.setItem("cs_token", data.token);
      localStorage.setItem("cs_user", JSON.stringify(data.user));
      router.replace("/admin/dashboard");
    } catch (err) {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#b8972e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#b8972e]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b8972e]/10 border border-[#b8972e]/20 mb-6">
            <ShieldAlert size={28} className="text-[#b8972e]" />
          </div>
          <h1 className="font-serif text-[#b8972e] text-2xl tracking-[0.4em] uppercase mb-2">Chain&Straps</h1>
          <p className="text-[#666] text-sm tracking-widest uppercase">Admin Access</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#111] border border-[#222] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 flex items-center gap-2">
                <ShieldAlert size={16} />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[#888] text-xs tracking-widest uppercase mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@chainandstrap.store"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-[#b8972e] transition-colors placeholder-[#444]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#888] text-xs tracking-widest uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] text-white pl-10 pr-12 py-4 text-sm focus:outline-none focus:border-[#b8972e] transition-colors placeholder-[#444]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#b8972e] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b8972e] text-black py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#d4aa3a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <ShieldAlert size={16} />
                  ACCESS ADMIN PORTAL
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#222] text-center">
            <a href="/" className="text-[#555] text-xs hover:text-[#b8972e] transition-colors tracking-widest uppercase">
              ← Back to Store
            </a>
          </div>
        </div>

        <p className="text-center text-[#444] text-xs mt-6">
          Admin access only. Unauthorized attempts are logged.
        </p>
      </div>
    </div>
  );
}
