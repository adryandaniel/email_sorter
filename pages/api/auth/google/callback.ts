import { NextApiRequest, NextApiResponse } from 'next';
import { getTokensFromCode, getUserInfo } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error } = req.query;

  if (error) {
    console.error('OAuth error:', error);
    return res.redirect('/?error=oauth_error');
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/?error=missing_code');
  }

  try {
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Get user info
    const userInfo = await getUserInfo(tokens.access_token);
    
    if (!userInfo.email || !userInfo.name) {
      throw new Error('Failed to get user info');
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userInfo.email)
      .single();

    let userId = existingUser?.id;

    // Create user if doesn't exist
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: userInfo.email,
          name: userInfo.name,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
      userId = newUser.id;
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('email_address', userInfo.email)
      .single();

    // Create or update account with tokens
    if (!existingAccount) {
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          email_address: userInfo.email,
          refresh_token: tokens.refresh_token || '',
          access_token: tokens.access_token || '',
          history_id: '',
        });

      if (accountError) {
        console.error('Error creating account:', accountError);
        throw accountError;
      }
    } else {
      // Update existing account with new tokens
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          refresh_token: tokens.refresh_token || existingAccount.refresh_token,
          access_token: tokens.access_token || '',
        })
        .eq('id', existingAccount.id);

      if (updateError) {
        console.error('Error updating account:', updateError);
        throw updateError;
      }
    }

    // Set session cookie
    res.setHeader('Set-Cookie', [
      `session=${userId}; Path=/; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`, // removed HttpOnly
      `user_email=${userInfo.email}; Path=/; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
      `user_name=${encodeURIComponent(userInfo.name)}; Path=/; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    ]);

    res.redirect('/dashboard?success=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}