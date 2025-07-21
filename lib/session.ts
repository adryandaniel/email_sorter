import { NextApiRequest } from 'next';
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
}

export function getUserIdFromCookies(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  
  const sessionMatch = cookies.match(/session=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : null;
}

export function getUserFromCookies(cookies: string): User | null {
  if (!cookies) return null;
  
  const sessionMatch = cookies.match(/session=([^;]+)/);
  const emailMatch = cookies.match(/user_email=([^;]+)/);
  const nameMatch = cookies.match(/user_name=([^;]+)/);
  
  if (!sessionMatch || !emailMatch || !nameMatch) return null;
  
  return {
    id: sessionMatch[1],
    email: emailMatch[1],
    name: decodeURIComponent(nameMatch[1])
  };
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}