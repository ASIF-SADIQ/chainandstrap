// lib/config.js

// Server-side: use live API directly. Client-side: use Next.js rewrite proxy.
export const API_BASE = typeof window === "undefined"
  ? (process.env.NODE_ENV === "development"
      ? "http://137.184.102.82:5000/api"   // Live backend for SSR in dev
      : "http://137.184.102.82:5000/api")   // Live backend for SSR in production
  : "/backend-api";                          // Client-side always uses Next.js rewrite proxy
