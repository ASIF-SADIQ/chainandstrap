"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE as API, API_BASE } from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
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
    if (!form.name.trim()) e2.name = "Full name required";
    if (!form.email.includes("@")) e2.email = "Valid email required";
    if (form.password.length < 6) e2.password = "Min 6 characters";
    if (form.password !== form.confirmPassword) e2.confirmPassword = "Passwords do not match";
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }),
      });
      const data = await res.json();

      // Success — email sent or OTP returned as fallback
      if (data.success) {
        const otpParam = data.otp ? `&otp=${data.otp}` : '';
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}${otpParam}`);
        return;
      }

      // Backend returned error but may still have OTP (email failed scenario)
      if (data.otp) {
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}&otp=${data.otp}`);
        return;
      }

      throw new Error(data.message || "Registration failed.");
    } catch (err) {
      // If the error response contains OTP, still redirect
      if (err?.otp) {
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}&otp=${err.otp}`);
        return;
      }
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-gold text-2xl tracking-[0.4em] uppercase">Chain & Straps</Link>
          <h1 className="font-serif text-white text-3xl mt-6 mb-2">Create Account</h1>
          <p className="text-text-muted text-sm">Join the Chain & Straps community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 text-center rounded">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input name="name" placeholder="Full name" value={form.name} onChange={handleChange}
                className={`w-full bg-bg-secondary border ${errors.name ? "border-red-500" : "border-border-color"} text-white pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange}
                className={`w-full bg-bg-secondary border ${errors.email ? "border-red-500" : "border-border-color"} text-white pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors`}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input name="phone" placeholder="Phone number (optional)" value={form.phone} onChange={handleChange}
                className="w-full bg-bg-secondary border border-border-color text-white pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange}
                className={`w-full bg-bg-secondary border ${errors.password ? "border-red-500" : "border-border-color"} text-white pl-10 pr-12 py-4 text-sm focus:outline-none focus:border-gold transition-colors`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="password" name="confirmPassword" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange}
                className={`w-full bg-bg-secondary border ${errors.confirmPassword ? "border-red-500" : "border-border-color"} text-white pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors`}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gold text-black py-4 text-sm font-bold tracking-widest uppercase hover:bg-[#e8c98a] transition-colors disabled:opacity-60 flex items-center justify-center mt-2"
          >
            {loading
              ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : "CREATE ACCOUNT"
            }
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-text-muted text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:underline tracking-widest uppercase text-xs">Sign In</Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/checkout" className="text-text-muted text-xs hover:text-gold transition-colors tracking-widest uppercase">← Continue as Guest</Link>
        </div>
      </div>
    </div>
  );
}
