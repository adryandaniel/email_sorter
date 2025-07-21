import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { GmailService } from '../../../lib/gmail';
import { getUserIdFromCookies } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = getUserIdFromCookies(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: accounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (!accounts || accounts.length === 0) {
      return res.status(400).json({ error: 'No accounts found' });
    }

    let totalProcessed = 0;

    for (const account of accounts) {
      try {
        const gmailService = new GmailService(
          account.access_token,
          account.refresh_token
        );

        const result = await gmailService.fetchNewEmails(
          account.history_id,
          account.id,
          userId
        );

        totalProcessed += result.processed;
      } catch (accountError) {
        console.error(`Error processing account ${account.email_address}:`, accountError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Processed ${totalProcessed} emails` 
    });
  } catch (error) {
    console.error('Error in fetch emails API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}