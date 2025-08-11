/*
  # Create cookbooks table

  1. New Tables
    - `cookbooks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `author` (text, required)
      - `description` (text)
      - `image_url` (text)
      - `affiliate_link` (text)
      - `cuisine` (text)
      - `cooking_method` (text)
      - `favorites` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `submitted_by` (uuid, references profiles)

  2. Security
    - Enable RLS on `cookbooks` table
    - Add policy for public read access
    - Add policy for authenticated users to submit cookbooks
    - Add policy for users to update their own submitted cookbooks
*/

CREATE TABLE IF NOT EXISTS cookbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  affiliate_link text DEFAULT '',
  cuisine text DEFAULT '',
  cooking_method text DEFAULT '',
  favorites integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE cookbooks ENABLE ROW LEVEL SECURITY;

-- Anyone can read cookbooks
CREATE POLICY "Cookbooks are viewable by everyone"
  ON cookbooks
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can submit new cookbooks
CREATE POLICY "Authenticated users can submit cookbooks"
  ON cookbooks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own submitted cookbooks
CREATE POLICY "Users can update own cookbooks"
  ON cookbooks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cookbooks_created_at ON cookbooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cookbooks_favorites ON cookbooks(favorites DESC);
CREATE INDEX IF NOT EXISTS idx_cookbooks_cuisine ON cookbooks(cuisine);
CREATE INDEX IF NOT EXISTS idx_cookbooks_cooking_method ON cookbooks(cooking_method);