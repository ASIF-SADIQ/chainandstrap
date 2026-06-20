"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE as API, API_BASE } from "@/lib/config";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otpFromUrl = searchParams.get("otp") || "";
  const { login } = useAuth();

  const [otp, setOtp] = useState(otpFromUrl ? otpFromUrl.split('') : ["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputs = useRef([]);

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (val, i) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    setError("");
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter all 6 digits.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Save token to context
      localStorage.setItem("cs_token", data.token);
      localStorage.setItem("cs_user", JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setCountdown(60);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-400" size={40} />
          </div>
          <h2 className="font-serif text-white text-3xl mb-2">Welcome to Chain & Straps!</h2>
          <p className="text-text-muted">Your account is verified. Taking you to the store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="font-serif text-gold text-2xl tracking-[0.4em] uppercase block mb-10">
          Chain & Straps
        </Link>

        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="font-serif text-white text-3xl mb-2">Verify Your Account</h1>
        <p className="text-text-muted text-sm mb-2">
          {otpFromUrl ? 'Email delivery unavailable — use the OTP below:' : 'We sent a 6-digit code to'}
        </p>
        <p className="text-gold font-semibold mb-2">{email}</p>
        {otpFromUrl && (
          <div className="bg-gold/10 border border-gold/30 rounded px-4 py-3 mb-6">
            <p className="text-xs text-text-muted mb-1 tracking-widest uppercase">Your OTP Code</p>
            <p className="text-gold text-2xl font-bold tracking-[0.3em]">{otpFromUrl}</p>
            <p className="text-xs text-text-muted mt-1">Already filled below ↓</p>
          </div>
        )}
        {!otpFromUrl && <div className="mb-4" />}

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-12 h-14 text-center text-2xl font-bold bg-bg-secondary border-2 border-border-color text-white focus:outline-none focus:border-gold transition-colors rounded"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-black py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors disabled:opacity-60 flex items-center justify-center"
          >
            {loading
              ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : "VERIFY EMAIL"
            }
          </button>
        </form>

        <div className="mt-6">
          {countdown > 0 ? (
            <p className="text-text-muted text-sm">Resend code in <span className="text-gold">{countdown}s</span></p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex items-center justify-center mx-auto text-gold text-sm hover:underline disabled:opacity-50"
            >
              <RefreshCw size={14} className={`mr-2 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>

        <p className="text-text-muted text-xs mt-8">
          Wrong email?{" "}
          <Link href="/register" className="text-gold hover:underline">Go back</Link>
        </p>
      </div>
    </div>
  );
}
