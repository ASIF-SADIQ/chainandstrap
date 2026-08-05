import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/"/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
  console.log("🚀 Creating Super Admin bypass account...");
  
  const email = 'superadmin@gmail.com';
  const password = 'password123';

  // 1. Create User in Auth (Bypasses rate limits and auto-confirms)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true 
  });

  if (authError) {
    console.error("❌ Auth Error:", authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`✅ User created in Auth with ID: ${userId}`);

  // 2. Make them an Admin in profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      is_admin: true, 
      credits: 9999,
      username: 'Super_Admin' 
    })
    .eq('id', userId);

  if (profileError) {
    console.error("❌ Profile Update Error:", profileError.message);
  } else {
    console.log("✅ Profile updated to Admin successfully!");
    console.log("\n🎉 ALL DONE! Now go to http://localhost:3000/login and use:");
    console.log("Email: superadmin@gmail.com");
    console.log("Password: password123");
  }
}

createSuperAdmin();
