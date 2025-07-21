'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    
    const cookies = document.cookie;
    const sessionMatch = cookies.match(/session=([^;]+)/);
    const emailMatch = cookies.match(/user_email=([^;]+)/);
    const nameMatch = cookies.match(/user_name=([^;]+)/);

    console.log(">>>>>>>>>>>", cookies)
    
    if (sessionMatch && emailMatch && nameMatch) {
      setUser({
        id: sessionMatch[1],
        email: emailMatch[1],
        name: decodeURIComponent(nameMatch[1])
      });
    }
    
    setLoading(false);
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return { user, loading, signOut, checkAuth };
}