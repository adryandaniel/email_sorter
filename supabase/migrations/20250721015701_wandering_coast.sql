/*
  # Email Sorter Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `email_address` (text)
      - `refresh_token` (text)
      - `access_token` (text)
      - `history_id` (text)
      - `created_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `emails`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `account_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `subject` (text)
      - `sender` (text)
      - `snippet` (text)
      - `summary` (text)
      - `unsubscribe_url` (text, nullable)
      - `full_content` (text)
      - `gmail_message_id` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email_address text NOT NULL,
  refresh_token text NOT NULL,
  access_token text NOT NULL,
  history_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  sender text NOT NULL DEFAULT '',
  snippet text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  unsubscribe_url text,
  full_content text NOT NULL DEFAULT '',
  gmail_message_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);

CREATE POLICY "Users can read own accounts" ON accounts FOR ALL TO authenticated USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can read own categories" ON categories FOR ALL TO authenticated USING (user_id::text = auth.uid()::text);
CREATE POLICY "Users can read own emails" ON emails FOR ALL TO authenticated USING (user_id::text = auth.uid()::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS emails_user_id_idx ON emails(user_id);
CREATE INDEX IF NOT EXISTS emails_category_id_idx ON emails(category_id);
CREATE INDEX IF NOT EXISTS emails_gmail_message_id_idx ON emails(gmail_message_id);