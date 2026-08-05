import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile from database using service role key (bypasses RLS issues)
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fallback if credits_expire_at column is not yet present
    if (profileError && profileError.message.includes('credits_expire_at')) {
      const fallback = await supabaseAdmin
        .from('profiles')
        .select('id, username, credits, is_admin, updated_at')
        .eq('id', user.id)
        .single();
      profile = fallback.data;
      profileError = fallback.error;
    }

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Auto-expire credits check for non-admin users
    if (!profile.is_admin && profile.credits_expire_at && new Date(profile.credits_expire_at) < new Date()) {
      if (profile.credits > 0) {
        await supabaseAdmin
          .from('profiles')
          .update({ credits: 0 })
          .eq('id', user.id);
        profile.credits = 0;
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: profile.username || user.email.split('@')[0],
        credits: profile.credits,
        credits_expire_at: profile.credits_expire_at || null,
        is_admin: profile.is_admin || false
      }
    });

  } catch (error) {
    console.error('Fetch user profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
