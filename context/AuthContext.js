"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE as API, API_BASE } from "@/lib/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("cs_token");
    const storedUser = localStorage.getItem("cs_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async ({ name, email, password, phone }) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    let data = {};
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch { /* non-JSON response */ }
    if (!res.ok || !data.success) throw new Error(data.message || "Registration failed. Please try again.");
    localStorage.setItem("cs_token", data.token);
    localStorage.setItem("cs_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const login = async ({ email, password }) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Backend may return empty body on failure — handle safely
    let data = {};
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch { /* non-JSON response */ }

    if (!res.ok || !data.success) {
      throw new Error(
        data.message ||
        (res.status === 401 ? "Incorrect email or password." : "Login failed. Please try again.")
      );
    }

    localStorage.setItem("cs_token", data.token);
    localStorage.setItem("cs_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
