import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear session cookies
  res.setHeader('Set-Cookie', [
    'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    'user_email=; Path=/; SameSite=Strict; Max-Age=0',
    'user_name=; Path=/; SameSite=Strict; Max-Age=0'
  ]);

  res.status(200).json({ success: true });
}