import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';

// Helper to verify the caller is an admin
async function verifyAdmin(request) {
  // We need to use the regular client to verify the user's session token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;
  
  // Check if user is admin in profiles table
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
    
  return profile?.is_admin === true;
}

export async function POST(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email, password, username, credits, validityDays } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Auto-confirm email
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Compute expiration timestamp (default 30 days / 1 month)
    const days = parseInt(validityDays) || 30;
    const creditsExpireAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const userId = authData.user.id;
    
    let updatePayload = { 
      username: username, 
      credits: parseInt(credits) || 0,
      credits_expire_at: creditsExpireAt 
    };

    let { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);
      
    // Schema fallback if credits_expire_at column has not been added to Supabase yet
    if (profileError && profileError.message.includes('credits_expire_at')) {
      delete updatePayload.credits_expire_at;
      const res = await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('id', userId);
      profileError = res.error;
    }

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user: { id: userId, email, username, credits, credits_expire_at: creditsExpireAt }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Admins can fetch all profiles using the Service Role Key
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 400 });
    }

    // Process profiles to auto-expire credits if 30 days passed
    const now = new Date();
    const processedProfiles = await Promise.all(
      profiles.map(async (p) => {
        if (p.credits_expire_at && new Date(p.credits_expire_at) < now && p.credits > 0) {
          // Auto-expire credits in database
          await supabaseAdmin
            .from('profiles')
            .update({ credits: 0 })
            .eq('id', p.id);
          return { ...p, credits: 0 };
        }
        return p;
      })
    );

    // Fetch auth users to get emails
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    let usersWithEmail = processedProfiles;
    
    if (!authError && authData?.users) {
      const emailMap = {};
      authData.users.forEach(u => {
        emailMap[u.id] = u.email;
      });
      
      usersWithEmail = processedProfiles.map(p => ({
        ...p,
        email: emailMap[p.id] || 'No Email'
      }));
    }

    return NextResponse.json({ users: usersWithEmail });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, credits, validityDays, expireAtDate } = await request.json();

    if (!id || credits === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Compute expiration date
    let creditsExpireAt;
    if (expireAtDate) {
      creditsExpireAt = new Date(expireAtDate).toISOString();
    } else {
      const days = parseInt(validityDays) || 30;
      creditsExpireAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    let updatePayload = { 
      credits: parseInt(credits),
      credits_expire_at: creditsExpireAt
    };

    let columnMissing = false;
    let { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', id);
      
    // Schema fallback if credits_expire_at column has not been added to Supabase yet
    if (profileError && profileError.message.includes('credits_expire_at')) {
      columnMissing = true;
      delete updatePayload.credits_expire_at;
      const res = await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('id', id);
      profileError = res.error;
    }

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (columnMissing) {
      return NextResponse.json({ 
        message: 'Credits updated successfully! Note: Expiration date could not be saved because the "credits_expire_at" column is not created in Supabase yet. Please run the SQL migration command in Supabase SQL Editor.',
        warning: true
      });
    }

    return NextResponse.json({ message: 'Credits & Expiry Date updated successfully', credits_expire_at: creditsExpireAt });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

