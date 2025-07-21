import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
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

        const { emailIds } = req.body;

        if (!Array.isArray(emailIds) || emailIds.length === 0) {
            return res.status(400).json({ error: 'No email IDs provided' });
        }

        const { error } = await supabase
            .from('emails')
            .delete()
            .in('id', emailIds)
            .eq('user_id', userId);

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ error: 'Failed to delete emails' });
        }

        res.status(200).json({ success: true, message: `Deleted ${emailIds.length} emails` });
    } catch (err) {
        console.error('Error in delete emails API:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
