"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();
        
      if (profile?.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Lock className="login-icon" size={40} />
          <h1 className="login-title">Tech Injured Tools</h1>
          <p className="login-subtitle">Secure Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
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
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ marginBottom: "1rem" }}
          >
            {loading ? "Authenticating..." : "Login to Workspace"}
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem" }}>
            <span style={{ color: "var(--muted-foreground)" }}>Don't have an account? </span>
            <Link href="/signup" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
