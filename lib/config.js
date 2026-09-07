// lib/config.js

// Connect to localhost:5000 during Server-Side Rendering (Next.js server on EC2), 
// but use the public HTTPS URL in the user's browser.
export const API_BASE = typeof window === 'undefined' 
    ? "http://localhost:5000/api" 
    : "https://chainandstrap.store/api";
