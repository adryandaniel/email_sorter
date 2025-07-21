import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

function getUserIdFromCookies(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  
  const sessionMatch = cookies.match(/session=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromCookies(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('id, email_address, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform data to match expected format
      const transformedAccounts = accounts?.map(account => ({
        id: account.id,
        email: account.email_address,
        created_at: account.created_at
      })) || [];

      res.status(200).json(transformedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('email_address', email)
        .eq('user_id', userId);

      if (error) throw error;

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}