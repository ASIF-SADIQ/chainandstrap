"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default function SignUp() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Wait a moment then redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  if (!mounted) return null;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <UserPlus className="login-icon" size={40} />
          <h1 className="login-title">Tech Injured Tools</h1>
          <p className="login-subtitle">Create your Workspace Account</p>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--success)", marginBottom: "1rem" }}>Account created successfully!</p>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="login-form">
            {error && <div className="login-error">{error}</div>}
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="text-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="client@techinjured.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="text-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ marginBottom: "1rem" }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
            
            <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--muted-foreground)" }}>Already have an account? </span>
              <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
                Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
