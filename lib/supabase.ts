import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          email_address: string;
          refresh_token: string;
          access_token: string;
          history_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_address: string;
          refresh_token: string;
          access_token: string;
          history_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_address?: string;
          refresh_token?: string;
          access_token?: string;
          history_id?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      emails: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string;
          subject: string;
          sender: string;
          snippet: string;
          summary: string;
          unsubscribe_url: string | null;
          full_content: string;
          gmail_message_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id: string;
          subject: string;
          sender: string;
          snippet: string;
          summary: string;
          unsubscribe_url?: string | null;
          full_content: string;
          gmail_message_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          category_id?: string;
          subject?: string;
          sender?: string;
          snippet?: string;
          summary?: string;
          unsubscribe_url?: string | null;
          full_content?: string;
          gmail_message_id?: string;
          created_at?: string;
        };
      };
    };
  };
};