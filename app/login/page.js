"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE as API, API_BASE } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!form.email.includes("@")) e2.email = "Valid email required";
    if (form.password.length < 6) e2.password = "Min 6 characters";
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      router.push(redirectTo);
    } catch (err) {
      // If unverified, send to OTP page
      if (err.message?.includes('verify')) {
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setErrorMsg(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-gold text-2xl tracking-[0.4em] uppercase">Chain & Straps</Link>
          <h1 className="font-serif text-white text-3xl mt-6 mb-2">Welcome Back</h1>
          <p className="text-text-muted text-sm">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 text-center rounded">
              {errorMsg}
            </div>
          )}

          <div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange}
                className={`w-full bg-bg-secondary border ${errors.email ? "border-red-500" : "border-border-color"} text-white pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors`}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange}
                className={`w-full bg-bg-secondary border ${errors.password ? "border-red-500" : "border-border-color"} text-white pl-10 pr-12 py-4 text-sm focus:outline-none focus:border-gold transition-colors`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted text-xs">Forgot your password?</span>
            <Link href="/forgot-password" className="text-gold text-xs hover:underline tracking-widest uppercase">Reset it</Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gold text-black py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "SIGN IN"}
          </button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-border-color" />
          <span className="px-4 text-text-muted text-xs tracking-widest uppercase">or</span>
          <div className="flex-1 border-t border-border-color" />
        </div>

        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">Don&apos;t have an account?</p>
          <Link href="/register" className="border border-gold text-gold w-full py-4 text-sm font-bold tracking-widest uppercase hover:bg-gold/10 transition-colors flex items-center justify-center">
            CREATE ACCOUNT
          </Link>
        </div>

        <div className="text-center mt-6">
          <Link href="/checkout" className="text-text-muted text-xs hover:text-gold transition-colors tracking-widest uppercase">← Continue as Guest</Link>
        </div>
      </div>
    </div>
  );
}
