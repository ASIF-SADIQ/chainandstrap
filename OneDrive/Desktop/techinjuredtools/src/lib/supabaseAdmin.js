import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase admin client using the Service Role Key
// IMPORTANT: This key bypasses Row Level Security.
// NEVER use this client in the browser/client-side code.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-supabase-service-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
