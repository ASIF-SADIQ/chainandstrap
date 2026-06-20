"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { API_BASE as API, API_BASE } from "@/lib/config";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Please enter a valid email.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Link href="/" className="font-serif text-gold text-2xl tracking-[0.4em] uppercase block mb-10">Chain & Straps</Link>
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-gold" />
          </div>
          <h2 className="font-serif text-white text-3xl mb-3">OTP Sent!</h2>
          <p className="text-text-muted mb-2">Check your inbox at</p>
          <p className="text-gold font-semibold mb-8">{email}</p>
          <button
            onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
            className="w-full bg-gold text-black py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors"
          >
            ENTER OTP & RESET PASSWORD
          </button>
          <Link href="/login" className="block text-text-muted text-xs mt-6 hover:text-gold tracking-widest uppercase">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-gold text-2xl tracking-[0.4em] uppercase block mb-10">Chain & Straps</Link>
          <h1 className="font-serif text-white text-3xl mb-2">Forgot Password?</h1>
          <p className="text-text-muted text-sm">Enter your email and we&apos;ll send you a reset code.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded text-center">
              {error}
            </div>
          )}
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              placeholder="Your registered email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full bg-bg-secondary border border-border-color text-white pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-black py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors disabled:opacity-60 flex items-center justify-center"
          >
            {loading
              ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : "SEND RESET CODE"
            }
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/login" className="text-text-muted text-xs hover:text-gold tracking-widest uppercase">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
