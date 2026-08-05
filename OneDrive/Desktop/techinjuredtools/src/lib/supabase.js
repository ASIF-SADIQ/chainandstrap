import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Note: In a real Next.js app, consider using @supabase/ssr for server-side auth support.
// This is a basic client setup.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
