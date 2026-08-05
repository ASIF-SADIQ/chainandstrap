import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req) {
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

    // Check current credits & expiration
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits, credits_expire_at, is_admin')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.message.includes('credits_expire_at')) {
      const fallback = await supabaseAdmin
        .from('profiles')
        .select('credits, is_admin')
        .eq('id', user.id)
        .single();
      profile = fallback.data;
      profileError = fallback.error;
    }

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Admins have unlimited access and bypass credit deduction & expiration
    if (profile.is_admin) {
      return NextResponse.json({ success: true, remaining: profile.credits || 9999 });
    }

    // Check if credits are expired (30-day timeline)
    if (profile.credits_expire_at && new Date(profile.credits_expire_at) < new Date()) {
      if (profile.credits > 0) {
        // Automatically reset expired credits to 0 in database
        await supabaseAdmin
          .from('profiles')
          .update({ credits: 0 })
          .eq('id', user.id);
      }
      return NextResponse.json({ error: 'Your monthly credits have expired. Please contact admin to top up.' }, { status: 403 });
    }

    if (profile.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    // Deduct 1 credit
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    return NextResponse.json({ success: true, remaining: profile.credits - 1 });
  } catch (error) {
    console.error('Deduct credit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
